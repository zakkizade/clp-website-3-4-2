import { notFound } from "next/navigation"
import { products, getProductBySlug } from "@/lib/products"
import ProductClient from "./ProductClient"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = getProductBySlug(id)
  if (!product) return { title: "Product not found | CLP Jewels" }
  return { title: `${product.name} | CLP Jewels`, description: product.description, alternates: { canonical: `/product/${product.slug}` }, openGraph: { title: `${product.name} | CLP Jewels`, description: product.description, type: "website", images: [{ url: product.image, alt: product.name }] }, twitter: { card: "summary_large_image", title: product.name, description: product.description, images: [product.image] } }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) notFound()
  return <ProductClient product={product} />
}
