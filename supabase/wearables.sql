
-- PEMESA Galaxy Watch control-plane schema.
-- Install once in Supabase SQL Editor for a new PEMESA project.
-- Already applied to the existing project on 2026-11-22.
-- Device metadata only; no raw health measurements.

create table if not exists public.wearable_devices (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 installation_id uuid not null,
 provider text not null default 'samsung_galaxy_watch' check(provider='samsung_galaxy_watch'),
 display_name text not null default 'Samsung Galaxy Watch' check(char_length(display_name) between 1 and 80),
 model text check(model is null or char_length(model)<=100),
 battery_percent smallint check(battery_percent between 0 and 100),
 last_seen_at timestamptz,
 actual_state text not null default 'stopped' check(actual_state in ('stopped','running','paused')),
 requested_metrics text[] not null default array['heart_rate','steps']::text[]
   check(requested_metrics <@ array['heart_rate','steps','activity','sleep']::text[]),
 collection_opt_in boolean not null default false,
 collection_opt_in_at timestamptz,
 sample_count bigint not null default 0 check(sample_count>=0),
 last_sample_at timestamptz,
 last_error text check(last_error is null or char_length(last_error)<=500),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,installation_id),
 unique(user_id,id)
);
create index if not exists wearable_devices_user_idx on public.wearable_devices(user_id,updated_at desc);
alter table public.wearable_devices enable row level security;
revoke all on public.wearable_devices from anon;
grant select,insert,update,delete on public.wearable_devices to authenticated;
create policy "Wearables select own" on public.wearable_devices for select to authenticated using((select auth.uid())=user_id);
create policy "Wearables insert own" on public.wearable_devices for insert to authenticated with check((select auth.uid())=user_id);
create policy "Wearables update own" on public.wearable_devices for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "Wearables delete own" on public.wearable_devices for delete to authenticated using((select auth.uid())=user_id);

create table if not exists public.wearable_pairings (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 pairing_code text not null check(pairing_code~'^[0-9]{6}$'),
 status text not null default 'pending' check(status in ('pending','claimed','cancelled')),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '10 minutes'),
 device_id uuid,
 constraint pairing_expiry_limit check(expires_at>created_at and expires_at<=created_at+interval '10 minutes'),
 foreign key(user_id,device_id) references public.wearable_devices(user_id,id) on delete set null(device_id)
);
create unique index if not exists wearable_pending_pair_code_unique on public.wearable_pairings(user_id,pairing_code) where status='pending';
create index if not exists wearable_pairings_user_idx on public.wearable_pairings(user_id,created_at desc);
alter table public.wearable_pairings enable row level security;
revoke all on public.wearable_pairings from anon;
grant select,insert,update,delete on public.wearable_pairings to authenticated;
create policy "Wearable pairings select own" on public.wearable_pairings for select to authenticated using((select auth.uid())=user_id);
create policy "Wearable pairings insert own" on public.wearable_pairings for insert to authenticated with check((select auth.uid())=user_id);
create policy "Wearable pairings update own" on public.wearable_pairings for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "Wearable pairings delete own" on public.wearable_pairings for delete to authenticated using((select auth.uid())=user_id);

create table if not exists public.wearable_commands (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 device_id uuid not null,
 action text not null check(action in ('start','pause','stop')),
 status text not null default 'pending' check(status in ('pending','applied','failed')),
 created_at timestamptz not null default now(),
 acknowledged_at timestamptz,
 error_message text check(error_message is null or char_length(error_message)<=500),
 foreign key(user_id,device_id) references public.wearable_devices(user_id,id) on delete cascade
);
create index if not exists wearable_commands_device_idx on public.wearable_commands(user_id,device_id,created_at desc);
alter table public.wearable_commands enable row level security;
revoke all on public.wearable_commands from anon;
grant select,insert,update,delete on public.wearable_commands to authenticated;
create policy "Wearable commands select own" on public.wearable_commands for select to authenticated using((select auth.uid())=user_id);
create policy "Wearable commands insert own" on public.wearable_commands for insert to authenticated with check((select auth.uid())=user_id);
create policy "Wearable commands update own" on public.wearable_commands for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "Wearable commands delete own" on public.wearable_commands for delete to authenticated using((select auth.uid())=user_id);

create or replace function public.claim_wearable_pairing(
 p_code text,p_installation_id uuid,p_display_name text default 'Samsung Galaxy Watch',p_model text default null
) returns uuid language plpgsql security invoker set search_path='' as $function$
declare v_user uuid:=(select auth.uid());v_pair_id uuid;v_device_id uuid;
begin
 if v_user is null then raise exception 'Authentication required';end if;
 if p_code!~'^[0-9]{6}$' then raise exception 'Invalid pairing code';end if;
 if p_installation_id is null then raise exception 'Installation identifier required';end if;
 if char_length(btrim(coalesce(p_display_name,''))) not between 1 and 80 then raise exception 'Invalid device name';end if;
 if char_length(coalesce(p_model,''))>100 then raise exception 'Invalid model';end if;
 select id into v_pair_id from public.wearable_pairings
  where user_id=v_user and pairing_code=p_code and status='pending' and expires_at>now()
  order by created_at desc limit 1 for update;
 if v_pair_id is null then raise exception 'Pairing code expired or invalid';end if;
 insert into public.wearable_devices(user_id,installation_id,display_name,model,last_seen_at,updated_at)
 values(v_user,p_installation_id,btrim(p_display_name),nullif(btrim(p_model),''),now(),now())
 on conflict(user_id,installation_id) do update set
  display_name=excluded.display_name,model=excluded.model,last_seen_at=now(),updated_at=now()
 returning id into v_device_id;
 update public.wearable_pairings set status='claimed',device_id=v_device_id where id=v_pair_id and user_id=v_user;
 return v_device_id;
end;
$function$;
revoke all on function public.claim_wearable_pairing(text,uuid,text,text) from public,anon;
grant execute on function public.claim_wearable_pairing(text,uuid,text,text) to authenticated;

alter publication supabase_realtime add table
 public.wearable_devices,public.wearable_pairings,public.wearable_commands;
