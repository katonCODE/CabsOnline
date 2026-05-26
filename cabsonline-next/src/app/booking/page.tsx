"use client";

import { FormEvent, useState } from "react";
import MapPicker, {
  type MapPoint,
  type MapSelectionMode,
} from "@/components/MapPicker";
import { formatDate, formatTime } from "@/lib/bookings/format";
import {
  hasBookingFormErrors,
  nullableText,
  validateBookingForm,
  type BookingFormErrors,
  type BookingFormValues,
} from "@/lib/bookings/validation";
import { createPublicBooking } from "@/lib/supabase/bookings";

function createInitialValues(): BookingFormValues {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    customer_name: "",
    destination_latitude: null,
    destination_longitude: null,
    destination_suburb: "",
    phone: "",
    pickup_date: `${year}-${month}-${day}`,
    pickup_latitude: null,
    pickup_longitude: null,
    pickup_suburb: "",
    pickup_time: now.toTimeString().slice(0, 5),
    street_name: "",
    street_number: "",
    unit_number: "",
  };
}

const inputNames: Record<keyof BookingFormValues, string> = {
  customer_name: "cname",
  destination_latitude: "destination_latitude",
  destination_longitude: "destination_longitude",
  destination_suburb: "dsbname",
  phone: "phone",
  pickup_date: "date",
  pickup_latitude: "pickup_latitude",
  pickup_longitude: "pickup_longitude",
  pickup_suburb: "sbname",
  pickup_time: "time",
  street_name: "stname",
  street_number: "snumber",
  unit_number: "unumber",
};

