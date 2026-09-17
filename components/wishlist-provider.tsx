"use client"

import { createContext, useContext, useMemo, useState } from "react"

type WishlistContextValue = {
  wishlist: string[]
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const value = useMemo(() => ({
    wishlist,
    toggleWishlist: (productId: string) => setWishlist((items) => items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]),
    isWishlisted: (productId: string) => wishlist.includes(productId),
  }), [wishlist])

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider")
  return context
}
