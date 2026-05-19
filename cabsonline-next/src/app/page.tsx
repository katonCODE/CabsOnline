import Link from "next/link";

const routes = [
  {
    href: "/booking",
    title: "Book a cab",
    description: "Create a customer booking with optional map points.",
  },
  {
    href: "/admin/bookings",
    title: "Admin bookings",
    description: "Review and manage incoming bookings.",
  },
  {
    href: "/admin/map",
    title: "Admin map",
    description: "View mapped bookings and assign unassigned jobs.",
  },
  {
    href: "/login",
    title: "Login",
    description: "Sign-in page scaffold for admin access.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
          CabsOnline
        </p>
        <h1 className="max-w-3xl text-4xl font-bold text-zinc-950">
          Online cab booking and admin assignment workflow.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600">
          Customers can submit bookings, while admins can search, review, and
          assign incoming jobs.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {routes.map((route) => (
          <Link
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-yellow-500 hover:shadow-md"
            href={route.href}
            key={route.href}
          >
            <h2 className="text-xl font-semibold text-zinc-950">
              {route.title}
            </h2>
            <p className="mt-2 text-zinc-600">{route.description}</p>
            <span className="mt-5 inline-block text-sm font-semibold text-yellow-700">
              Open page
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
