import Link from "next/link";
import LandingTaxiScene from "@/components/LandingTaxiScene";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative min-h-[calc(100vh-89px)] overflow-hidden bg-zinc-100">
        <LandingTaxiScene />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-89px)] w-full max-w-5xl flex-col items-center justify-center px-6 py-12 sm:py-16">
          <section className="flex w-full max-w-2xl flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Cabs Online
            </h1>

            <div className="mt-10 flex w-full max-w-lg flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                className="rounded-xl bg-yellow-500 px-10 py-5 text-center text-lg font-bold text-zinc-950 transition hover:bg-yellow-400 sm:min-w-[220px] sm:text-xl"
                href="/booking"
              >
                Book a cab
              </Link>
              <Link
                className="rounded-xl border-2 border-zinc-300 bg-zinc-50 px-10 py-5 text-center text-lg font-bold text-zinc-800 transition hover:border-yellow-500 hover:text-yellow-700 sm:min-w-[220px] sm:text-xl"
                href="/login"
              >
                Driver login
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
