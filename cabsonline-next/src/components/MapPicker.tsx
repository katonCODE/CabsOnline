"use client";

import dynamic from "next/dynamic";

export type MapPoint = {
  latitude: number;
  longitude: number;
};

export type MapSelectionMode = "pickup" | "destination";

type MapPickerProps = {
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

const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
});

export default function MapPicker(props: MapPickerProps) {
  return <MapPickerInner {...props} />;
}
