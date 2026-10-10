"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { type Product } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"

type ProductStore = { products: Product[]; loading: boolean; error: string; saveProduct: (product: Product) => Promise<void>; deleteProduct: (id: string) => Promise<void> }
const ProductContext = createContext<ProductStore | null>(null)

function cleanTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.flatMap((item) => cleanTags(item))))
  }
  if (typeof value !== "string") return []
  const source = value.trim()
  if (!source) return []

  // Older rows may contain escaped or repeatedly quoted JSON. Normalize those
  // forms before parsing, then fall back to a human-readable delimiter split.
  const candidates = [source, source.replace(/\\\\/g, "\\"), source.replace(/\\/g, "")]
  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate)
      if (parsed !== candidate) return cleanTags(parsed)
    } catch {
      // Try the next normalized representation.
    }
  }

  return Array.from(new Set(source
    .replace(/\\/g, "")
    .replace(/[\[\]]/g, "")
    .split(/[,\n]+/)
    .map((item) => item.replace(/^\s*['\"]+|['\"]+\s*$/g, "").trim())
    .filter(Boolean)))
}

function toProduct(row: Record<string, unknown>): Product {
  const images = Array.isArray(row.images) ? row.images.map(String).filter(Boolean) : []
  const mainImage = String(row.main_image || row.image_url || images[0] || "")
  const orderedImages = images.length ? images : (mainImage ? [mainImage] : [])
  return {
    id: String(row.id), name: String(row.name || row.title || ""), type: String(row.type || "Jewelry"), slug: String(row.slug || row.id),
    priceInr: Number(row.price ?? row.sale_price ?? row.regular_price ?? 0), regularPriceInr: row.regular_price != null ? Number(row.regular_price) : Number(row.price ?? 0), salePriceInr: row.sale_price != null ? Number(row.sale_price) : undefined, showSaleBadge: row.show_sale_badge != null ? Boolean(row.show_sale_badge) : Boolean(row.sale_price != null || Number(row.discount_percent || 0) > 0), discountPercent: row.discount_percent != null ? Number(row.discount_percent) : 0, image: mainImage, gallery: orderedImages, tags: cleanTags(row.tags),
    category: String(row.category || "Fine Jewelry") as Product["category"], goldPurity: String(row.gold_purity || "18K"), certificate: String(row.certificate || "IGL Certified"), origin: String(row.origin || "Jaipur, India"), description: String(row.description || ""), isFeatured: Boolean(row.is_featured), showOnBanner: Boolean(row.show_on_banner ?? row.isFeatured), carat: String(row.carat || ""), metal: String(row.metal || "18K Gold"), metalOptions: row.metal_options && typeof row.metal_options === "object" ? row.metal_options as Product["metalOptions"] : undefined, videoUrl: row.video_url || row.video ? String(row.video_url || row.video) : undefined, view360: Array.isArray(row.view_360) ? row.view_360.map(String) : [],
  }
}

function toRow(product: Product) {
  const regularPrice = Number(product.regularPriceInr || product.priceInr || 0)
  const salePrice = Number(product.salePriceInr || 0)
  const price = Number(salePrice || product.priceInr || regularPrice || 0)
  const slugBase = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "product"
  const images = product.gallery.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
  const orderedImages = images.length && images[0] === product.image ? images : [product.image, ...images.filter((url) => url !== product.image)].filter(Boolean)

  return {
    name: product.name,
    slug: product.slug || `${slugBase}-${Date.now().toString().slice(-4)}`,
    price,
    sale_price: salePrice > 0 ? salePrice : null,
    regular_price: regularPrice,
    discount_percent: Number(product.discountPercent || 0),
    // showSaleBadge is presentation state derived from supported price columns.
    // Do not send it to Supabase: older products tables do not include this column.
    category: product.category || "Fine Jewelry",
    gold_purity: product.goldPurity || "",
    certificate: product.certificate || "",
    origin: product.origin || "",
    carat: product.carat || "",
    is_featured: Boolean(product.isFeatured),
    show_on_banner: Boolean(product.showOnBanner),
    video_url: product.videoUrl || "",
    description: product.description || "",
    image_url: product.image || orderedImages[0] || "",
    main_image: product.image || orderedImages[0] || "",
    images: orderedImages,
    view_360: Array.isArray(product.view360) ? product.view360 : [],
    tags: cleanTags(product.tags),
    metal_options: product.metalOptions || null,
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  // Supabase is the catalog source of truth. Start empty to avoid rendering demo
  // products while the shared catalog is loading.
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    const loadProducts = async () => {
      const { data, error: readError } = await createClient().from("products").select("*").order("created_at", { ascending: false })
      if (!active) return
      if (readError) {
        setError(readError.message)
        setItems([])
      } else {
        const remoteProducts = (data || []).map((row) => toProduct(row as Record<string, unknown>)).filter((product) => product.name)
        setError("")
        setItems(remoteProducts)
      }
      setLoading(false)
    }
    void loadProducts()
    const channel = createClient()
      .channel("products-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => { void loadProducts() })
      .subscribe()
    return () => {
      active = false
      void createClient().removeChannel(channel)
    }
  }, [])

  const saveProduct = async (product: Product) => {
  const normalizedImages = product.gallery.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
  const orderedImages = normalizedImages.length && normalizedImages[0] === product.image ? normalizedImages : [product.image, ...normalizedImages.filter((url) => url !== product.image)].filter(Boolean)
  const normalized: Product = { ...product, image: product.image || orderedImages[0] || "", gallery: orderedImages }
    const row = toRow(normalized)
    const client = createClient()
    const query = normalized.id && !normalized.id.startsWith("prod-")
      ? client.from("products").update(row).eq("id", normalized.id).select().single()
      : client.from("products").insert(row).select().single()
    const result = await query
    if (result.error) { setError(result.error.message); throw new Error(result.error.message) }
    const { data: freshRow, error: refreshError } = await client.from("products").select("*").eq("id", normalized.id || result.data.id).single()
    if (refreshError) { setError(refreshError.message); throw new Error(refreshError.message) }
    const saved = toProduct(freshRow as Record<string, unknown>)
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
