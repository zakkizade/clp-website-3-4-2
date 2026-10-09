import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { WishlistProvider } from '@/components/wishlist-provider'
import { CartProvider } from '@/components/cart-provider'
import { ProductProvider } from '@/components/product-store'
import { CurrencyProvider } from '@/components/currency-provider'

export const metadata: Metadata = {
  title: 'CLP | Natural Gemstones & Fine Jewelry from Jaipur',
  description: 'Discover certified natural gemstones and fine jewelry, shaped by hand in Jaipur and made for everywhere.',
  generator: 'v0.app',
  metadataBase: new URL('https://clpjewels.com'),
  openGraph: { title: 'CLP Jewels | Natural Gemstones & Fine Jewelry from Jaipur', description: 'Certified natural gemstones and fine jewelry shaped in Jaipur since 1987.', type: 'website', siteName: 'CLP Jewels' },
  twitter: { card: 'summary_large_image', title: 'CLP Jewels | Jaipur Fine Jewelry', description: 'Natural gemstones and heirloom jewelry from Jaipur.' },
  alternates: { canonical: '/' },
  icons: { icon: '/clp-official-logo.png', apple: '/clp-official-logo.png' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased"><CurrencyProvider><ProductProvider><WishlistProvider><CartProvider>{children}</CartProvider></WishlistProvider></ProductProvider></CurrencyProvider>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
