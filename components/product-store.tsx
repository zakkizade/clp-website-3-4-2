"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { products as seedProducts, type Product } from "@/lib/products"

type ProductStore = { products: Product[]; saveProduct: (product: Product) => void; deleteProduct: (id: string) => void }
const ProductContext = createContext<ProductStore | null>(null)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(seedProducts)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("clp-products")
      if (saved) setItems(JSON.parse(saved))
    } catch { window.localStorage.removeItem("clp-products") } finally { setReady(true) }
  }, [])
  useEffect(() => { if (ready) window.localStorage.setItem("clp-products", JSON.stringify(items)) }, [ready, items])
  const value = useMemo(() => ({ products: items, saveProduct: (product: Product) => setItems((current) => { const exists = current.some((item) => item.id === product.id); return exists ? current.map((item) => item.id === product.id ? product : item) : [...current, product] }), deleteProduct: (id: string) => setItems((current) => current.filter((item) => item.id !== id)) }), [items])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() { const context = useContext(ProductContext); if (!context) throw new Error("useProducts must be used inside ProductProvider"); return context }
export { seedProducts }
