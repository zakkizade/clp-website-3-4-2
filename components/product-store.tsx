"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { products as seedProducts, type Product } from "@/lib/products"

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
    sale_price: salePrice || null,
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

const LOCAL_PRODUCTS_KEY = "clp-products"

function readLocalProducts(): Product[] {
  if (typeof window === "undefined") return []
  try {
    const stored = JSON.parse(window.localStorage.getItem(LOCAL_PRODUCTS_KEY) || "[]")
    return Array.isArray(stored) ? stored as Product[] : []
  } catch {
    return []
  }
}

function writeLocalProducts(products: Product[]) {
  window.localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products))
  window.dispatchEvent(new CustomEvent("clp-products-updated"))
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(seedProducts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const localProducts = readLocalProducts()
    setItems(localProducts.length > 0 ? localProducts : seedProducts)
    setLoading(false)

    const handleLocalProductsUpdated = () => {
      const nextProducts = readLocalProducts()
      setItems(nextProducts.length > 0 ? nextProducts : seedProducts)
    }

    window.addEventListener("clp-products-updated", handleLocalProductsUpdated)
    return () => window.removeEventListener("clp-products-updated", handleLocalProductsUpdated)
  }, [])

  const saveProduct = async (product: Product) => {
    const normalized: Product = {
      ...product,
      image: product.image || product.gallery[0] || "",
      gallery: Array.from(new Set([product.image, ...product.gallery].filter(Boolean))),
    }
    setItems((current) => {
      const next = [normalized, ...current.filter((item) => item.id !== normalized.id)]
      writeLocalProducts(next)
      return next
    })
  }

  const deleteProduct = async (id: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.id !== id)
      writeLocalProducts(next)
      return next
    })
  }

  const value = useMemo(() => ({ products: items, loading, error, saveProduct, deleteProduct }), [items, loading, error])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() { const context = useContext(ProductContext); if (!context) throw new Error("useProducts must be used inside ProductProvider"); return context }
