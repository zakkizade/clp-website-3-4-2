import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://wshytfogdrtnsyvisgan.supabase.co"
// Browser bundles only expose NEXT_PUBLIC_* variables. Keep KEY as a fallback
// for server-side environments, but never construct the client during import.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.KEY_2 ?? process.env.KEY

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient | null {
  if (!supabaseAnonKey) return null
  browserClient ??= createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}

export const supabase = typeof window === "undefined" ? null : createClient()
