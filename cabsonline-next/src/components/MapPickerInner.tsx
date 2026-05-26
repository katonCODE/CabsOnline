"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { MapPoint, MapSelectionMode } from "./MapPicker";

type MapPickerInnerProps = {
  activeMode: MapSelectionMode;
  distanceKm: number | null;
  destination: MapPoint | null;
  focusPoint: MapPoint | null;
  onClearDestination: () => void;
  onClearPickup: () => void;
  onModeChange: (mode: MapSelectionMode) => void;
  onPointSelect: (mode: MapSelectionMode, point: MapPoint) => void;
  pickup: MapPoint | null;
};

const auckland: [number, number] = [-36.8485, 174.7633];

const pickupIcon = L.divIcon({
  className: "",
  html: '<div class="map-marker map-marker-pickup">P</div>',
  iconAnchor: [18, 18],
  iconSize: [36, 36],
});

const destinationIcon = L.divIcon({
  className: "",
  html: '<div class="map-marker map-marker-destination">D</div>',
  iconAnchor: [18, 18],
  iconSize: [36, 36],
});

function MapFocus({ point }: { point: MapPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (point) {
      map.setView([point.latitude, point.longitude], 15);
    }
  }, [map, point]);

  return null;
}

function MapClickHandler({
  activeMode,
  onPointSelect,
}: {
  activeMode: MapSelectionMode;
  onPointSelect: (mode: MapSelectionMode, point: MapPoint) => void;
}) {
  useMapEvents({
    click(event) {
      onPointSelect(activeMode, {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapPickerInner({
  activeMode,
  distanceKm,
  destination,
  focusPoint,
  onClearDestination,
  onClearPickup,
  onModeChange,
  onPointSelect,
  pickup,
}: MapPickerInnerProps) {
  const route =
    pickup && destination
      ? ([
          [pickup.latitude, pickup.longitude],
          [destination.latitude, destination.longitude],
        ] as [number, number][])
      : null;

  return (
    <section className="grid gap-3">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-zinc-800">
          Map trip selector
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
              activeMode === "pickup"
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
            onClick={() => onModeChange("pickup")}
            type="button"
          >
            Set pickup
          </button>
          <button
            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
              activeMode === "destination"
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
            onClick={() => onModeChange("destination")}
            type="button"
          >
            Set destination
          </button>
          <button
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!pickup}
            onClick={onClearPickup}
            type="button"
          >
            Clear pickup
          </button>
          <button
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!destination}
            onClick={onClearDestination}
            type="button"
          >
            Clear destination
          </button>
        </div>
        <p className="text-sm text-zinc-600">
          Click the map to place the selected point.{" "}
          {distanceKm !== null
            ? `Approx. direct distance: ${distanceKm.toFixed(1)} km.`
            : "Choose both points to see the approximate direct distance."}
        </p>
      </div>

      <div className="h-[360px] overflow-hidden rounded-lg border border-zinc-200">
        <MapContainer center={auckland} className="h-full w-full" zoom={12}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFocus point={focusPoint} />
          <MapClickHandler
            activeMode={activeMode}
            onPointSelect={onPointSelect}
          />
          {route ? (
            <Polyline
              pathOptions={{ color: "#2563eb", dashArray: "8 8", weight: 4 }}
              positions={route}
            />
          ) : null}
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
