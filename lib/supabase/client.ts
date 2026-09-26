import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://wshytfogdrtnsyvisgan.supabase.co"
const supabaseAnonKey = process.env.KEY_6 ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient | null {
  if (!supabaseAnonKey) return null
  browserClient ??= createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}

export const supabase = typeof window === "undefined" ? null : createClient()
