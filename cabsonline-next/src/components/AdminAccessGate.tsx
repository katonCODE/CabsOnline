"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { getCurrentUserProfile } from "@/lib/supabase/profiles";

type AccessState = "checking" | "allowed" | "denied";

export default function AdminAccessGate({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<AccessState>("checking");

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      const { data } = await getCurrentUserProfile();

      if (isMounted) {
        setAccess(data?.role === "admin" ? "allowed" : "denied");
      }
    }

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (access === "checking") {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-zinc-600">Checking admin access...</p>
      </section>
    );
  }

  if (access === "denied") {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">
          Admin access required
        </h2>
        <p className="mt-2 text-zinc-600">
          Sign in with a Supabase user whose profile role is admin.
        </p>
        <Link
          className="mt-4 inline-block rounded-md bg-yellow-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-yellow-400"
          href="/login"
        >
          Go to login
        </Link>
      </section>
    );
  }

  return <>{children}</>;
}
