export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return {
    publishableKey,
    url,
  };
}

export function getSupabaseConfigStatus() {
  return {
    hasPublishableKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  };
}

export function getDriverLoginEmail() {
  return process.env.NEXT_PUBLIC_SUPABASE_DRIVER_EMAIL ?? "driver@cabsonline.local";
}
