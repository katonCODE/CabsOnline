"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { startDriverSession } from "@/lib/auth/driverSession";
import { getDefaultDriverProfileId } from "@/lib/supabase/bookings";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const normalizedUsername = username.trim().toLowerCase();

    await new Promise((resolve) => setTimeout(resolve, 250));

    setIsSubmitting(false);

    if (normalizedUsername !== "driver" || password !== "driver") {
      setMessage("Invalid driver login details.");
      return;
    }

    const { data: driverProfileId } = await getDefaultDriverProfileId();
    startDriverSession(typeof driverProfileId === "string" ? driverProfileId : null);
    setMessage("Signed in successfully.");
    router.push("/admin/bookings");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
          Driver
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950">Driver login</h1>
        <p className="mt-3 text-zinc-600">
          Sign in with the pre-registered driver account.
        </p>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-zinc-800">
            Username
            <input
              className="rounded-md border border-zinc-300 px-3 py-2"
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              type="text"
              value={username}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-zinc-800">
            Password
            <input
              className="rounded-md border border-zinc-300 px-3 py-2"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {message ? (
            <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
              {message}
            </p>
          ) : null}
          <button
            className="rounded-md bg-yellow-500 px-5 py-2 font-semibold text-zinc-950 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
