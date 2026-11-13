-- Extend player accounts without changing existing IDs, friendships or game tickets.
-- Real names are returned only in the caller's own dashboard profile.
alter table public.game_profiles
  add column real_name text not null default '' check (char_length(btrim(real_name)) <= 50 and real_name !~ '[[:cntrl:]]'),
  add column avatar_path text check (avatar_path is null or avatar_path ~ ('^' || id::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$'));

create function public.can_manage_player_avatar(object_name text, require_unused boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null
    and object_name ~ ('^' || auth.uid()::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$')
    and exists(select 1 from public.game_profiles p where p.id=auth.uid()
      and (not require_unused or p.avatar_path is distinct from object_name));
$$;
revoke all on function public.can_manage_player_avatar(text,boolean) from public,anon;
grant execute on function public.can_manage_player_avatar(text,boolean) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('player-avatars','player-avatars',true,2097152,array['image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

-- Public URLs display pictures; object listing and mutations are owner-scoped.
create policy "players read their avatar objects" on storage.objects for select to authenticated
  using(bucket_id='player-avatars' and owner_id=(select auth.uid())::text);
create policy "players upload their own avatars" on storage.objects for insert to authenticated
  with check(bucket_id='player-avatars' and owner_id=(select auth.uid())::text and public.can_manage_player_avatar(name,true));
create policy "players delete unused avatars" on storage.objects for delete to authenticated
  using(bucket_id='player-avatars' and owner_id=(select auth.uid())::text and public.can_manage_player_avatar(name,true));
-- No UPDATE policy: each upload uses a fresh path to avoid cache and replacement races.

-- Signup metadata is untrusted; constraints validate it and never assign a role.
-- Older/admin accounts without player metadata keep the existing onboarding flow.
create function public.handle_new_player() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_user_meta_data ? 'handle' then
    if coalesce(btrim(new.raw_user_meta_data->>'real_name'),'')='' then
      raise exception '이름을 입력해 주세요.';
    end if;
    insert into public.game_profiles(id,handle,display_name,real_name)
      values(new.id,lower(btrim(new.raw_user_meta_data->>'handle')),
        btrim(new.raw_user_meta_data->>'display_name'),btrim(new.raw_user_meta_data->>'real_name'));
  end if;
  return new;
end;
$$;
revoke all on function public.handle_new_player() from public,anon,authenticated;
create trigger on_auth_player_created after insert on auth.users for each row execute function public.handle_new_player();

create or replace function public.game_social(action text, payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  target uuid;
  friendship public.game_friendships;
  room public.game_sessions;
  invitation public.game_invites;
  player public.game_profiles;
  secret_key text;
  ticket_payload text;
  ticket_expiry bigint;
  previous_path text;
  search_term text;
begin
  if me is null then raise exception '로그인이 필요합니다.' using errcode = '28000'; end if;
  -- Serialize social mutations so reciprocal requests, blocks and invite acceptance
  -- cannot race. This lock is deliberately scoped to this small club feature.
  if action not in ('dashboard','search_players') then perform pg_advisory_xact_lock(20261113, 1); end if;

  if action = 'save_profile' then
    if payload ? 'real_name' and coalesce(btrim(payload->>'real_name'),'')='' then
      raise exception '이름을 입력해 주세요.';
    end if;
    insert into public.game_profiles(id,handle,display_name,bio,avatar,real_name)
    values(me,lower(btrim(payload->>'handle')),btrim(payload->>'display_name'),
      coalesce(payload->>'bio',''),coalesce(payload->>'avatar','coral'),coalesce(btrim(payload->>'real_name'),''))
    on conflict(id) do update set handle=excluded.handle,display_name=excluded.display_name,
      bio=excluded.bio,avatar=excluded.avatar,
      real_name=case when payload ? 'real_name' then excluded.real_name else public.game_profiles.real_name end;
    return jsonb_build_object('ok',true);
  end if;

  if action = 'dashboard' then
    return jsonb_build_object(
      'profile',(select to_jsonb(p) from public.game_profiles p where p.id=me),
      'relationships',coalesce((select jsonb_agg(jsonb_build_object(
        'id',f.id,'status',f.status,'incoming',f.recipient=me,'user_id',p.id,
        'handle',p.handle,'display_name',p.display_name,'avatar',p.avatar,'bio',p.bio,'avatar_path',p.avatar_path)
        order by f.created_at desc) from public.game_friendships f
        join public.game_profiles p on p.id=case when f.requester=me then f.recipient else f.requester end
        where me in(f.requester,f.recipient)), '[]'::jsonb),
      'blocks',coalesce((select jsonb_agg(jsonb_build_object('user_id',p.id,'handle',p.handle,'display_name',p.display_name))
        from public.game_blocks b join public.game_profiles p on p.id=b.target_id where b.owner_id=me),'[]'::jsonb),
      'rooms',coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at desc) from public.game_sessions s
        where s.host_id=me and s.closed_at is null and s.expires_at>now()),'[]'::jsonb),
      'invites',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'session_id',s.id,'title',s.title,
        'host_name',p.display_name,'status',i.status,'expires_at',i.expires_at) order by i.expires_at desc)
        from public.game_invites i join public.game_sessions s on s.id=i.session_id
        join public.game_profiles p on p.id=s.host_id where i.recipient=me and i.status<>'declined'
        and i.expires_at>now() and s.closed_at is null and s.expires_at>now()
        and not exists(select 1 from public.game_blocks b where (b.owner_id=me and b.target_id=s.host_id)
          or (b.owner_id=s.host_id and b.target_id=me))), '[]'::jsonb));
  end if;

  select * into player from public.game_profiles where id=me;
  if not found then raise exception '먼저 게임 프로필을 만들어 주세요.'; end if;

  if action = 'set_avatar' then
    previous_path := player.avatar_path;
    if coalesce(payload->>'path','') <> '' then
      if not public.can_manage_player_avatar(payload->>'path') or not exists (
        select 1 from storage.objects where bucket_id='player-avatars' and name=payload->>'path'
          and owner_id=me::text and metadata->>'mimetype'='image/webp'
      ) then raise exception '업로드한 내 사진만 사용할 수 있습니다.'; end if;
    end if;
    update public.game_profiles set avatar_path=nullif(payload->>'path','') where id=me;
    return jsonb_build_object('ok',true,'previous_path',case when previous_path=payload->>'path' then null else previous_path end);
  end if;

  if action = 'search_players' then
    search_term := lower(btrim(payload->>'query'));
    if search_term is null or char_length(search_term) not between 2 and 32 or search_term ~ '[[:cntrl:]]' then
      raise exception '사용자 ID 또는 닉네임을 2~32자로 입력해 주세요.';
    end if;
    return coalesce((select jsonb_agg(to_jsonb(result)) from (
      select p.id,p.handle,p.display_name,p.bio,p.avatar,p.avatar_path,
        f.status as relationship_status,coalesce(f.recipient=me,false) as incoming
      from public.game_profiles p left join public.game_friendships f
        on (f.requester=me and f.recipient=p.id) or (f.recipient=me and f.requester=p.id)
      where p.id<>me and (strpos(p.handle,search_term)>0 or strpos(lower(p.display_name),search_term)>0)
        and not exists(select 1 from public.game_blocks b
          where (b.owner_id=me and b.target_id=p.id) or (b.owner_id=p.id and b.target_id=me))
      order by (p.handle=search_term) desc,p.handle limit 20
    ) result),'[]'::jsonb);
  end if;

  if action = 'request_friend' then
    select id into target from public.game_profiles where handle=lower(btrim(payload->>'handle'));
    if target is null or target=me or exists(select 1 from public.game_blocks
      where (owner_id=me and target_id=target) or (owner_id=target and target_id=me)) then
      raise exception '이 사용자에게 친구 요청을 보낼 수 없습니다.';
    end if;
    select * into friendship from public.game_friendships
      where (requester=me and recipient=target) or (requester=target and recipient=me);
    if found then return jsonb_build_object('ok',true,'friend_status',
      case when friendship.status='accepted' then 'accepted' when friendship.recipient=me then 'incoming' else 'outgoing' end); end if;
    if (select count(*) from public.game_friendships where requester=me and status='pending') >= 50 then
      raise exception '보낸 요청을 정리한 뒤 다시 시도해 주세요.';
    end if;
    insert into public.game_friendships(requester,recipient) values(me,target);
    return jsonb_build_object('ok',true,'friend_status','sent');
  elsif action in ('accept_friend','remove_friend') then
    select * into friendship from public.game_friendships where id=(payload->>'id')::uuid;
    if not found or me not in(friendship.requester,friendship.recipient) then raise exception '요청을 찾을 수 없습니다.'; end if;
    if action='accept_friend' then
      if friendship.recipient<>me or friendship.status<>'pending' then raise exception '받은 요청만 수락할 수 있습니다.'; end if;
      update public.game_friendships set status='accepted' where id=friendship.id;
    else
      delete from public.game_invites i using public.game_sessions s
        where i.session_id=s.id and ((s.host_id=friendship.requester and i.recipient=friendship.recipient)
          or (s.host_id=friendship.recipient and i.recipient=friendship.requester));
      delete from public.game_friendships where id=friendship.id;
    end if;
  elsif action in ('block_user','unblock_user') then
    if action='block_user' then
      select id into target from public.game_profiles where handle=lower(btrim(payload->>'handle'));
    else target := (payload->>'user_id')::uuid; end if;
    if target is null or target=me then raise exception '사용자를 확인해 주세요.'; end if;
    if action='unblock_user' then
      delete from public.game_blocks where owner_id=me and target_id=target;
    else
      insert into public.game_blocks values(me,target) on conflict do nothing;
      delete from public.game_friendships where (requester=me and recipient=target) or (requester=target and recipient=me);
      delete from public.game_invites i using public.game_sessions s where i.session_id=s.id
        and ((s.host_id=me and i.recipient=target) or (s.host_id=target and i.recipient=me));
    end if;
  elsif action='create_room' then
    if left(coalesce(payload->>'endpoint',''),4) = 'eos:' then
      if coalesce(payload->>'endpoint','') !~ '^eos:[0-9a-fA-F]{32}:[0-9a-fA-F]{32}$'
        or split_part(payload->>'endpoint',':',2) = repeat('0',32)
        or split_part(payload->>'endpoint',':',3) = repeat('0',32) then
        raise exception '게임에서 복사한 EOS 방 코드를 입력해 주세요.';
      end if;
    else
    if coalesce(payload->>'endpoint','') !~ '^([a-zA-Z0-9.-]+|\[[0-9a-fA-F:]+\]):[0-9]{1,5}$' then
      raise exception '접속 주소는 호스트 주소:포트 형식이어야 합니다.';
    end if;
    if substring(payload->>'endpoint' from ':([0-9]+)$')::int not between 1 and 65535 then
      raise exception '포트는 1부터 65535까지입니다.';
    end if;
    end if;
    update public.game_sessions set closed_at=now() where host_id=me and closed_at is null;
    insert into public.game_sessions(host_id,title,endpoint,transport)
      values(me,btrim(payload->>'title'),case when left(payload->>'endpoint',4)='eos:' then lower(payload->>'endpoint') else payload->>'endpoint' end,
        case when left(payload->>'endpoint',4)='eos:' then 'eos_p2p' else 'direct_udp' end) returning * into room;
    insert into game_private.session_keys(session_id) values(room.id);
    return jsonb_build_object('ok',true,'session_id',room.id);
  elsif action in ('close_room','invite_friend','host_bundle') then
    select * into room from public.game_sessions where id=(payload->>'session_id')::uuid and host_id=me
      and closed_at is null and expires_at>now();
    if not found then raise exception '진행 중인 내 방을 찾을 수 없습니다.'; end if;
    if action='close_room' then
      update public.game_sessions set closed_at=now() where id=room.id;
    elsif action='invite_friend' then
      target := (payload->>'user_id')::uuid;
      if not exists(select 1 from public.game_friendships where status='accepted'
        and ((requester=me and recipient=target) or (requester=target and recipient=me))) then
        raise exception '친구에게만 초대할 수 있습니다.';
      end if;
      insert into public.game_invites(session_id,recipient) values(room.id,target)
        on conflict(session_id,recipient) do update set status='pending',expires_at=now()+interval '15 minutes';
    else
      select secret into secret_key from game_private.session_keys where session_id=room.id;
      return jsonb_build_object('version',1,'mode','host','transport',room.transport,'session_id',room.id,
        'address',room.endpoint,'expires_at',floor(extract(epoch from room.expires_at)),
        'host_key',secret_key,'profile',jsonb_build_object('id',player.id,'display_name',player.display_name));
    end if;
  elsif action in ('accept_invite','decline_invite','join_bundle') then
    select * into invitation from public.game_invites where id=(payload->>'id')::uuid and recipient=me
      and status in('pending','accepted') and expires_at>now();
    if not found then raise exception '초대가 만료되었거나 취소되었습니다.'; end if;
    select * into room from public.game_sessions where id=invitation.session_id and closed_at is null and expires_at>now();
    if not found then raise exception '종료된 방입니다.'; end if;
    if not exists(select 1 from public.game_friendships where status='accepted'
      and ((requester=me and recipient=room.host_id) or (requester=room.host_id and recipient=me))) then
      raise exception '참가할 수 없는 초대입니다.';
    end if;
    if action='accept_invite' then update public.game_invites set status='accepted' where id=invitation.id;
    elsif action='decline_invite' then update public.game_invites set status='declined' where id=invitation.id;
    else
      if invitation.status<>'accepted' then raise exception '초대를 먼저 수락해 주세요.'; end if;
      select secret into secret_key from game_private.session_keys where session_id=room.id;
      ticket_expiry := floor(extract(epoch from least(now()+interval '5 minutes',room.expires_at,invitation.expires_at)));
      ticket_payload := room.id::text || '|' || me::text || '|' || ticket_expiry::text || '|'
        || encode(extensions.gen_random_bytes(16),'hex') || '|' || encode(convert_to(player.display_name,'UTF8'),'hex');
      return jsonb_build_object('version',1,'mode','join','transport',room.transport,'session_id',room.id,
        'address',room.endpoint,'expires_at',ticket_expiry,
        'ticket',ticket_payload || '.' || encode(extensions.hmac(ticket_payload,secret_key,'sha256'),'hex'),
        'profile',jsonb_build_object('id',player.id,'display_name',player.display_name));
    end if;
  else raise exception '지원하지 않는 요청입니다.'; end if;
  return jsonb_build_object('ok',true);
end;
$$;
revoke all on function public.game_social(text,jsonb) from public,anon;
grant execute on function public.game_social(text,jsonb) to authenticated;

