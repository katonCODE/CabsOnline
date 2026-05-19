import AdminAccessGate from "@/components/AdminAccessGate";
import AdminBookingMap from "@/components/AdminBookingMap";

export default function AdminMapPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950">Map</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          View pickup markers for bookings that have map coordinates.
        </p>
      </section>

      <AdminAccessGate>
        <AdminBookingMap />
      </AdminAccessGate>
    </main>
  );
}
