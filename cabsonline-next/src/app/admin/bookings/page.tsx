"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminAccessGate from "@/components/AdminAccessGate";
import { formatAddress, formatDate, formatTime } from "@/lib/bookings/format";
import { assignBooking, getAdminBookings } from "@/lib/supabase/bookings";
import type { CabsonlineBooking } from "@/lib/supabase/database.types";

export default function AdminBookingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950">Bookings</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Search by booking reference or leave the search empty to show
          unassigned bookings in the next 2 hours.
        </p>
      </section>

      <AdminAccessGate>
        <AdminBookingsContent />
      </AdminAccessGate>
    </main>
  );
}

function AdminBookingsContent() {
  const [bookings, setBookings] = useState<CabsonlineBooking[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadBookings(reference = "") {
    setIsLoading(true);
    setMessage("");

    const { data, error } = await getAdminBookings(reference);

    setIsLoading(false);

    if (error) {
      setBookings([]);
      setMessage(error.message);
      return;
    }

    setBookings(Array.isArray(data) ? data : data ? [data] : []);
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (search.trim() && !/^BRN\d{5,}$/.test(search.trim().toUpperCase())) {
      setBookings([]);
      setMessage("Enter a booking reference like BRN00001.");
      return;
    }

    await loadBookings(search);
  }

  async function handleAssign(bookingReference: string) {
    setMessage("");

    const { error } = await assignBooking(bookingReference);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadBookings(search);
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadBookings());
  }, []);

  return (
    <section className="grid gap-5">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <input
          className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 sm:w-72"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="BRN00001"
          value={search}
        />
        <button
          className="rounded-md bg-yellow-500 px-5 py-2 font-semibold text-zinc-950 hover:bg-yellow-400"
          type="submit"
        >
          Search
        </button>
        <button
          className="rounded-md border border-zinc-300 px-5 py-2 font-semibold text-zinc-700 hover:bg-zinc-100"
          onClick={() => {
            setSearch("");
            loadBookings();
          }}
          type="button"
        >
          Show upcoming
        </button>
      </form>

      {message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      ) : null}

      <section className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Pickup</th>
              <th className="px-4 py-3 font-semibold">Destination</th>
              <th className="px-4 py-3 font-semibold">Date/time</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr className="border-t border-zinc-100" key={booking.id}>
                <td className="px-4 py-3 font-medium text-zinc-950">
                  {booking.booking_reference}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {booking.customer_name}
                </td>
                <td className="px-4 py-3 text-zinc-700">{booking.phone}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {formatAddress(booking)}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {booking.destination_suburb || "Not provided"}
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
                      onClick={() => handleAssign(booking.booking_reference)}
                      type="button"
                    >
                      Assign
                    </button>
                  ) : (
                    <span className="text-zinc-500">Assigned</span>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && bookings.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-600" colSpan={8}>
                  No bookings found.
                </td>
              </tr>
            ) : null}
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-600" colSpan={8}>
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
