import type { MetadataRoute } from "next"
import { products } from "@/lib/products"
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://clpjewels.com"; return ["", "/about", "/authenticity", "/care", "/shipping", "/contact", ...products.map((product) => `/product/${product.slug}`)].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly", priority: path === "" ? 1 : .7 })) }
