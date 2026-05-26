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
