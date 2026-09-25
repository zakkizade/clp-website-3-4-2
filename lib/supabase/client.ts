import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://wshytfogdrtnsyvisgan.supabase.co"
// Browser bundles only expose NEXT_PUBLIC_* variables; KEY_3 is available to the
// project runtime through the configured environment variables.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.KEY_3

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient | null {
  if (!supabaseAnonKey) return null
  browserClient ??= createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}

export const supabase = typeof window === "undefined" ? null : createClient()
