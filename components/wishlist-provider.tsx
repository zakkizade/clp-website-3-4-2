"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type WishlistContextValue = {
  wishlist: string[]
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("clp-wishlist")
      if (saved) setWishlist(JSON.parse(saved))
    } catch {
      window.localStorage.removeItem("clp-wishlist")
    } finally {
      setReady(true)
    }
  }, [])
  useEffect(() => {
    if (ready) window.localStorage.setItem("clp-wishlist", JSON.stringify(wishlist))
  }, [ready, wishlist])
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
