"use client"

import { useProducts } from "@/components/product-store"
import ProductClient from "./ProductClient"

export default function ProductRouteClient({ id }: { id: string }) {
  const { products, loading } = useProducts()
  const product = products.find((item) => item.id === id || item.slug === id)
  if (loading) return <main className="pdp-page"><section className="success-page"><p className="eyebrow gold-text">Loading the collection</p><h1>Finding your piece.</h1></section></main>
  if (!product) return <main className="pdp-page"><section className="success-page"><p className="eyebrow gold-text">Unavailable</p><h1>Piece not found.</h1></section></main>
  return <ProductClient product={product} />
}
