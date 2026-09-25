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
  },
}

export default nextConfig
