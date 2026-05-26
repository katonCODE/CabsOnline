"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  driverSessionChangedEvent,
  endDriverSession,
  isDriverSessionActive,
} from "@/lib/auth/driverSession";

export default function HeaderNav() {
  const [isDriver, setIsDriver] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function syncDriverState() {
      setIsDriver(isDriverSessionActive());
      setIsReady(true);
    }

    syncDriverState();
    window.addEventListener("storage", syncDriverState);
    window.addEventListener(driverSessionChangedEvent, syncDriverState);

    return () => {
      window.removeEventListener("storage", syncDriverState);
      window.removeEventListener(driverSessionChangedEvent, syncDriverState);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex flex-wrap gap-2 text-sm font-semibold text-zinc-700">
        <Link
          className="rounded-md px-3 py-2 no-underline hover:bg-zinc-100 hover:text-yellow-700"
          href="/booking"
        >
          Booking
        </Link>
        <Link
          className="rounded-md px-3 py-2 no-underline hover:bg-zinc-100 hover:text-yellow-700"
          href="/login"
        >
          Driver login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm font-semibold text-zinc-700">
      <Link
        className="rounded-md px-3 py-2 no-underline hover:bg-zinc-100 hover:text-yellow-700"
        href={isDriver ? "/admin/bookings" : "/booking"}
      >
        {isDriver ? "View bookings" : "Booking"}
      </Link>
      {isDriver ? (
        <button
          className="rounded-md px-3 py-2 text-left hover:bg-zinc-100 hover:text-yellow-700"
          onClick={endDriverSession}
          type="button"
        >
          Logout
        </button>
      ) : (
        <Link
          className="rounded-md px-3 py-2 no-underline hover:bg-zinc-100 hover:text-yellow-700"
          href="/login"
        >
          Driver login
        </Link>
      )}
    </div>
  );
}
