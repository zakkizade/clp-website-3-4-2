import { notFound } from "next/navigation"
import { products } from "@/lib/products"
import ProductClient from "./ProductClient"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) notFound()
  return <ProductClient product={product} />
}
