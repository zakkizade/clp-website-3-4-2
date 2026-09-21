"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { products as seedProducts, type Product } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"

type ProductStore = { products: Product[]; loading: boolean; error: string; saveProduct: (product: Product) => Promise<void>; deleteProduct: (id: string) => Promise<void> }
const ProductContext = createContext<ProductStore | null>(null)

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name || ""), type: String(row.type || "Jewelry"), slug: String(row.slug || row.id),
    priceInr: Number(row.price_inr || 0), image: String(row.image || ""), gallery: Array.isArray(row.gallery) ? row.gallery.map(String) : [], tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    category: String(row.category || "Fine Jewelry") as Product["category"], goldPurity: String(row.gold_purity || "18K"), certificate: String(row.certificate || "IGL Certified"), origin: String(row.origin || "Jaipur, India"), description: String(row.description || ""), isFeatured: Boolean(row.is_featured), carat: String(row.carat || ""), metal: String(row.metal || "18K Gold"), videoUrl: row.video_url ? String(row.video_url) : undefined, view360: Array.isArray(row.view_360) ? row.view_360.map(String) : [],
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    const load = async () => {
      const { data, error: queryError } = await createClient().from("products").select("id,name,type,slug,price_inr,image,gallery,tags,category,gold_purity,certificate,origin,description,is_featured,carat,metal,video_url,view_360").order("created_at", { ascending: false })
      if (!active) return
      if (queryError) { setError(queryError.message || "Unable to load the catalog."); setItems([]); setLoading(false); return }
      if (data?.length) setItems(data.map((row) => toProduct(row as Record<string, unknown>)))
      else {
        const seedRows = seedProducts.map((product) => ({ id: product.id, name: product.name, type: product.type, slug: product.slug, price_inr: product.priceInr, image: product.image, gallery: product.gallery, tags: product.tags, category: product.category, gold_purity: product.goldPurity, certificate: product.certificate, origin: product.origin, description: product.description, is_featured: product.isFeatured, carat: product.carat, metal: product.metal, video_url: product.videoUrl || null, view_360: product.view360 || [] }))
        const { data: seeded } = await createClient().from("products").upsert(seedRows).select("id,name,type,slug,price_inr,image,gallery,tags,category,gold_purity,certificate,origin,description,is_featured,carat,metal,video_url,view_360")
        setItems(seeded?.length ? seeded.map((row) => toProduct(row as Record<string, unknown>)) : seedProducts)
      }
      setLoading(false)
    }
    load().catch(() => { if (active) { setError("Unable to connect to the catalog."); setItems(seedProducts); setLoading(false) } })
    return () => { active = false }
  }, [])
  useEffect(() => {
    const refresh = () => { void createClient().from("products").select("id,name,type,slug,price_inr,image,gallery,tags,category,gold_purity,certificate,origin,description,is_featured,carat,metal,video_url,view_360").order("created_at", { ascending: false }).then(({ data }) => { if (data?.length) setItems(data.map((row) => toProduct(row as Record<string, unknown>))) }) }
    const interval = window.setInterval(refresh, 30000)
    return () => window.clearInterval(interval)
  }, [])
  const saveProduct = async (product: Product) => {
    const payload = { id: product.id, name: product.name, type: product.type, slug: product.slug, price_inr: product.priceInr, image: product.image, gallery: product.gallery, tags: product.tags, category: product.category, gold_purity: product.goldPurity, certificate: product.certificate, origin: product.origin, description: product.description, is_featured: product.isFeatured, carat: product.carat, metal: product.metal, video_url: product.videoUrl || null, view_360: product.view360 || [], updated_at: new Date().toISOString() }
    const { data, error: mutationError } = await createClient().from("products").upsert(payload).select("id,name,type,slug,price_inr,image,gallery,tags,category,gold_purity,certificate,origin,description,is_featured,carat,metal,video_url,view_360").single()
    if (mutationError) throw mutationError
    setItems((current) => { const next = toProduct(data as Record<string, unknown>); return current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [next, ...current] })
  }
  const deleteProduct = async (id: string) => { const { error: mutationError } = await createClient().from("products").delete().eq("id", id); if (mutationError) throw mutationError; setItems((current) => current.filter((item) => item.id !== id)) }
  const value = useMemo(() => ({ products: items, loading, error, saveProduct, deleteProduct }), [items, loading, error])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() { const context = useContext(ProductContext); if (!context) throw new Error("useProducts must be used inside ProductProvider"); return context }
export { seedProducts }
