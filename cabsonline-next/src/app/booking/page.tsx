"use client";

import { FormEvent, useState } from "react";
import MapPicker, { type MapPoint } from "@/components/MapPicker";
import { formatDate, formatTime } from "@/lib/bookings/format";
import {
  hasBookingFormErrors,
  nullableText,
  validateBookingForm,
  type BookingFormErrors,
  type BookingFormValues,
} from "@/lib/bookings/validation";
import { createPublicBooking } from "@/lib/supabase/bookings";

const initialValues: BookingFormValues = {
  customer_name: "",
  destination_latitude: null,
  destination_longitude: null,
  destination_suburb: "",
  phone: "",
  pickup_date: "",
  pickup_latitude: null,
  pickup_longitude: null,
  pickup_suburb: "",
  pickup_time: "",
  street_name: "",
  street_number: "",
  unit_number: "",
};

export default function BookingPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [createdBooking, setCreatedBooking] =
    useState<{
      booking_reference: string;
      pickup_date: string;
      pickup_time: string;
    } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function updateValue(name: keyof BookingFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updatePickup(point: MapPoint) {
    setValues((current) => ({
      ...current,
      pickup_latitude: point.latitude,
      pickup_longitude: point.longitude,
    }));
  }

  function updateDestination(point: MapPoint) {
    setValues((current) => ({
      ...current,
      destination_latitude: point.latitude,
      destination_longitude: point.longitude,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setCreatedBooking(null);

    const nextErrors = validateBookingForm(values);
    setErrors(nextErrors);

    if (hasBookingFormErrors(nextErrors)) {
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await createPublicBooking({
      customer_profile_id: null,
      customer_name: values.customer_name.trim(),
      destination_latitude: values.destination_latitude,
      destination_longitude: values.destination_longitude,
      destination_suburb: nullableText(values.destination_suburb),
      phone: values.phone.trim(),
      pickup_date: values.pickup_date,
      pickup_latitude: values.pickup_latitude,
      pickup_longitude: values.pickup_longitude,
      pickup_suburb: nullableText(values.pickup_suburb),
      pickup_time: values.pickup_time,
      street_name: values.street_name.trim(),
      street_number: values.street_number.trim(),
      unit_number: nullableText(values.unit_number),
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setCreatedBooking(data);
    setValues(initialValues);
    setErrors({});
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
          Customer
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950">Book a cab</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Enter the booking details and optionally choose pickup and destination
          points on the map.
        </p>
      </section>

      {createdBooking ? (
        <section className="rounded-lg border border-green-200 bg-green-50 p-5 text-green-950">
          <h2 className="text-lg font-semibold">Booking confirmed</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium">Reference</dt>
              <dd>{createdBooking.booking_reference}</dd>
            </div>
            <div>
              <dt className="font-medium">Pickup date</dt>
              <dd>{formatDate(createdBooking.pickup_date)}</dd>
            </div>
            <div>
              <dt className="font-medium">Pickup time</dt>
              <dd>{formatTime(createdBooking.pickup_time)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <form
        className="grid gap-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            error={errors.customer_name}
            label="Customer name"
            maxLength={100}
            name="customer_name"
            onChange={updateValue}
            value={values.customer_name}
          />
          <TextField
            error={errors.phone}
            inputMode="numeric"
            label="Phone number"
            maxLength={12}
            name="phone"
            onChange={updateValue}
            value={values.phone}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            error={errors.unit_number}
            inputMode="numeric"
            label="Unit number"
            maxLength={10}
            name="unit_number"
            onChange={updateValue}
            value={values.unit_number}
          />
          <TextField
            error={errors.street_number}
            inputMode="numeric"
            label="Street number"
            maxLength={10}
            name="street_number"
            onChange={updateValue}
            value={values.street_number}
          />
          <TextField
            error={errors.street_name}
            label="Street name"
            maxLength={50}
            name="street_name"
            onChange={updateValue}
            value={values.street_name}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            error={errors.pickup_suburb}
            label="Pickup suburb"
            maxLength={50}
            name="pickup_suburb"
            onChange={updateValue}
            value={values.pickup_suburb}
          />
          <TextField
            error={errors.destination_suburb}
            label="Destination suburb"
            maxLength={50}
            name="destination_suburb"
            onChange={updateValue}
            value={values.destination_suburb}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            error={errors.pickup_date}
            label="Pickup date"
            name="pickup_date"
            onChange={updateValue}
            type="date"
            value={values.pickup_date}
          />
          <TextField
            error={errors.pickup_time}
            label="Pickup time"
            name="pickup_time"
            onChange={updateValue}
            type="time"
            value={values.pickup_time}
          />
        </div>

        <MapPicker
          destination={
            values.destination_latitude !== null &&
            values.destination_longitude !== null
              ? {
                  latitude: values.destination_latitude,
                  longitude: values.destination_longitude,
                }
              : null
          }
          onDestinationChange={updateDestination}
          onPickupChange={updatePickup}
          pickup={
            values.pickup_latitude !== null && values.pickup_longitude !== null
              ? {
                  latitude: values.pickup_latitude,
                  longitude: values.pickup_longitude,
                }
              : null
          }
        />

        {submitError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        <button
          className="w-fit rounded-md bg-yellow-500 px-5 py-2 font-semibold text-zinc-950 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit booking"}
        </button>
      </form>
    </main>
  );
}

function TextField({
  error,
  inputMode,
  label,
  maxLength,
  name,
  onChange,
  type = "text",
  value,
}: {
  error?: string;
  inputMode?: "numeric";
  label: string;
  maxLength?: number;
  name: keyof BookingFormValues;
  onChange: (name: keyof BookingFormValues, value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-800">
      {label}
      <input
        className="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950"
        inputMode={inputMode}
        maxLength={maxLength}
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        onInput={(event) => onChange(name, event.currentTarget.value)}
        type={type}
        value={value}
      />
      {error ? <span className="text-sm font-normal text-red-700">{error}</span> : null}
    </label>
  );
}
