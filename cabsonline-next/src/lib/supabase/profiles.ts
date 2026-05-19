import { supabase } from "./client";
import type {
  CabsonlineProfileInsert,
  CabsonlineProfileUpdate,
} from "./database.types";

export async function getProfile(profileId: string) {
  return supabase
    .from("cabsonline_profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();
}

export async function upsertProfile(profile: CabsonlineProfileInsert) {
  return supabase
    .from("cabsonline_profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();
}

export async function updateProfile(
  profileId: string,
  updates: CabsonlineProfileUpdate,
) {
  return supabase
    .from("cabsonline_profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();
}

export async function getCurrentUserProfile() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { data: null, error };
  }

  return getProfile(user.id);
}
