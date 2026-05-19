import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

const { publishableKey, url } = getSupabaseConfig();

export const supabase = createClient<Database>(url, publishableKey);
