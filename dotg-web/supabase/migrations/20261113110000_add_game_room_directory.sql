-- Live rooms use the existing signed UDP sessions. Device credentials are scoped
-- to room operations; they never grant Supabase or website administrator access.
create table game_private.game_devices (
  token_hash text primary key,
  code text not null unique,
  user_id uuid references public.game_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '10 minutes'
);
create table game_private.room_presence (
  session_id uuid primary key references public.game_sessions(id) on delete cascade,
  device_hash text not null references game_private.game_devices(token_hash) on delete cascade,
  code text not null unique,
  map_id text not null check (map_id in ('fairy-kingdom-castle','elf-city')),
  players int not null default 1 check (players between 1 and 12),
  state text not null default 'waiting' check (state in ('waiting','playing','finished')),
  last_seen timestamptz not null default now()
);
create index room_presence_alive on game_private.room_presence(last_seen);
alter table game_private.game_devices enable row level security;
alter table game_private.room_presence enable row level security;
revoke all on game_private.game_devices, game_private.room_presence from public,anon,authenticated;

create function public.game_rooms(action text, payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  device game_private.game_devices;
  presence game_private.room_presence;
  room public.game_sessions;
  player public.game_profiles;
  secret_token text;
  token_hash text;
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
    token_hash := encode(extensions.digest(payload->>'token','sha256'),'hex');
    select * into device from game_private.game_devices d where d.token_hash=game_rooms.token_hash and d.expires_at>now();
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
    if endpoint is null or length(endpoint)>260 or endpoint !~ '^([a-zA-Z0-9.-]+|\[[0-9a-fA-F:]+\]):[0-9]{1,5}$'
      or endpoint ~ '^(0\.0\.0\.0|\[::\]):' then raise exception '다른 PC가 접속할 수 있는 주소:포트를 입력해 주세요.'; end if;
    if substring(endpoint from ':([0-9]+)$')::int not between 1 and 65535 then raise exception '포트를 확인해 주세요.'; end if;
    if coalesce(char_length(btrim(payload->>'title')),0) not between 1 and 60 or payload->>'title' ~ '[[:cntrl:]]' then
      raise exception '방 이름은 1~60자로 입력해 주세요.';
    end if;
    if coalesce(payload->>'map_id','') not in ('fairy-kingdom-castle','elf-city') then raise exception '맵을 확인해 주세요.'; end if;
    if exists(select 1 from public.game_sessions where host_id=me and created_at>now()-interval '5 seconds') then
      raise exception '잠시 후 방을 다시 만들어 주세요.';
    end if;
    update public.game_sessions set closed_at=now() where host_id=me and closed_at is null;
    insert into public.game_sessions(host_id,title,endpoint) values(me,btrim(payload->>'title'),endpoint) returning * into room;
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
