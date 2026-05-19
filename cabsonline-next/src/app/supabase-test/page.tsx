import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { supabase } from "@/lib/supabase/client";

export default function SupabaseTestPage() {
  const config = getSupabaseConfigStatus();
  const isConfigured = config.hasUrl && config.hasPublishableKey;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
          Setup
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950">
          Supabase test
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          This page checks that the Supabase client can be created from
          environment variables.
        </p>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4">
          <div className="grid gap-1">
            <dt className="text-sm font-medium text-zinc-600">Status</dt>
            <dd className="text-lg font-semibold text-zinc-950">
              {isConfigured ? "Configured" : "Missing environment variables"}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-sm font-medium text-zinc-600">Project URL</dt>
            <dd className="break-all text-zinc-800">
              {config.url || "Not set"}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-sm font-medium text-zinc-600">
              Publishable key
            </dt>
            <dd className="text-zinc-800">
              {config.hasPublishableKey ? "Loaded from .env.local" : "Not set"}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-sm font-medium text-zinc-600">
              Client object
            </dt>
            <dd className="text-zinc-800">
              {supabase ? "Created successfully" : "Not created"}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
