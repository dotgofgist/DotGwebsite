-- Password authentication stays in Supabase Auth. Only a verified user can mint
-- a scoped game device session; no user id is accepted from the game client.
create function public.game_native_login()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  credential text := encode(extensions.gen_random_bytes(32),'hex');
  public_code text;
begin
  if me is null then raise exception '로그인이 필요합니다.' using errcode='28000'; end if;
  -- Legacy users can finish their player profile in game after signing in.
  insert into public.game_profiles(id,handle,display_name)
    values(me,'p_' || left(replace(me::text,'-',''),22),'새 플레이어')
    on conflict(id) do nothing;
  loop
    public_code := upper(encode(extensions.gen_random_bytes(4),'hex'));
    exit when not exists(select 1 from game_private.game_devices where code=public_code);
  end loop;
  insert into game_private.game_devices(token_hash,code,user_id,expires_at)
    values(encode(extensions.digest(credential,'sha256'),'hex'),public_code,me,now()+interval '12 hours');
  return jsonb_build_object('device_token',credential,'profile',
    (select jsonb_build_object('display_name',p.display_name,'handle',p.handle,'avatar',p.avatar,'avatar_path',p.avatar_path)
      from public.game_profiles p where p.id=me));
end;
$$;
revoke all on function public.game_native_login() from public,anon;
grant execute on function public.game_native_login() to authenticated;

create function public.game_native_device_matches(token text)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists(select 1 from game_private.game_devices d
    where d.user_id=auth.uid() and d.expires_at>now()
      and d.token_hash=encode(extensions.digest(token,'sha256'),'hex'));
$$;
revoke all on function public.game_native_device_matches(text) from public,anon;
grant execute on function public.game_native_device_matches(text) to authenticated;

create function public.game_native_logout(token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(token,'') !~ '^[a-f0-9]{64}$' then
    raise exception '게임 계정을 확인해 주세요.' using errcode='28000';
  end if;
  -- Only the supplied device is revoked. Browser and other PC sessions survive.
  delete from game_private.game_devices where token_hash=encode(extensions.digest(token,'sha256'),'hex');
  return jsonb_build_object('ok',true);
end;
$$;
revoke all on function public.game_native_logout(text) from public;
grant execute on function public.game_native_logout(text) to anon,authenticated;
