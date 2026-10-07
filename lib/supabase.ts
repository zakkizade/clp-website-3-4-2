import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

// Both values are inlined at build time by next.config.mjs (URL + anon key sourced from process.env.JWT).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (from JWT) are required.")
}

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function createClient(): SupabaseClient {
  return supabase
}

export function toCleanPublicUrl(url: string) {
  const parsed = new URL(url.trim())
  parsed.search = ""
  parsed.hash = ""
  return parsed.toString()
}
