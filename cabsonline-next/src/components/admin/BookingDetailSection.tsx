import type { ReactNode } from "react";

export function BookingDetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <h2 className="border-b border-zinc-100 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-yellow-700">
        {title}
      </h2>
      <dl className="px-5">{children}</dl>
    </section>
  );
}

export function BookingDetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 last:border-b-0 sm:grid-cols-3">
      <dt className="text-sm font-semibold text-zinc-700">{label}</dt>
      <dd className="text-sm text-zinc-900 sm:col-span-2">{value}</dd>
    </div>
  );
}
