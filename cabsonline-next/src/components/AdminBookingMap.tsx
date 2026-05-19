"use client";

import dynamic from "next/dynamic";

const AdminBookingMapInner = dynamic(() => import("./AdminBookingMapInner"), {
  ssr: false,
});

export default function AdminBookingMap() {
  return <AdminBookingMapInner />;
}
