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
