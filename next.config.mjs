/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    KEY: process.env.KEY,
    KEY_2: process.env.KEY_2,
    KEY_3: process.env.KEY_3,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wshytfogdrtnsyvisgan.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.JWT,
  },
}

export default nextConfig
