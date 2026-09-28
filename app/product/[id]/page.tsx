import ProductRouteClient from "./ProductRouteClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Product details | CLP Jewels",
  description: "Explore the live product details, gallery, and atelier media from CLP Jewels.",
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductRouteClient id={id} />
}
