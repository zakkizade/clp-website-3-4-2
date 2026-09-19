"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type CartContextValue = { cartItems: string[]; setCartItems: React.Dispatch<React.SetStateAction<string[]>>; addToCart: (productId: string) => void; removeFromCart: (productId: string) => void; clearCart: () => void }
const CartContext = createContext<CartContextValue | null>(null)
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  useEffect(() => { try { const saved = window.localStorage.getItem("clp-cart"); if (saved) setCartItems(JSON.parse(saved)) } catch { window.localStorage.removeItem("clp-cart") } finally { setReady(true) } }, [])
  useEffect(() => { if (ready) window.localStorage.setItem("clp-cart", JSON.stringify(cartItems)) }, [ready, cartItems])
  const value = useMemo(() => ({ cartItems, setCartItems, addToCart: (id: string) => setCartItems((items) => items.includes(id) ? items : [...items, id]), removeFromCart: (id: string) => setCartItems((items) => items.filter((item) => item !== id)), clearCart: () => setCartItems([]) }), [cartItems])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider"); return context }
