"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { type Product } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"

type ProductStore = { products: Product[]; loading: boolean; error: string; saveProduct: (product: Product) => Promise<void>; deleteProduct: (id: string) => Promise<void> }
const ProductContext = createContext<ProductStore | null>(null)

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name || ""), type: String(row.type || "Jewelry"), slug: String(row.slug || row.id),
    priceInr: Number(row.sale_price ?? row.sale_price_inr ?? row.price ?? row.price_inr ?? 0), regularPriceInr: Number(row.regular_price ?? row.regular_price_inr ?? row.price ?? row.price_inr ?? 0), salePriceInr: row.sale_price != null || row.sale_price_inr != null ? Number(row.sale_price ?? row.sale_price_inr) : undefined, showSaleBadge: Boolean(row.show_sale_badge || row.sale_price != null || row.sale_price_inr != null), discountPercent: row.discount_percent ? Number(row.discount_percent) : undefined, image: String(row.image_url || row.image || ""), gallery: Array.isArray(row.images) ? row.images.map(String) : Array.isArray(row.gallery) ? row.gallery.map(String) : [], tags: Array.isArray(row.tags) ? row.tags.map(String) : typeof row.tags === "string" ? row.tags.split(/[,\n]+/).map((tag) => tag.trim()).filter(Boolean) : [],
    category: String(row.category || "Fine Jewelry") as Product["category"], goldPurity: String(row.gold_purity || "18K"), certificate: String(row.certificate || "IGL Certified"), origin: String(row.origin || "Jaipur, India"), description: String(row.description || ""), isFeatured: Boolean(row.is_featured), carat: String(row.carat || ""), metal: String(row.metal || "18K Gold"), videoUrl: row.video_url ? String(row.video_url) : undefined, view360: Array.isArray(row.view_360) ? row.view_360.map(String) : [],
  }
}

function toRow(product: Product) {
  const regularPrice = Number(product.regularPriceInr || product.priceInr || 0)
  const salePrice = Number(product.salePriceInr || 0)
  const price = Number(salePrice || product.priceInr || regularPrice || 0)
  const slugBase = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "product"
  const images = Array.from(new Set([product.image, ...product.gallery].filter(Boolean)))

  return {
    name: product.name,
    slug: product.slug || `${slugBase}-${Date.now().toString().slice(-4)}`,
    price,
    regular_price: regularPrice,
    sale_price: salePrice || null,
    category: product.category || "Fine Jewelry",
    type: product.type || "Jewelry",
    description: product.description || "",
    image_url: product.image || images[0] || "",
    images,
    carat: product.carat || "",
    gold_purity: product.goldPurity || "",
    tags: product.tags || [],
    certificate: product.certificate || "",
    origin: product.origin || "",
    is_featured: Boolean(product.isFeatured),
    video_url: product.videoUrl || null,
    view_360: product.view360 || [],
  }
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
