import type { CabsonlineBooking } from "@/lib/supabase/database.types";

export function formatDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(timeValue: string) {
  return timeValue.slice(0, 5);
}

export function isUsableSuburb(suburb: string | null | undefined) {
  if (!suburb) {
    return false;
  }

  const trimmed = suburb.trim();
  return trimmed.length > 0 && trimmed !== "=";
}

export function formatSuburb(suburb: string | null | undefined) {
  if (!isUsableSuburb(suburb)) {
    return null;
  }

  return suburb!.trim();
}

export function formatAddress(booking: CabsonlineBooking) {
  const unit = booking.unit_number ? `${booking.unit_number}/` : "";
  const suburb = formatSuburb(booking.pickup_suburb);
  const suburbPart = suburb ? `, ${suburb}` : "";

  return `${unit}${booking.street_number} ${booking.street_name}${suburbPart}`;
}

export function formatCoordinates(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) {
    return "Not set on map";
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-NZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function formatDestination(booking: CabsonlineBooking) {
  return formatSuburb(booking.destination_suburb) ?? "Not provided";
}

export function formatPickupSuburb(booking: CabsonlineBooking) {
  return formatSuburb(booking.pickup_suburb) ?? formatAddress(booking);
}

export function hasMapCoordinates(
  latitude: number | null,
  longitude: number | null,
) {
  return latitude !== null && longitude !== null;
}

export function hasTripDistance(booking: CabsonlineBooking) {
  return (
    hasMapCoordinates(booking.pickup_latitude, booking.pickup_longitude) &&
    hasMapCoordinates(
      booking.destination_latitude,
      booking.destination_longitude,
    )
  );
}

export function openStreetMapUrl(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}
