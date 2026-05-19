import { supabase } from "./client";
import type {
  BookingStatus,
  CabsonlineBooking,
  CabsonlineBookingInsert,
  CabsonlineBookingUpdate,
} from "./database.types";

export type CreateBookingInput = Pick<
  CabsonlineBookingInsert,
  | "customer_name"
  | "phone"
  | "street_number"
  | "street_name"
  | "pickup_date"
  | "pickup_time"
> &
  Partial<
    Pick<
      CabsonlineBookingInsert,
      | "customer_profile_id"
      | "destination_latitude"
      | "destination_longitude"
      | "destination_suburb"
      | "pickup_latitude"
      | "pickup_longitude"
      | "pickup_suburb"
      | "unit_number"
    >
  >;

export async function createBooking(input: CreateBookingInput) {
  return supabase
    .from("cabsonline_bookings")
    .insert(input)
    .select()
    .single();
}

export async function createPublicBooking(input: CreateBookingInput) {
  return supabase
    .rpc("cabsonline_create_public_booking", {
      p_customer_name: input.customer_name,
      p_destination_latitude: input.destination_latitude ?? null,
      p_destination_longitude: input.destination_longitude ?? null,
      p_destination_suburb: input.destination_suburb ?? null,
      p_phone: input.phone,
      p_pickup_date: input.pickup_date,
      p_pickup_latitude: input.pickup_latitude ?? null,
      p_pickup_longitude: input.pickup_longitude ?? null,
      p_pickup_suburb: input.pickup_suburb ?? null,
      p_pickup_time: input.pickup_time,
      p_street_name: input.street_name,
      p_street_number: input.street_number,
      p_unit_number: input.unit_number ?? null,
    })
    .single();
}

export async function getBookingByReference(bookingReference: string) {
  return supabase
    .from("cabsonline_bookings")
    .select("*")
    .eq("booking_reference", bookingReference)
    .maybeSingle();
}

export async function getUpcomingUnassignedBookings(hoursAhead = 2) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(end.getHours() + hoursAhead);

  return supabase
    .from("cabsonline_bookings")
    .select("*")
    .eq("status", "unassigned")
    .gte("pickup_at", now.toISOString())
    .lte("pickup_at", end.toISOString())
    .order("pickup_at", { ascending: true });
}

export async function getAdminBookings(bookingReference?: string) {
  const reference = bookingReference?.trim().toUpperCase();

  if (reference) {
    return getBookingByReference(reference);
  }

  return getUpcomingUnassignedBookings();
}

export async function getBookingsWithPickupCoordinates() {
  return supabase
    .from("cabsonline_bookings")
    .select("*")
    .not("pickup_latitude", "is", null)
    .not("pickup_longitude", "is", null)
    .order("pickup_at", { ascending: true });
}

export async function updateBookingStatus(
  bookingReference: string,
  status: BookingStatus,
) {
  const updates: CabsonlineBookingUpdate = { status };

  return supabase
    .from("cabsonline_bookings")
    .update(updates)
    .eq("booking_reference", bookingReference)
    .eq("status", "unassigned")
    .select()
    .single();
}

export async function assignBooking(
  bookingReference: string,
  driverProfileId?: string,
) {
  const updates: CabsonlineBookingUpdate = {
    assigned_driver_profile_id: driverProfileId ?? null,
    status: "assigned",
  };

  return supabase
    .from("cabsonline_bookings")
    .update(updates)
    .eq("booking_reference", bookingReference)
    .select()
    .single();
}

export function formatBookingReference(booking: CabsonlineBooking) {
  return booking.booking_reference;
}
