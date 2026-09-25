import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = "https://wshytfogdrtnsyvisgan.supabase.co"
const supabaseAnonKey = process.env.KEY

let browserClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!supabaseAnonKey) {
    throw new Error("Supabase client is not configured: KEY is missing.")
  }

  browserClient ??= createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}

export const supabase = typeof window === "undefined" ? null : createClient()
