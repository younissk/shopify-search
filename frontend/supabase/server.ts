"use server";

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseUrl: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL or anon key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or their server equivalents) are set."
  );
}

/**
 * Get an authenticated Supabase client with Clerk JWT
 * Use this for server-side operations that require authentication (RLS policies)
 */
export async function getAuthenticatedSupabaseClient() {
  const { getToken } = await auth();
  
  // Get the JWT token from Clerk with Supabase template
  const token = await getToken({ template: "supabase" });
  
  if (!token) {
    throw new Error("No authentication token available");
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
