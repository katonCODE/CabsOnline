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
