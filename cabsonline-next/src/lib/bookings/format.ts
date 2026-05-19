import type { CabsonlineBooking } from "@/lib/supabase/database.types";

export function formatDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(timeValue: string) {
  return timeValue.slice(0, 5);
}

export function formatAddress(booking: CabsonlineBooking) {
  const unit = booking.unit_number ? `${booking.unit_number}/` : "";
  const suburb = booking.pickup_suburb ? `, ${booking.pickup_suburb}` : "";

  return `${unit}${booking.street_number} ${booking.street_name}${suburb}`;
}

export function formatCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) {
    return "Not selected";
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
