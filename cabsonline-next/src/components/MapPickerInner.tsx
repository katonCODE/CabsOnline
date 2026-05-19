"use client";

import { useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { MapPoint } from "./MapPicker";

type MapPickerInnerProps = {
  destination: MapPoint | null;
  onDestinationChange: (point: MapPoint) => void;
  onPickupChange: (point: MapPoint) => void;
  pickup: MapPoint | null;
};

const auckland: [number, number] = [-36.8485, 174.7633];

const pickupIcon = L.divIcon({
  className: "",
  html: '<div class="map-marker map-marker-pickup">P</div>',
  iconAnchor: [14, 14],
  iconSize: [28, 28],
});

const destinationIcon = L.divIcon({
  className: "",
  html: '<div class="map-marker map-marker-destination">D</div>',
  iconAnchor: [14, 14],
  iconSize: [28, 28],
});

function ClickHandler({
  mode,
  onDestinationChange,
  onPickupChange,
}: {
  mode: "pickup" | "destination";
  onDestinationChange: (point: MapPoint) => void;
  onPickupChange: (point: MapPoint) => void;
}) {
  useMapEvents({
    click(event) {
      const point = {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      };

      if (mode === "pickup") {
        onPickupChange(point);
      } else {
        onDestinationChange(point);
      }
    },
  });

  return null;
}

export default function MapPickerInner({
  destination,
  onDestinationChange,
  onPickupChange,
  pickup,
}: MapPickerInnerProps) {
  const [mode, setMode] = useState<"pickup" | "destination">("pickup");

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-800">
          Map selection
        </span>
        <button
          className={`rounded-md px-3 py-2 text-sm font-semibold ${
            mode === "pickup"
              ? "bg-yellow-500 text-zinc-950"
              : "border border-zinc-300 bg-white text-zinc-700"
          }`}
          onClick={() => setMode("pickup")}
          type="button"
        >
          Pickup
        </button>
        <button
          className={`rounded-md px-3 py-2 text-sm font-semibold ${
            mode === "destination"
              ? "bg-yellow-500 text-zinc-950"
              : "border border-zinc-300 bg-white text-zinc-700"
          }`}
          onClick={() => setMode("destination")}
          type="button"
        >
          Destination
        </button>
      </div>

      <div className="h-[360px] overflow-hidden rounded-lg border border-zinc-200">
        <MapContainer center={auckland} className="h-full w-full" zoom={12}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler
            mode={mode}
            onDestinationChange={onDestinationChange}
            onPickupChange={onPickupChange}
          />
          {pickup ? (
            <Marker
              icon={pickupIcon}
              position={[pickup.latitude, pickup.longitude]}
            >
              <Popup>Pickup</Popup>
            </Marker>
          ) : null}
          {destination ? (
            <Marker
              icon={destinationIcon}
              position={[destination.latitude, destination.longitude]}
            >
              <Popup>Destination</Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>
    </section>
  );
}
