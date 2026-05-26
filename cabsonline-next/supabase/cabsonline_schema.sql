-- CabsOnline Supabase schema
-- Review before running in the Supabase SQL editor.

create sequence if not exists cabsonline_booking_reference_seq;

create or replace function cabsonline_generate_booking_reference()
returns text
language sql
as $$
  select 'BRN' || lpad(nextval('cabsonline_booking_reference_seq')::text, 5, '0');
$$;

create or replace function cabsonline_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function cabsonline_set_booking_pickup_at()
returns trigger
language plpgsql
as $$
begin
  new.pickup_at = (new.pickup_date + new.pickup_time) at time zone 'Pacific/Auckland';

  if new.status = 'assigned' and new.assigned_at is null then
    new.assigned_at = now();
  end if;

  return new;
end;
$$;

create table if not exists cabsonline_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cabsonline_profiles_role_check
    check (role in ('customer', 'admin', 'driver')),
  constraint cabsonline_profiles_phone_check
    check (phone is null or phone ~ '^[0-9]{10,12}$')
);

create or replace function cabsonline_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cabsonline_profiles
    where id = auth.uid()
      and role in ('admin', 'driver')
  );
$$;

create table if not exists cabsonline_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null default cabsonline_generate_booking_reference(),

  customer_profile_id uuid references cabsonline_profiles(id) on delete set null,
  customer_name text not null,
  phone text not null,

  unit_number text,
  street_number text not null,
  street_name text not null,
  pickup_suburb text,
  destination_suburb text,

  pickup_date date not null,
  pickup_time time not null,
  pickup_at timestamptz not null,

  pickup_latitude numeric(9, 6),
  pickup_longitude numeric(9, 6),
  destination_latitude numeric(9, 6),
  destination_longitude numeric(9, 6),

  status text not null default 'unassigned',
  assigned_driver_profile_id uuid references cabsonline_profiles(id) on delete set null,
  assigned_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cabsonline_bookings_reference_unique
    unique (booking_reference),
  constraint cabsonline_bookings_reference_check
    check (booking_reference ~ '^BRN[0-9]{5,}$'),
  constraint cabsonline_bookings_customer_name_check
    check (char_length(trim(customer_name)) between 1 and 100),
  constraint cabsonline_bookings_phone_check
    check (phone ~ '^[0-9]{10,12}$'),
  constraint cabsonline_bookings_unit_number_check
    check (unit_number is null or unit_number ~ '^[0-9]{0,10}$'),
  constraint cabsonline_bookings_street_number_check
    check (street_number ~ '^[0-9]{1,10}$'),
  constraint cabsonline_bookings_street_name_check
    check (char_length(trim(street_name)) between 1 and 50),
  constraint cabsonline_bookings_pickup_suburb_check
    check (pickup_suburb is null or char_length(trim(pickup_suburb)) <= 50),
  constraint cabsonline_bookings_destination_suburb_check
    check (destination_suburb is null or char_length(trim(destination_suburb)) <= 50),
  constraint cabsonline_bookings_status_check
    check (status in ('unassigned', 'assigned', 'picked_up', 'completed', 'cancelled')),
  constraint cabsonline_bookings_pickup_latitude_check
    check (pickup_latitude is null or pickup_latitude between -90 and 90),
  constraint cabsonline_bookings_pickup_longitude_check
    check (pickup_longitude is null or pickup_longitude between -180 and 180),
  constraint cabsonline_bookings_destination_latitude_check
    check (destination_latitude is null or destination_latitude between -90 and 90),
  constraint cabsonline_bookings_destination_longitude_check
    check (destination_longitude is null or destination_longitude between -180 and 180),
  constraint cabsonline_bookings_assigned_at_check
    check ((status = 'assigned' and assigned_at is not null) or status <> 'assigned')
);

create index if not exists cabsonline_bookings_reference_idx
  on cabsonline_bookings (booking_reference);

create index if not exists cabsonline_bookings_status_pickup_at_idx
  on cabsonline_bookings (status, pickup_at);

create index if not exists cabsonline_bookings_customer_profile_idx
  on cabsonline_bookings (customer_profile_id);

drop trigger if exists cabsonline_profiles_set_updated_at on cabsonline_profiles;

create trigger cabsonline_profiles_set_updated_at
before update on cabsonline_profiles
for each row
execute function cabsonline_set_updated_at();

drop trigger if exists cabsonline_bookings_set_pickup_at on cabsonline_bookings;

create trigger cabsonline_bookings_set_pickup_at
before insert or update of pickup_date, pickup_time, status on cabsonline_bookings
for each row
execute function cabsonline_set_booking_pickup_at();

drop trigger if exists cabsonline_bookings_set_updated_at on cabsonline_bookings;

create trigger cabsonline_bookings_set_updated_at
before update on cabsonline_bookings
for each row
execute function cabsonline_set_updated_at();

alter table cabsonline_profiles enable row level security;
alter table cabsonline_bookings enable row level security;

drop policy if exists "Users can view their own CabsOnline profile" on cabsonline_profiles;

create policy "Users can view their own CabsOnline profile"
on cabsonline_profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can create their own CabsOnline profile" on cabsonline_profiles;

