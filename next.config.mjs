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
  },
}

export default nextConfig
