import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let client: ReturnType<typeof createSupabaseClient> | undefined

// Public project URL and publishable (anon) key. The anon key is safe to expose
// in client code — access is enforced by Row Level Security on the database.
const SUPABASE_URL = "https://mkyutnvicrmhnkxkufyz.supabase.co"
const SUPABASE_KEY = "sb_publishable_A9CxtVZZdnorh4abVfv7XQ_BsigU8zc"

export function createClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      SUPABASE_KEY
    client = createSupabaseClient(url, key)
  }
  return client
}
