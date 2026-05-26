"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { formatAddress, formatDate, formatTime } from "@/lib/bookings/format";
import {
  assignBooking,
  getBookingsWithPickupCoordinates,
} from "@/lib/supabase/bookings";
import type { CabsonlineBooking } from "@/lib/supabase/database.types";

const auckland: [number, number] = [-36.8485, 174.7633];

const bookingIcon = L.divIcon({
  className: "",
  html: '<div class="map-marker map-marker-pickup">B</div>',
  iconAnchor: [18, 18],
  iconSize: [36, 36],
});

function MapFocusBooking({
  bookings,
  focusReference,
}: {
  bookings: CabsonlineBooking[];
  focusReference: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusReference) {
      return;
    }

    const booking = bookings.find(
      (item) =>
        item.booking_reference.toUpperCase() === focusReference.toUpperCase(),
    );

    if (
      booking?.pickup_latitude !== null &&
      booking?.pickup_latitude !== undefined &&
      booking.pickup_longitude !== null &&
      booking.pickup_longitude !== undefined
    ) {
      map.setView([booking.pickup_latitude, booking.pickup_longitude], 15);
    }
  }, [bookings, focusReference, map]);

  return null;
}

export default function AdminBookingMapInner() {
  const searchParams = useSearchParams();
  const focusReference = searchParams.get("ref");
  const [bookings, setBookings] = useState<CabsonlineBooking[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    const { data, error } =
      await getBookingsWithPickupCoordinates(focusReference);

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setBookings(data ?? []);
  }, [focusReference]);

  async function handleAssign(bookingReference: string) {
    setMessage("");

    const { error } = await assignBooking(bookingReference);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadBookings();
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadBookings());
  }, [loadBookings]);

  return (
    <section className="grid gap-4">
      {message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      ) : null}
      {isLoading ? <p className="text-zinc-600">Loading map bookings...</p> : null}
      <div className="h-[520px] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <MapContainer center={auckland} className="h-full w-full" zoom={12}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFocusBooking bookings={bookings} focusReference={focusReference} />
          {bookings.map((booking) =>
            booking.pickup_latitude !== null &&
            booking.pickup_longitude !== null ? (
              <Marker
                icon={bookingIcon}
                key={booking.id}
                position={[booking.pickup_latitude, booking.pickup_longitude]}
              >
                <Popup>
                  <div className="grid min-w-48 gap-1 text-sm">
                    <strong>{booking.booking_reference}</strong>
                    <span>{booking.customer_name}</span>
                    <span>{formatAddress(booking)}</span>
                    <span>
                      {formatDate(booking.pickup_date)} at{" "}
                      {formatTime(booking.pickup_time)}
                    </span>
                    <span>Status: {booking.status}</span>
                    <Link
                      className="font-semibold text-yellow-700 hover:underline"
                      href={`/admin/bookings/${booking.booking_reference}`}
                    >
                      View booking details
                    </Link>
                    {booking.status === "unassigned" ? (
                      <button
                        className="mt-2 rounded-md bg-yellow-500 px-3 py-1 font-semibold text-zinc-950"
                        onClick={() => handleAssign(booking.booking_reference)}
                        type="button"
                      >
                        Assign
                      </button>
                    ) : null}
                  </div>
                </Popup>
              </Marker>
            ) : null,
          )}
        </MapContainer>
      </div>
    </section>
  );
}
