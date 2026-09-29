import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://wshytfogdrtnsyvisgan.supabase.co"
const SUPABASE_ANON_KEY = process.env.KEY_5 || "sb_publishable_gc6lMtAmQ7sWlxoW-FayIw_JSPsZfPZ"

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function createClient(): SupabaseClient {
  return supabase
}
