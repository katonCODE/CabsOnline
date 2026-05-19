"use client";

import dynamic from "next/dynamic";

export type MapPoint = {
  latitude: number;
  longitude: number;
};

type MapPickerProps = {
  destination: MapPoint | null;
  onDestinationChange: (point: MapPoint) => void;
  onPickupChange: (point: MapPoint) => void;
  pickup: MapPoint | null;
};

const MapPickerInner = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
});

export default function MapPicker(props: MapPickerProps) {
  return <MapPickerInner {...props} />;
}
