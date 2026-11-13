-- Add EOS room codes without changing existing UDP rooms or invitation signatures.
-- The game checks that host bundles belong to the logged-in EOS device and
-- still authenticates DotG participants using the signed, single-use ticket.
alter table public.game_sessions drop constraint game_sessions_transport_check;
alter table public.game_sessions add constraint game_sessions_transport_check
  check (transport in ('direct_udp','eos_p2p'));
alter table public.game_sessions add constraint game_sessions_eos_endpoint_check
  check (transport <> 'eos_p2p' or (endpoint ~ '^eos:[0-9a-f]{32}:[0-9a-f]{32}$'
    and split_part(endpoint,':',2) <> repeat('0',32) and split_part(endpoint,':',3) <> repeat('0',32)));

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

-- The live room directory uses the same EOS endpoint and signed admission.
create or replace function public.game_rooms(action text, payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  device game_private.game_devices;
  presence game_private.room_presence;
  room public.game_sessions;
  player public.game_profiles;
  secret_token text;
  requested_hash text;
  public_code text;
  secret_key text;
  ticket_payload text;
  ticket_expiry bigint;
  endpoint text;
  result jsonb;
begin
  if action='list' then
    return jsonb_build_object('rooms',coalesce((select jsonb_agg(r order by r.created_at desc) from (
      select p.code,s.title,g.display_name as host_name,p.map_id,p.players,12 as capacity,p.state,s.created_at
      from game_private.room_presence p join public.game_sessions s on s.id=p.session_id
      join public.game_profiles g on g.id=s.host_id
      where p.last_seen>now()-interval '60 seconds' and s.closed_at is null and s.expires_at>now()
      order by s.created_at desc limit 100
    ) r),'[]'::jsonb));
  end if;

  -- Share the social lock: replacing/closing a room and issuing a ticket are atomic.
  perform pg_advisory_xact_lock(20261113,1);
  if action='link_begin' then
    delete from game_private.game_devices where expires_at<=now();
    if (select count(*) from game_private.game_devices where user_id is null) >= 1000 then
      raise exception '연결 요청이 많습니다. 잠시 후 다시 시도해 주세요.';
    end if;
    secret_token := encode(extensions.gen_random_bytes(32),'hex');
    loop
      public_code := upper(encode(extensions.gen_random_bytes(4),'hex'));
      exit when not exists(select 1 from game_private.game_devices where code=public_code);
    end loop;
    insert into game_private.game_devices(token_hash,code)
      values(encode(extensions.digest(secret_token,'sha256'),'hex'),public_code);
    return jsonb_build_object('token',secret_token,'code',public_code,'expires_in',600);
  elsif action='link_approve' then
    if me is null then raise exception '로그인이 필요합니다.' using errcode='28000'; end if;
    if not exists(select 1 from public.game_profiles where id=me) then raise exception '먼저 게임 프로필을 저장해 주세요.'; end if;
    update game_private.game_devices set user_id=me,expires_at=now()+interval '12 hours'
      where code=upper(btrim(payload->>'code')) and user_id is null and expires_at>now();
    if not found then raise exception '연결 코드가 만료되었거나 이미 사용되었습니다.'; end if;
    return jsonb_build_object('ok',true);
  end if;

  if payload ? 'token' then
    requested_hash := encode(extensions.digest(payload->>'token','sha256'),'hex');
    select * into device from game_private.game_devices d where d.token_hash=requested_hash and d.expires_at>now();
    if not found then raise exception '게임 계정을 다시 연결해 주세요.' using errcode='28000'; end if;
    me := device.user_id;
  end if;
  if action='link_status' then
    if device.token_hash is null then raise exception '연결 정보를 확인해 주세요.' using errcode='28000'; end if;
    return jsonb_build_object('connected',me is not null,'display_name',(select display_name from public.game_profiles where id=me));
  end if;
  if me is null then raise exception '웹 계정을 먼저 연결해 주세요.' using errcode='28000'; end if;
  select * into player from public.game_profiles where id=me;
  if not found then raise exception '먼저 게임 프로필을 저장해 주세요.'; end if;

  if action='create' then
    if device.token_hash is null then raise exception '게임에서 방을 만들어 주세요.'; end if;
    endpoint := btrim(payload->>'endpoint');
    if left(coalesce(endpoint,''),4) = 'eos:' then
      endpoint := lower(endpoint);
      if endpoint !~ '^eos:[0-9a-f]{32}:[0-9a-f]{32}$'
        or split_part(endpoint,':',2)=repeat('0',32) or split_part(endpoint,':',3)=repeat('0',32) then
        raise exception 'EOS 방 코드를 확인해 주세요.';
      end if;
    else
    if endpoint is null or length(endpoint)>260 or endpoint !~ '^([a-zA-Z0-9.-]+|\[[0-9a-fA-F:]+\]):[0-9]{1,5}$'
      or endpoint ~ '^(0\.0\.0\.0|\[::\]):' then raise exception '다른 PC가 접속할 수 있는 주소:포트를 입력해 주세요.'; end if;
    if substring(endpoint from ':([0-9]+)$')::int not between 1 and 65535 then raise exception '포트를 확인해 주세요.'; end if;
    end if;
    if coalesce(char_length(btrim(payload->>'title')),0) not between 1 and 60 or payload->>'title' ~ '[[:cntrl:]]' then
      raise exception '방 이름은 1~60자로 입력해 주세요.';
    end if;
    if coalesce(payload->>'map_id','') not in ('fairy-kingdom-castle','elf-city') then raise exception '맵을 확인해 주세요.'; end if;
    if exists(select 1 from public.game_sessions where host_id=me and created_at>now()-interval '5 seconds') then
      raise exception '잠시 후 방을 다시 만들어 주세요.';
    end if;
    update public.game_sessions set closed_at=now() where host_id=me and closed_at is null;
    insert into public.game_sessions(host_id,title,endpoint,transport) values(me,btrim(payload->>'title'),endpoint,case when left(endpoint,4)='eos:' then 'eos_p2p' else 'direct_udp' end) returning * into room;
    insert into game_private.session_keys(session_id) values(room.id) returning secret into secret_key;
    loop
      public_code := upper(encode(extensions.gen_random_bytes(4),'hex'));
      exit when not exists(select 1 from game_private.room_presence where code=public_code);
    end loop;
    insert into game_private.room_presence(session_id,device_hash,code,map_id)
      values(room.id,device.token_hash,public_code,payload->>'map_id');
    result := jsonb_build_object('version',1,'mode','host','transport',room.transport,'session_id',room.id,
      'address',room.endpoint,'expires_at',floor(extract(epoch from room.expires_at)),
      'host_key',secret_key,'profile',jsonb_build_object('id',player.id,'display_name',player.display_name));
    return jsonb_build_object('code',public_code,'session',result);
  elsif action in ('heartbeat','close') then
    select p.* into presence from game_private.room_presence p join public.game_sessions s on s.id=p.session_id
      where p.code=upper(btrim(payload->>'code')) and s.host_id=me and p.device_hash=device.token_hash;
    if not found then raise exception '내 방을 찾을 수 없습니다.'; end if;
    if action='close' then
      update public.game_sessions set closed_at=coalesce(closed_at,now()) where id=presence.session_id;
    else
      if not exists(select 1 from public.game_sessions where id=presence.session_id and closed_at is null and expires_at>now()) then
        raise exception '종료된 방입니다.';
      end if;
      if coalesce(payload->>'map_id','') not in ('fairy-kingdom-castle','elf-city')
        or coalesce(payload->>'state','') not in ('waiting','playing','finished')
        or coalesce(payload->>'players','') !~ '^([1-9]|1[0-2])$' then raise exception '방 상태를 확인해 주세요.'; end if;
      update game_private.room_presence set last_seen=now(),map_id=payload->>'map_id',
        players=(payload->>'players')::int,state=payload->>'state' where session_id=presence.session_id;
    end if;
    return jsonb_build_object('ok',true);
  elsif action='join' then
    select * into presence from game_private.room_presence where code=upper(btrim(payload->>'code'))
      and last_seen>now()-interval '60 seconds';
    if not found then raise exception '방을 찾을 수 없어요. 코드를 확인하거나 목록을 새로고침해 주세요.'; end if;
    select * into room from public.game_sessions where id=presence.session_id and closed_at is null and expires_at>now();
    if not found then raise exception '종료된 방입니다.'; end if;
    if room.host_id=me then raise exception '이미 내 계정으로 만든 방입니다.'; end if;
    if presence.players>=12 then raise exception '방이 가득 찼습니다.'; end if;
    if exists(select 1 from public.game_blocks where (owner_id=me and target_id=room.host_id) or (owner_id=room.host_id and target_id=me)) then
      raise exception '이 방에 참여할 수 없습니다.';
    end if;
    select secret into secret_key from game_private.session_keys where session_id=room.id;
    ticket_expiry := floor(extract(epoch from least(now()+interval '5 minutes',room.expires_at)));
    ticket_payload := room.id::text || '|' || me::text || '|' || ticket_expiry::text || '|'
      || encode(extensions.gen_random_bytes(16),'hex') || '|' || encode(convert_to(player.display_name,'UTF8'),'hex');
    result := jsonb_build_object('version',1,'mode','join','transport',room.transport,'session_id',room.id,
      'address',room.endpoint,'expires_at',ticket_expiry,
      'ticket',ticket_payload || '.' || encode(extensions.hmac(ticket_payload,secret_key,'sha256'),'hex'),
      'profile',jsonb_build_object('id',player.id,'display_name',player.display_name));
    return jsonb_build_object('code',presence.code,'session',result);
  else raise exception '지원하지 않는 요청입니다.'; end if;
end;
$$;
revoke all on function public.game_rooms(text,jsonb) from public;
grant execute on function public.game_rooms(text,jsonb) to anon,authenticated;
