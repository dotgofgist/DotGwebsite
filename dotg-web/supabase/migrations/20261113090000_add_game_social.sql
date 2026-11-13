-- Player data is separate from the website's privileged profiles.role column.
create schema if not exists game_private;
revoke all on schema game_private from public, anon, authenticated;

create table public.game_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 32 and display_name !~ '[[:cntrl:]]'),
  bio text not null default '' check (char_length(bio) <= 240),
  avatar text not null default 'coral' check (avatar in ('coral','mint','blue','violet')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_game_profiles_updated_at before update on public.game_profiles
  for each row execute function public.set_updated_at();

create table public.game_friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references public.game_profiles(id) on delete cascade,
  recipient uuid not null references public.game_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  check (requester <> recipient)
);
create unique index game_friendships_pair on public.game_friendships (least(requester,recipient), greatest(requester,recipient));
create index game_friendships_recipient on public.game_friendships(recipient);
create table public.game_blocks (
  owner_id uuid not null references public.game_profiles(id) on delete cascade,
  target_id uuid not null references public.game_profiles(id) on delete cascade,
  primary key(owner_id,target_id), check(owner_id <> target_id)
);
create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.game_profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 60),
  endpoint text not null check (length(endpoint) <= 260),
  transport text not null default 'direct_udp' check (transport = 'direct_udp'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '2 hours',
  closed_at timestamptz
);
create index game_sessions_host on public.game_sessions(host_id);
create table public.game_invites (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  recipient uuid not null references public.game_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  expires_at timestamptz not null default now() + interval '15 minutes',
  unique(session_id,recipient)
);
create index game_invites_recipient on public.game_invites(recipient);
create table game_private.session_keys (
  session_id uuid primary key references public.game_sessions(id) on delete cascade,
  secret text not null default encode(extensions.gen_random_bytes(32),'hex')
);
alter table public.game_profiles enable row level security;
alter table public.game_friendships enable row level security;
alter table public.game_blocks enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_invites enable row level security;
alter table game_private.session_keys enable row level security;
-- All access is through the authenticated, scoped RPC below. No broad table policies.
revoke all on public.game_profiles, public.game_friendships, public.game_blocks,
  public.game_sessions, public.game_invites from anon, authenticated;
revoke all on game_private.session_keys from public, anon, authenticated;

create function public.game_social(action text, payload jsonb default '{}'::jsonb)
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
begin
  if me is null then raise exception '로그인이 필요합니다.' using errcode = '28000'; end if;
  -- Serialize social mutations so reciprocal requests, blocks and invite acceptance
  -- cannot race. This lock is deliberately scoped to this small club feature.
  if action <> 'dashboard' then perform pg_advisory_xact_lock(20261113, 1); end if;

  if action = 'save_profile' then
    insert into public.game_profiles(id,handle,display_name,bio,avatar)
    values(me,lower(btrim(payload->>'handle')),btrim(payload->>'display_name'),
      coalesce(payload->>'bio',''),coalesce(payload->>'avatar','coral'))
    on conflict(id) do update set handle=excluded.handle,display_name=excluded.display_name,
      bio=excluded.bio,avatar=excluded.avatar;
    return jsonb_build_object('ok',true);
  end if;

  if action = 'dashboard' then
    return jsonb_build_object(
      'profile',(select to_jsonb(p) from public.game_profiles p where p.id=me),
      'relationships',coalesce((select jsonb_agg(jsonb_build_object(
        'id',f.id,'status',f.status,'incoming',f.recipient=me,'user_id',p.id,
        'handle',p.handle,'display_name',p.display_name,'avatar',p.avatar,'bio',p.bio)
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

  if action = 'request_friend' then
    select id into target from public.game_profiles where handle=lower(btrim(payload->>'handle'));
    if target is null or target=me or exists(select 1 from public.game_blocks
      where (owner_id=me and target_id=target) or (owner_id=target and target_id=me)) then
      raise exception '이 사용자에게 친구 요청을 보낼 수 없습니다.';
    end if;
    if (select count(*) from public.game_friendships where requester=me and status='pending') >= 50 then
      raise exception '보낸 요청을 정리한 뒤 다시 시도해 주세요.';
    end if;
    insert into public.game_friendships(requester,recipient) values(me,target) on conflict do nothing;
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
    if coalesce(payload->>'endpoint','') !~ '^([a-zA-Z0-9.-]+|\[[0-9a-fA-F:]+\]):[0-9]{1,5}$' then
      raise exception '접속 주소는 호스트 주소:포트 형식이어야 합니다.';
    end if;
    if substring(payload->>'endpoint' from ':([0-9]+)$')::int not between 1 and 65535 then
      raise exception '포트는 1부터 65535까지입니다.';
    end if;
    update public.game_sessions set closed_at=now() where host_id=me and closed_at is null;
    insert into public.game_sessions(host_id,title,endpoint) values(me,btrim(payload->>'title'),payload->>'endpoint') returning * into room;
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
