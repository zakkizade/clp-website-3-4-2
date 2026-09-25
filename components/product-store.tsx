"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { type Product } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"

type ProductStore = { products: Product[]; loading: boolean; error: string; saveProduct: (product: Product) => Promise<void>; deleteProduct: (id: string) => Promise<void> }
const ProductContext = createContext<ProductStore | null>(null)

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name || ""), type: String(row.type || "Jewelry"), slug: String(row.slug || row.id),
    priceInr: Number(row.sale_price_inr || row.price_inr || 0), regularPriceInr: Number(row.regular_price_inr || row.price_inr || 0), salePriceInr: row.sale_price_inr ? Number(row.sale_price_inr) : undefined, showSaleBadge: Boolean(row.show_sale_badge), discountPercent: row.discount_percent ? Number(row.discount_percent) : undefined, image: String(row.image || ""), gallery: Array.isArray(row.gallery) ? row.gallery.map(String) : [], tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    category: String(row.category || "Fine Jewelry") as Product["category"], goldPurity: String(row.gold_purity || "18K"), certificate: String(row.certificate || "IGL Certified"), origin: String(row.origin || "Jaipur, India"), description: String(row.description || ""), isFeatured: Boolean(row.is_featured), carat: String(row.carat || ""), metal: String(row.metal || "18K Gold"), videoUrl: row.video_url ? String(row.video_url) : undefined, view360: Array.isArray(row.view_360) ? row.view_360.map(String) : [],
  }
}

function toRow(product: Product) {
  return { id: product.id, name: product.name, type: product.type, slug: product.slug, price_inr: product.priceInr, regular_price_inr: product.regularPriceInr ?? product.priceInr, sale_price_inr: product.salePriceInr ?? null, show_sale_badge: product.showSaleBadge ?? false, discount_percent: product.discountPercent ?? null, image: product.image, gallery: product.gallery, tags: product.tags, category: product.category, gold_purity: product.goldPurity, certificate: product.certificate, origin: product.origin, description: product.description, is_featured: product.isFeatured, carat: product.carat, metal: product.metal, video_url: product.videoUrl ?? null, view_360: product.view360 ?? [] }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    const client = createClient()
    let active = true
    if (!client) {
      setError("Supabase is not configured. Add the KEY_2 environment variable to load products.")
      setLoading(false)
      return () => { active = false }
    }
    const load = async () => {
      setLoading(true)
      const { data, error: fetchError } = await client.from("products").select("*")
      if (!active) return
      if (fetchError) {
        setItems([])
        setError(`Live catalog unavailable: ${fetchError.message}`)
        setLoading(false)
        return
      }
      setItems((data ?? []).map((row) => toProduct(row as Record<string, unknown>)))
      setError("")
      setLoading(false)
    }
    void load()
    const channel = client.channel("products-realtime").on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => { void load() }).subscribe()
    return () => { active = false; void client.removeChannel(channel) }
  }, [])
  const saveProduct = async (product: Product) => {
    const client = createClient()
    if (!client) throw new Error("Supabase is not configured.")
    const exists = items.some((item) => item.id === product.id)
    const query = exists
      ? client.from("products").update(toRow(product)).eq("id", product.id).select("*").single()
      : client.from("products").insert([toRow(product)]).select("*").single()
    const { data, error: saveError } = await query
    if (saveError) throw saveError
    setItems((current) => [toProduct(data as Record<string, unknown>), ...current.filter((item) => item.id !== product.id)])
    setError("")
  }
  const deleteProduct = async (id: string) => {
    const client = createClient()
    if (!client) throw new Error("Supabase is not configured.")
    const { error: deleteError } = await client.from("products").delete().eq("id", id)
    if (deleteError) throw deleteError
    setItems((current) => current.filter((item) => item.id !== id))
  }
  const value = useMemo(() => ({ products: items, loading, error, saveProduct, deleteProduct }), [items, loading, error])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() { const context = useContext(ProductContext); if (!context) throw new Error("useProducts must be used inside ProductProvider"); return context }