function calculateDistanceKm(start: MapPoint | null, end: MapPoint | null) {
  if (!start || !end) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDelta = ((end.latitude - start.latitude) * Math.PI) / 180;
  const longitudeDelta = ((end.longitude - start.longitude) * Math.PI) / 180;
  const startLatitude = (start.latitude * Math.PI) / 180;
  const endLatitude = (end.latitude * Math.PI) / 180;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getSuburbFromAddress(address: Record<string, string | undefined>) {
  return (
    address.suburb ??
    address.city_district ??
    address.neighbourhood ??
    address.quarter ??
    address.village ??
    address.town ??
    address.city ??
    ""
  );
}

export default function BookingPage() {
  const [values, setValues] = useState(createInitialValues);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [focusPoint, setFocusPoint] = useState<MapPoint | null>(null);
  const [mapMode, setMapMode] = useState<MapSelectionMode>("pickup");
  const [createdBooking, setCreatedBooking] =
    useState<{
      booking_reference: string;
      pickup_date: string;
      pickup_time: string;
    } | null>(null);
  const [mapMessage, setMapMessage] = useState("");
  const [mapLookupType, setMapLookupType] = useState<
    "pickup" | "destination" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const pickupPoint =
    values.pickup_latitude !== null && values.pickup_longitude !== null
      ? {
          latitude: values.pickup_latitude,
          longitude: values.pickup_longitude,
        }
      : null;
  const destinationPoint =
    values.destination_latitude !== null &&
    values.destination_longitude !== null
      ? {
          latitude: values.destination_latitude,
          longitude: values.destination_longitude,
        }
      : null;
  const distanceKm = calculateDistanceKm(pickupPoint, destinationPoint);

  function updateValue(name: keyof BookingFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function setPickupPoint(point: MapPoint) {
    setValues((current) => ({
      ...current,
      pickup_latitude: point.latitude,
      pickup_longitude: point.longitude,
    }));
    setFocusPoint(point);
  }

  function setDestinationPoint(point: MapPoint) {
    setValues((current) => ({
      ...current,
      destination_latitude: point.latitude,
      destination_longitude: point.longitude,
    }));
    setFocusPoint(point);
  }

  function clearPickupPoint() {
    setValues((current) => ({
      ...current,
      pickup_latitude: null,
      pickup_longitude: null,
    }));
    setFocusPoint(null);
    setMapMode("pickup");
  }

  function clearDestinationPoint() {
    setValues((current) => ({
      ...current,
      destination_latitude: null,
      destination_longitude: null,
    }));
    setFocusPoint(null);
    setMapMode("destination");
  }

  async function updateSuburbFromPoint(
    mode: MapSelectionMode,
    point: MapPoint,
  ) {
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: point.latitude.toString(),
        lon: point.longitude.toString(),
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      );

      if (!response.ok) {
        return;
      }

      const result: { address?: Record<string, string | undefined> } =
        await response.json();
      const suburb = result.address ? getSuburbFromAddress(result.address) : "";

      if (!suburb) {
        return;
      }

      setValues((current) => ({
        ...current,
        [mode === "pickup" ? "pickup_suburb" : "destination_suburb"]:
          suburb,
      }));
    } catch {
      setMapMessage("Point selected, but suburb lookup was unavailable.");
    }
  }

  function handleMapPointSelect(mode: MapSelectionMode, point: MapPoint) {
    setMapMessage("");

    if (mode === "pickup") {
      setPickupPoint(point);
      setMapMode("destination");
    } else {
      setDestinationPoint(point);
      setMapMode("pickup");
    }

    void updateSuburbFromPoint(mode, point);
  }

  async function showLocationOnMap(type: "pickup" | "destination") {
    setMapMessage("");

    const query =
      type === "pickup"
        ? [
            values.street_number.trim(),
            values.street_name.trim(),
            values.pickup_suburb.trim(),
            "New Zealand",
          ]
            .filter(Boolean)
            .join(", ")
        : [values.destination_suburb.trim(), "New Zealand"]
            .filter(Boolean)
            .join(", ");

    if (type === "pickup" && (!values.street_number.trim() || !values.street_name.trim())) {
      setMapMessage("Enter a pickup street number and street name first.");
      return;
    }

    if (type === "destination" && !values.destination_suburb.trim()) {
      setMapMessage("Enter a destination suburb first.");
      return;
    }

    setMapLookupType(type);

    try {
      const params = new URLSearchParams({
        countrycodes: "nz",
        format: "jsonv2",
        limit: "1",
        q: query,
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Location lookup failed.");
      }

      const results: { lat: string; lon: string }[] = await response.json();
      const result = results[0];

      if (!result) {
        setMapMessage("Could not find that location. Try adding more detail.");
        return;
      }

      const point = {
        latitude: Number(result.lat),
        longitude: Number(result.lon),
      };

      if (type === "pickup") {
        setPickupPoint(point);
      } else {
        setDestinationPoint(point);
      }
    } catch {
      setMapMessage("Could not show that location on the map.");
    } finally {
      setMapLookupType(null);
    }
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
    setValues(createInitialValues());
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
          Enter the booking details and use the map to preview pickup and
          destination locations.
        </p>
      </section>

      {createdBooking ? (
        <section className="rounded-lg border border-green-200 bg-green-50 p-5 text-green-950">
          <h2 className="text-lg font-semibold">Booking confirmed</h2>
          <p className="mt-3 whitespace-pre-line text-sm" id="reference">
            {`Thank you for your booking!\n\nBooking reference number: ${createdBooking.booking_reference}\nPickup time: ${formatTime(createdBooking.pickup_time)}\nPickup date: ${formatDate(createdBooking.pickup_date)}`}
          </p>
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
            htmlName={inputNames.customer_name}
            onChange={updateValue}
            value={values.customer_name}
          />
          <TextField
            error={errors.phone}
            inputMode="numeric"
            label="Phone number"
            maxLength={12}
            name="phone"
            htmlName={inputNames.phone}
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
            htmlName={inputNames.unit_number}
            onChange={updateValue}
            value={values.unit_number}
          />
          <TextField
            error={errors.street_number}
            inputMode="numeric"
            label="Street number"
            maxLength={10}
            name="street_number"
            htmlName={inputNames.street_number}
            onChange={updateValue}
            value={values.street_number}
          />
          <TextField
            error={errors.street_name}
            label="Street name"
            maxLength={50}
            name="street_name"
            htmlName={inputNames.street_name}
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
            htmlName={inputNames.pickup_suburb}
            onChange={updateValue}
            value={values.pickup_suburb}
          />
          <TextField
            error={errors.destination_suburb}
            label="Destination suburb"
            maxLength={50}
            name="destination_suburb"
            htmlName={inputNames.destination_suburb}
            onChange={updateValue}
            value={values.destination_suburb}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            error={errors.pickup_date}
            label="Pickup date"
            name="pickup_date"
            htmlName={inputNames.pickup_date}
            onChange={updateValue}
            type="date"
            value={values.pickup_date}
          />
          <TextField
            error={errors.pickup_time}
            label="Pickup time"
            name="pickup_time"
            htmlName={inputNames.pickup_time}
            onChange={updateValue}
            type="time"
            value={values.pickup_time}
          />
        </div>

        <section className="grid gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mapLookupType !== null}
              onClick={() => showLocationOnMap("pickup")}
              type="button"
            >
              {mapLookupType === "pickup"
                ? "Finding pickup..."
                : "Show pickup on map"}
            </button>
            <button
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mapLookupType !== null}
              onClick={() => showLocationOnMap("destination")}
              type="button"
            >
              {mapLookupType === "destination"
                ? "Finding destination..."
                : "Show destination on map"}
            </button>
          </div>
          {mapMessage ? (
            <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              {mapMessage}
            </p>
          ) : null}
        </section>

        <MapPicker
          activeMode={mapMode}
          distanceKm={distanceKm}
          destination={destinationPoint}
          focusPoint={focusPoint}
          onClearDestination={clearDestinationPoint}
          onClearPickup={clearPickupPoint}
          onModeChange={setMapMode}
          onPointSelect={handleMapPointSelect}
          pickup={pickupPoint}
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
  htmlName,
  inputMode,
  label,
  maxLength,
  name,
  onChange,
  type = "text",
  value,
}: {
  error?: string;
  htmlName: string;
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
        name={htmlName}
        onChange={(event) => onChange(name, event.target.value)}
        onInput={(event) => onChange(name, event.currentTarget.value)}
        type={type}
        value={value}
      />
      {error ? <span className="text-sm font-normal text-red-700">{error}</span> : null}
    </label>
  );
}
