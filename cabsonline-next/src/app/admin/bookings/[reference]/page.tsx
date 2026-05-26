"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BookingDetailRow,
  BookingDetailSection,
} from "@/components/admin/BookingDetailSection";
import {
  formatDistanceKm,
  straightLineDistanceKm,
} from "@/lib/bookings/distance";
import {
  formatAddress,
  formatCoordinates,
  formatDate,
  formatDateTime,
  formatDestination,
  formatStatus,
  formatTime,
  hasMapCoordinates,
  hasTripDistance,
  openStreetMapUrl,
} from "@/lib/bookings/format";
import { assignBooking, getAdminBookings } from "@/lib/supabase/bookings";
import type { CabsonlineBooking } from "@/lib/supabase/database.types";
import { getProfile } from "@/lib/supabase/profiles";

const referencePattern = /^BRN\d{5,}$/i;

export default function AdminBookingDetailPage() {
  const params = useParams();
  const reference = String(params.reference ?? "").trim().toUpperCase();

  const [booking, setBooking] = useState<CabsonlineBooking | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [isLoading, setIsLoading] = useState(true);
  const [copyLabel, setCopyLabel] = useState("Copy reference");

  const loadBooking = useCallback(async () => {
    if (!referencePattern.test(reference)) {
      setBooking(null);
      setIsLoading(false);
      setMessageType("error");
      setMessage("Invalid booking reference.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const { data, error } = await getAdminBookings(reference);

    setIsLoading(false);

    if (error) {
      setBooking(null);
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    const bookingRow = Array.isArray(data) ? data[0] : data;

    if (!bookingRow) {
      setBooking(null);
      setMessageType("error");
      setMessage(`Booking ${reference} was not found.`);
      return;
    }

    setBooking(bookingRow);
    setDriverName(null);

    if (bookingRow.assigned_driver_profile_id) {
      const { data: profile } = await getProfile(
        bookingRow.assigned_driver_profile_id,
      );
      setDriverName(
        profile?.full_name ?? bookingRow.assigned_driver_profile_id,
      );
    }
  }, [reference]);

  async function handleAssign() {
    if (!booking) {
      return;
    }

    setMessage("");

    const { error } = await assignBooking(booking.booking_reference);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    setMessageType("success");
    setMessage(`Booking ${booking.booking_reference} has been assigned.`);
    await loadBooking();
  }

  async function handleCopyReference() {
    if (!booking) {
      return;
    }

    try {
      await navigator.clipboard.writeText(booking.booking_reference);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy reference"), 2000);
    } catch {
      setMessageType("error");
      setMessage("Could not copy booking reference.");
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadBooking());
  }, [loadBooking]);

  const tripDistanceKm =
    booking && hasTripDistance(booking)
      ? straightLineDistanceKm(
          booking.pickup_latitude!,
          booking.pickup_longitude!,
          booking.destination_latitude!,
          booking.destination_longitude!,
        )
      : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm font-semibold text-yellow-700 hover:underline"
            href="/admin/bookings"
          >
            Back to bookings
          </Link>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-yellow-700">
            Driver
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-950">
            {reference || "Booking details"}
          </h1>
        </div>

        {booking ? (
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              onClick={() => void handleCopyReference()}
              type="button"
            >
              {copyLabel}
            </button>
            {booking.status === "unassigned" ? (
              <button
                className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-400"
                onClick={() => void handleAssign()}
                type="button"
              >
                Assign to me
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-zinc-600">Loading booking...</p>
      ) : null}

      {!isLoading && booking ? (
        <div className="grid gap-5">
          <BookingDetailSection title="Booking summary">
            <BookingDetailRow label="Reference" value={booking.booking_reference} />
            <BookingDetailRow
              label="Status"
              value={<span className="capitalize">{formatStatus(booking.status)}</span>}
            />
            <BookingDetailRow
              label="Created"
              value={formatDateTime(booking.created_at)}
            />
            <BookingDetailRow
              label="Last updated"
              value={formatDateTime(booking.updated_at)}
            />
          </BookingDetailSection>

          <BookingDetailSection title="Customer">
            <BookingDetailRow label="Name" value={booking.customer_name} />
            <BookingDetailRow
              label="Phone"
              value={
                <a className="font-semibold text-yellow-700 hover:underline" href={`tel:${booking.phone}`}>
                  {booking.phone}
                </a>
              }
            />
            <BookingDetailRow
              label="Account"
              value={booking.customer_profile_id ?? "Guest booking"}
            />
          </BookingDetailSection>

          <BookingDetailSection title="Pickup">
            <BookingDetailRow label="Address" value={formatAddress(booking)} />
            <BookingDetailRow
              label="Date and time"
              value={`${formatDate(booking.pickup_date)} ${formatTime(booking.pickup_time)}`}
            />
            <BookingDetailRow
              label="Scheduled at"
              value={formatDateTime(booking.pickup_at)}
            />
            <BookingDetailRow
              label="Map coordinates"
              value={formatCoordinates(booking.pickup_latitude, booking.pickup_longitude)}
            />
            <BookingDetailRow
              label="Map"
              value={
                hasMapCoordinates(booking.pickup_latitude, booking.pickup_longitude) ? (
                  <span className="flex flex-wrap gap-3">
                    <Link
                      className="font-semibold text-yellow-700 hover:underline"
                      href={`/admin/map?ref=${booking.booking_reference}`}
                    >
                      View on admin map
                    </Link>
                    <a
                      className="font-semibold text-yellow-700 hover:underline"
                      href={openStreetMapUrl(
                        booking.pickup_latitude!,
                        booking.pickup_longitude!,
                      )}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open in OpenStreetMap
                    </a>
                  </span>
                ) : (
                  "Not set on map"
                )
              }
            />
          </BookingDetailSection>

          <BookingDetailSection title="Destination">
            <BookingDetailRow label="Suburb" value={formatDestination(booking)} />
            <BookingDetailRow
              label="Map coordinates"
              value={formatCoordinates(
                booking.destination_latitude,
                booking.destination_longitude,
              )}
            />
            {!booking.destination_suburb &&
            !hasMapCoordinates(
              booking.destination_latitude,
              booking.destination_longitude,
            ) ? (
              <BookingDetailRow label="Note" value="No destination specified" />
            ) : null}
            {hasMapCoordinates(
              booking.destination_latitude,
              booking.destination_longitude,
            ) ? (
              <BookingDetailRow
                label="Map"
                value={
                  <a
                    className="font-semibold text-yellow-700 hover:underline"
                    href={openStreetMapUrl(
                      booking.destination_latitude!,
                      booking.destination_longitude!,
                    )}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open in OpenStreetMap
                  </a>
                }
              />
            ) : null}
          </BookingDetailSection>

          <BookingDetailSection title="Trip metrics">
            <BookingDetailRow
              label="Approx. distance (straight line)"
              value={
                tripDistanceKm !== null
                  ? formatDistanceKm(tripDistanceKm)
                  : "Distance unavailable - map points not set for pickup and/or destination"
              }
            />
          </BookingDetailSection>

          <BookingDetailSection title="Assignment">
            <BookingDetailRow
              label="Driver"
              value={
                driverName ??
                (booking.assigned_driver_profile_id
                  ? "Assigned driver"
                  : booking.status === "assigned"
                    ? "Assigned"
                    : "Unassigned")
              }
            />
            <BookingDetailRow
              label="Assigned at"
              value={formatDateTime(booking.assigned_at)}
            />
          </BookingDetailSection>

          <BookingDetailSection title="Timeline">
            <BookingDetailRow label="Booked" value={formatDateTime(booking.created_at)} />
            <BookingDetailRow
              label="Assigned"
              value={formatDateTime(booking.assigned_at)}
            />
          </BookingDetailSection>
        </div>
      ) : null}

      {!isLoading && !booking && !message ? (
        <p className="text-zinc-600">Booking not found.</p>
      ) : null}
    </main>
  );
}
