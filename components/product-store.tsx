"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { products as fallbackProducts, type Product } from "@/lib/products"
const PRODUCT_STORAGE_KEY = "clp-products"
const PRODUCT_SYNC_EVENT = "clp-products-updated"

type ProductStore = { products: Product[]; loading: boolean; error: string; saveProduct: (product: Product) => Promise<void>; deleteProduct: (id: string) => Promise<void> }
const ProductContext = createContext<ProductStore | null>(null)

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name || ""), type: String(row.type || "Jewelry"), slug: String(row.slug || row.id),
    priceInr: Number(row.sale_price_inr || row.price_inr || 0), regularPriceInr: Number(row.regular_price_inr || row.price_inr || 0), salePriceInr: row.sale_price_inr ? Number(row.sale_price_inr) : undefined, showSaleBadge: Boolean(row.show_sale_badge), discountPercent: row.discount_percent ? Number(row.discount_percent) : undefined, image: String(row.image || ""), gallery: Array.isArray(row.gallery) ? row.gallery.map(String) : [], tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    category: String(row.category || "Fine Jewelry") as Product["category"], goldPurity: String(row.gold_purity || "18K"), certificate: String(row.certificate || "IGL Certified"), origin: String(row.origin || "Jaipur, India"), description: String(row.description || ""), isFeatured: Boolean(row.is_featured), carat: String(row.carat || ""), metal: String(row.metal || "18K Gold"), videoUrl: row.video_url ? String(row.video_url) : undefined, view360: Array.isArray(row.view_360) ? row.view_360.map(String) : [],
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PRODUCT_STORAGE_KEY)
      const saved = stored ? JSON.parse(stored) as Product[] : []
      // Keep the built-in catalog available while allowing admin-created products to persist.
      const savedById = new Map(saved.map((product) => [product.id, product]))
      const merged = [...saved, ...fallbackProducts.filter((product) => !savedById.has(product.id))]
      setItems(merged)
      if (saved.length) window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(merged))
    } catch {
      setItems(fallbackProducts)
      setError("Using the local catalog preview.")
    } finally { setLoading(false) }
    const sync = () => { try { const stored = window.localStorage.getItem(PRODUCT_STORAGE_KEY); if (stored) setItems(JSON.parse(stored) as Product[]) } catch { setError("Unable to read the local catalog.") } }
    window.addEventListener(PRODUCT_SYNC_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => { window.removeEventListener(PRODUCT_SYNC_EVENT, sync); window.removeEventListener("storage", sync) }
  }, [])
  const persist = (next: Product[]) => { setItems(next); window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(next)); window.dispatchEvent(new Event(PRODUCT_SYNC_EVENT)) }
  const saveProduct = async (product: Product) => {
    const current = items
    persist(current.some((item) => item.id === product.id) ? current.map((item) => item.id === product.id ? product : item) : [product, ...current])
    setError("")
  }
  const deleteProduct = async (id: string) => { persist(items.filter((item) => item.id !== id)) }
  const value = useMemo(() => ({ products: items, loading, error, saveProduct, deleteProduct }), [items, loading, error])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() { const context = useContext(ProductContext); if (!context) throw new Error("useProducts must be used inside ProductProvider"); return context }
