import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createSupabaseClient> | undefined

export function createClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wshytfogdrtnsyvisgan.supabase.co"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.Key_2 || process.env.SUPABASE_ANON_KEY
    if (!url || !key) throw new Error("Supabase environment variables are not configured")
    client = createSupabaseClient(url, key)
  }
  return client
}
