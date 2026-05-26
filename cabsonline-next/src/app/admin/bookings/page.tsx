"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  formatDate,
  formatDestination,
  formatPickupSuburb,
  formatTime,
} from "@/lib/bookings/format";
import {
  assignBooking,
  getAdminBookings,
  getAllBookings,
} from "@/lib/supabase/bookings";
import type { CabsonlineBooking } from "@/lib/supabase/database.types";

export default function AdminBookingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
          Driver
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950">Bookings</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          View active bookings, or search by booking reference.
        </p>
      </section>

      <AdminBookingsContent />
    </main>
  );
}

function AdminBookingsContent() {
  const router = useRouter();
  const [bookings, setBookings] = useState<CabsonlineBooking[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [isLoading, setIsLoading] = useState(true);

  async function loadAllBookings() {
    setIsLoading(true);
    setMessage("");

    const { data, error } = await getAllBookings();

    setIsLoading(false);

    if (error) {
      setBookings([]);
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    setBookings(Array.isArray(data) ? data : data ? [data] : []);
  }

  async function loadSearchResults(reference = "") {
    setIsLoading(true);
    setMessage("");

    const { data, error } = await getAdminBookings(reference);

    setIsLoading(false);

    if (error) {
      setBookings([]);
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    setBookings(Array.isArray(data) ? data : data ? [data] : []);
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (search.trim() && !/^BRN\d{5,}$/.test(search.trim().toUpperCase())) {
      setBookings([]);
      setMessageType("error");
      setMessage("Enter a booking reference like BRN00001.");
      return;
    }

    await loadSearchResults(search);
  }

  async function handleAssign(bookingReference: string) {
    setMessage("");

    const { error } = await assignBooking(bookingReference);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    if (search.trim()) {
      await loadSearchResults(search);
    } else {
      await loadAllBookings();
    }

    setMessageType("success");
    setMessage(`Booking reference number ${bookingReference} has been assigned.`);
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadAllBookings());
  }, []);

  return (
    <section className="grid gap-5">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 sm:w-72"
          name="bsearch"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="BRN00001"
          value={search}
        />
        <button
          className="rounded-md bg-yellow-500 px-5 py-2 font-semibold text-zinc-950 hover:bg-yellow-400"
          name="sbutton"
          type="submit"
        >
          Search
        </button>
        <button
          className="rounded-md border border-zinc-300 px-5 py-2 font-semibold text-zinc-700 hover:bg-zinc-100"
          onClick={() => {
            setSearch("");
            loadAllBookings();
          }}
          type="button"
        >
          View active bookings
        </button>
      </form>

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

      {!isLoading && bookings.length === 0 ? (
        <p className="rounded-md border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-600 shadow-sm">
          No bookings found.
        </p>
      ) : null}

      <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-700">
            <tr>
              <th className="px-4 py-3 font-semibold">
                Booking reference number
              </th>
              <th className="px-4 py-3 font-semibold">Customer name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Pickup suburb</th>
              <th className="px-4 py-3 font-semibold">Destination suburb</th>
              <th className="px-4 py-3 font-semibold">
                Pickup date and time
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Assign</th>
              <th className="px-4 py-3 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50"
                key={booking.id}
                onClick={() =>
                  router.push(`/admin/bookings/${booking.booking_reference}`)
                }
              >
                <td className="px-4 py-3 font-medium text-zinc-950">
                  <Link
                    className="text-yellow-700 hover:underline"
                    href={`/admin/bookings/${booking.booking_reference}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {booking.booking_reference}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {booking.customer_name}
                </td>
                <td className="px-4 py-3 text-zinc-700">{booking.phone}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {formatPickupSuburb(booking)}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {formatDestination(booking)}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {formatDate(booking.pickup_date)}{" "}
                  {formatTime(booking.pickup_time)}
                </td>
                <td className="px-4 py-3 text-zinc-700">{booking.status}</td>
                <td className="px-4 py-3">
                  {booking.status === "unassigned" ? (
                    <button
                      className="rounded-md bg-yellow-500 px-3 py-2 font-semibold text-zinc-950 hover:bg-yellow-400"
                      name="Assign"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleAssign(booking.booking_reference);
                      }}
                      type="button"
                    >
                      Assign
                    </button>
                  ) : (
                    <span className="text-zinc-500">Assigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    className="font-semibold text-yellow-700 hover:underline"
                    href={`/admin/bookings/${booking.booking_reference}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-600" colSpan={9}>
                  Loading bookings...
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </section>
  );
}