create policy "Users can create their own CabsOnline profile"
on cabsonline_profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own CabsOnline profile" on cabsonline_profiles;

create policy "Users can update their own CabsOnline profile"
on cabsonline_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Anyone can create a CabsOnline booking" on cabsonline_bookings;

create policy "Anyone can create a CabsOnline booking"
on cabsonline_bookings
for insert
to anon, authenticated
with check (customer_profile_id is null or auth.uid() = customer_profile_id or cabsonline_is_admin());

create or replace function public.cabsonline_create_public_booking(
  p_customer_name text,
  p_phone text,
  p_unit_number text,
  p_street_number text,
  p_street_name text,
  p_pickup_suburb text,
  p_destination_suburb text,
  p_pickup_date date,
  p_pickup_time time,
  p_pickup_latitude numeric default null,
  p_pickup_longitude numeric default null,
  p_destination_latitude numeric default null,
  p_destination_longitude numeric default null
)
returns table (
  booking_reference text,
  pickup_date date,
  pickup_time time
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  insert into public.cabsonline_bookings (
    customer_profile_id,
    customer_name,
    phone,
    unit_number,
    street_number,
    street_name,
    pickup_suburb,
    destination_suburb,
    pickup_date,
    pickup_time,
    pickup_latitude,
    pickup_longitude,
    destination_latitude,
    destination_longitude
  )
  values (
    null,
    p_customer_name,
    p_phone,
    p_unit_number,
    p_street_number,
    p_street_name,
    p_pickup_suburb,
    p_destination_suburb,
    p_pickup_date,
    p_pickup_time,
    p_pickup_latitude,
    p_pickup_longitude,
    p_destination_latitude,
    p_destination_longitude
  )
  returning
    cabsonline_bookings.booking_reference,
    cabsonline_bookings.pickup_date,
    cabsonline_bookings.pickup_time;
end;
$$;

grant execute on function public.cabsonline_create_public_booking(
  text, text, text, text, text, text, text, date, time, numeric, numeric, numeric, numeric
) to anon, authenticated;

create or replace function public.cabsonline_get_admin_bookings(
  p_booking_reference text default null
)
returns setof public.cabsonline_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reference text := upper(trim(coalesce(p_booking_reference, '')));
begin
  if v_reference <> '' then
    return query
    select *
    from public.cabsonline_bookings
    where booking_reference = v_reference
    order by pickup_at asc;

    return;
  end if;

  return query
  select *
  from public.cabsonline_bookings
  where status = 'unassigned'
    and pickup_at >= now()
    and pickup_at <= now() + interval '2 hours'
  order by pickup_at asc;
end;
$$;

grant execute on function public.cabsonline_get_admin_bookings(text) to anon, authenticated;

create or replace function public.cabsonline_get_active_admin_bookings()
returns setof public.cabsonline_bookings
language sql
security definer
set search_path = public
as $$
  select *
  from public.cabsonline_bookings
  where pickup_at >= now()
    and status not in ('completed', 'cancelled')
  order by pickup_at asc;
$$;

grant execute on function public.cabsonline_get_active_admin_bookings() to anon, authenticated;

create or replace function public.cabsonline_get_admin_map_bookings(
  p_booking_reference text default null
)
returns setof public.cabsonline_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reference text := upper(trim(coalesce(p_booking_reference, '')));
begin
  return query
  select *
  from public.cabsonline_bookings
  where pickup_latitude is not null
    and pickup_longitude is not null
    and status not in ('completed', 'cancelled')
    and pickup_at >= now()
    and (v_reference = '' or booking_reference = v_reference)
  order by pickup_at asc;
end;
$$;

grant execute on function public.cabsonline_get_admin_map_bookings(text) to anon, authenticated;

create or replace function public.cabsonline_get_default_driver_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from public.cabsonline_profiles
  where role = 'driver'
  order by created_at asc
  limit 1;
$$;

grant execute on function public.cabsonline_get_default_driver_profile_id() to anon, authenticated;

create or replace function public.cabsonline_assign_booking(
  p_booking_reference text,
  p_driver_profile_id uuid default null
)
returns setof public.cabsonline_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_profile_id uuid := coalesce(
    p_driver_profile_id,
    public.cabsonline_get_default_driver_profile_id()
  );
begin
  return query
  update public.cabsonline_bookings
  set
    status = 'assigned',
    assigned_driver_profile_id = v_driver_profile_id
  where booking_reference = upper(trim(p_booking_reference))
    and status = 'unassigned'
  returning *;
end;
$$;

grant execute on function public.cabsonline_assign_booking(text, uuid) to anon, authenticated;

drop policy if exists "Customers can view their own CabsOnline bookings" on cabsonline_bookings;

create policy "Customers can view their own CabsOnline bookings"
on cabsonline_bookings
for select
using (auth.uid() = customer_profile_id);

drop policy if exists "Admins can view all CabsOnline bookings" on cabsonline_bookings;

create policy "Admins can view all CabsOnline bookings"
on cabsonline_bookings
for select
using (cabsonline_is_admin());

drop policy if exists "Admins can update CabsOnline bookings" on cabsonline_bookings;

create policy "Admins can update CabsOnline bookings"
on cabsonline_bookings
for update
using (cabsonline_is_admin())
with check (cabsonline_is_admin());
