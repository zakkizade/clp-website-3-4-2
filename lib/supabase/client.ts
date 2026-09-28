import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://wshytfogdrtnsyvisgan.supabase.co"
const supabaseAnonKey = "sb_publishable_gc6lMtAmQ7sWlxoW-FayIw_JSPsZfPZ"

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  browserClient ??= createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}

export const supabase = createClient()
