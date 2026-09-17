import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WishlistProvider } from '@/components/wishlist-provider'

export const metadata: Metadata = {
  title: 'CLP | Natural Gemstones & Fine Jewelry from Jaipur',
  description: 'Discover certified natural gemstones and fine jewelry, shaped by hand in Jaipur and made for everywhere.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#062E22',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased"><WishlistProvider>{children}</WishlistProvider>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
