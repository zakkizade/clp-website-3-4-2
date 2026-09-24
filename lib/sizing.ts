import type { Product } from "@/lib/products"

export type SizeKind = "Ring size" | "Length" | "Chain length" | "Carat / weight"

export function sizingForProduct(product: Pick<Product, "category" | "name" | "type">): { label: SizeKind; options: string[] } {
  const text = `${product.category} ${product.name} ${product.type}`.toLowerCase()
  if (text.includes("ring")) return { label: "Ring size", options: ["US 5 / IN 10", "US 6 / IN 12", "US 7 / IN 14", "US 8 / IN 16", "US 9 / IN 18", "US 10 / IN 20", "US 11 / IN 22"] }
  if (text.includes("bracelet") || text.includes("bangle") || product.category === "Gold") return { label: "Length", options: ["6.5 inches", "7 inches", "7.5 inches", "8 inches", "8.5 inches"] }
  if (text.includes("necklace") || text.includes("pendant")) return { label: "Chain length", options: ["16 inches", "18 inches", "20 inches", "22 inches"] }
  if (product.category === "Loose Gemstones" || text.includes("gemstone") || text.includes("emerald")) return { label: "Carat / weight", options: ["As listed", "Custom weight request"] }
  return { label: "Length", options: ["Standard size", "Custom size request"] }
}

export const purityOptions = ["14K", "18K", "22K"]
