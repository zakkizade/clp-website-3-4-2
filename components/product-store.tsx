"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { products as seedProducts, type Product } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"

type ProductStore = { products: Product[]; loading: boolean; error: string; saveProduct: (product: Product) => Promise<void>; deleteProduct: (id: string) => Promise<void> }
const ProductContext = createContext<ProductStore | null>(null)

function toProduct(row: Record<string, unknown>): Product {
  const images = Array.isArray(row.images) ? row.images.map(String).filter(Boolean) : []
  const mainImage = String(row.main_image || row.image_url || images[0] || "")
  return {
    id: String(row.id), name: String(row.name || row.title || ""), type: String(row.type || "Jewelry"), slug: String(row.slug || row.id),
    priceInr: Number(row.price ?? row.sale_price ?? row.regular_price ?? 0), regularPriceInr: row.regular_price != null ? Number(row.regular_price) : Number(row.price ?? 0), salePriceInr: row.sale_price != null ? Number(row.sale_price) : undefined, showSaleBadge: row.sale_price != null, discountPercent: row.discount_percent ? Number(row.discount_percent) : undefined, image: mainImage, gallery: Array.from(new Set([mainImage, ...images].filter(Boolean))), tags: Array.isArray(row.tags) ? row.tags.map(String) : typeof row.tags === "string" ? row.tags.split(/[,\n]+/).map((tag) => tag.trim()).filter(Boolean) : [],
    category: String(row.category || "Fine Jewelry") as Product["category"], goldPurity: String(row.gold_purity || "18K"), certificate: String(row.certificate || "IGL Certified"), origin: String(row.origin || "Jaipur, India"), description: String(row.description || ""), isFeatured: Boolean(row.is_featured), showOnBanner: Boolean(row.show_on_banner ?? row.is_featured), carat: String(row.carat || ""), metal: String(row.metal || "18K Gold"), videoUrl: row.video_url ? String(row.video_url) : undefined, view360: Array.isArray(row.view_360) ? row.view_360.map(String) : [],
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
    discount_percent: Number(product.discountPercent || 0),
    category: product.category || "Fine Jewelry",
    type: product.type || "Jewelry",
    carat: product.carat || "",
    gold_purity: product.goldPurity || "",
    origin: product.origin || "",
    certificate: product.certificate || "",
    description: product.description || "",
    image_url: product.image || images[0] || "",
    main_image: product.image || images[0] || "",
    images,
    tags: product.tags || [],
    video_url: product.videoUrl || "",
    is_featured: Boolean(product.isFeatured),
    show_on_banner: Boolean(product.showOnBanner ?? product.isFeatured),
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    const loadProducts = async () => {
      setLoading(true)
      const { data, error: readError } = await createClient().from("products").select("*").order("created_at", { ascending: false })
      if (!active) return
      if (readError) { setError(readError.message); setItems([]) } else { setError(""); setItems((data || []).map((row) => toProduct(row as Record<string, unknown>))) }
      setLoading(false)
    }
    void loadProducts()
    return () => { active = false }
  }, [])

  const saveProduct = async (product: Product) => {
    const normalized: Product = { ...product, image: product.image || product.gallery[0] || "", gallery: Array.from(new Set([product.image, ...product.gallery].filter((url) => /^https:\/\//.test(url)))) }
    if (!normalized.image || normalized.gallery.length === 0) throw new Error("A public HTTPS product image is required.")
    const row = toRow(normalized)
    const client = createClient()
    const result = normalized.id && !normalized.id.startsWith("prod-")
      ? await client.from("products").update(row).eq("id", normalized.id).select().single()
      : await client.from("products").insert(row).select().single()
    if (result.error) { setError(result.error.message); throw new Error(result.error.message) }
    const saved = toProduct(result.data as Record<string, unknown>)
    setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
  }

  const deleteProduct = async (id: string) => {
    const { error: deleteError } = await createClient().from("products").delete().eq("id", id)
    if (deleteError) { setError(deleteError.message); throw new Error(deleteError.message) }
    setItems((current) => current.filter((item) => item.id !== id))
  }

  const value = useMemo(() => ({ products: items, loading, error, saveProduct, deleteProduct }), [items, loading, error])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() { const context = useContext(ProductContext); if (!context) throw new Error("useProducts must be used inside ProductProvider"); return context }
