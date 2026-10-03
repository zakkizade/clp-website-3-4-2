import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://wshytfogdrtnsyvisgan.supabase.co"
// JWT_5 is injected by the project environment. Keep the publishable key fallback
// so browser bundles never initialize Supabase with an undefined key.
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.JWT_5 || "sb_publishable_gc6lMtAmQ7sWlxoW-FayIw_JSPsZfPZ"

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function createClient(): SupabaseClient {
  return supabase
}
