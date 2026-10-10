export type Product = {
  id: string
  name: string
  type: string
  slug: string
  priceInr: number
  regularPriceInr?: number
  salePriceInr?: number
  showSaleBadge?: boolean
  discountPercent?: number
  image: string
  gallery: string[]
  tags: string[]
  category: "Gold" | "Emerald" | "Ruby" | "Loose Gemstones" | "Fine Jewelry" | "Rings" | "Bracelets" | "Bangles" | "Necklaces" | "Pendants"
  goldPurity: string
  certificate: string
  origin: string
  description: string
  isFeatured: boolean
  showOnBanner?: boolean
  view?: boolean
  carat: string
  metal: string
  metalOptions?: { gold?: number; silver?: number; goldPurities?: { "14K"?: number; "18K"?: number; "22K"?: number } }
  videoUrl?: string
  view360?: string[]
  sizeOptions?: string[]
  caratWeight?: string
}

const productImages = {
  zambian: "/product-zambian.png",
  colombian: "/product-solitaire.png",
  brazilian: "/product-brazilian.png",
  necklace: "/product-necklace.png",
  pendant: "/product-pendant.png",
  goldJewelry: "/product-bangle.png",
  emeraldRing: "/product-pendant.png",
  artisanRing: "/product-cuff.png",
}

const gallery = (image: string) => [image, image, image, image, image, image]
const item = (data: Omit<Product, "slug" | "gallery" | "view">): Product => ({ ...data, slug: data.id, gallery: gallery(data.image), view: true })

export const products: Product[] = [
  item({ id: "zambian-emerald", name: "3.2 Carat Natural Zambian Emerald", type: "Natural Emeralds · Panna Collection", priceInr: 125000, image: productImages.zambian, tags: ["100% Natural", "Zambian Origin", "GIA Certified"], category: "Emerald", goldPurity: "18K Gold", certificate: "GIA Certified", origin: "Zambia", description: "A vivid, earth-mined emerald selected for its saturated green hue and elegant cut.", isFeatured: true, carat: "3.2 carat", metal: "18K Gold" }),
  item({ id: "colombian-solitaire", name: "2.8 Carat Colombian Emerald Solitaire Ring", type: "Natural Emeralds · Panna Collection", priceInr: 210000, image: productImages.colombian, tags: ["18K Gold", "Colombian Fine", "IGI Certified"], category: "Fine Jewelry", goldPurity: "18K Gold", certificate: "IGI Certified", origin: "Colombia", description: "A collector-grade Colombian emerald set in a timeless Jaipur-crafted solitaire ring.", isFeatured: true, carat: "2.8 carat", metal: "18K Gold" }),
  item({ id: "brazilian-emerald", name: "4.5 Carat Brazilian Natural Emerald", type: "Natural Emeralds · Panna Collection", priceInr: 85000, image: productImages.brazilian, tags: ["Unheated", "Brazilian Origin", "18K Gold Setting"], category: "Loose Gemstones", goldPurity: "18K Gold", certificate: "IGL Certified", origin: "Brazil", description: "An unheated Brazilian emerald with organic character and natural inclusions.", isFeatured: true, carat: "4.5 carat", metal: "18K Gold" }),
  item({ id: "royal-necklace", name: "14K Gold Emerald & Diamond Royal Necklace", type: "Gold Fine Jewelry", priceInr: 195000, image: productImages.necklace, tags: ["18K Gold", "Hallmarked", "Jaipur Craft"], category: "Fine Jewelry", goldPurity: "14K Gold", certificate: "Hallmarked", origin: "Jaipur, India", description: "A heirloom necklace designed around natural emeralds and brilliant diamond accents.", isFeatured: true, carat: "Custom weight", metal: "14K Gold" }),
  item({ id: "aurora-noel-diamond-snowflake-pendant", name: "Aurora Noël Diamond Snowflake Pendant", type: "Diamond Fine Jewelry", priceInr: 37500, image: productImages.pendant, tags: ["Diamond", "Snowflake Motif", "Jaipur Craft"], category: "Pendants", goldPurity: "18K Gold", certificate: "IGL Certified", origin: "Jaipur, India", description: "A delicate snowflake pendant designed to catch the light with winter-bright brilliance.", isFeatured: true, carat: "0.35 carat", metal: "18K Gold" }),
  item({ id: "rose-gold-bangle", name: "14K Rose Gold Natural Emerald Bangle", type: "Gold Fine Jewelry", priceInr: 98000, image: productImages.goldJewelry, tags: ["14K Rose Gold", "Hallmarked", "100% Earth Mined"], category: "Gold", goldPurity: "14K Rose Gold", certificate: "Hallmarked", origin: "Jaipur, India", description: "A sculptural bangle with a warm rose-gold finish and a natural emerald centre.", isFeatured: false, carat: "2.4 carat", metal: "14K Rose Gold" }),
  item({ id: "rough-emerald", name: "Natural Rough Emerald Collector Stone", type: "Natural Emeralds · Panna Collection", priceInr: 64000, image: productImages.pendant, tags: ["Unheated", "Earth Mined", "GIA Certified"], category: "Loose Gemstones", goldPurity: "N/A", certificate: "GIA Certified", origin: "Zambia", description: "A raw collector stone preserved in its natural form for connoisseurs of provenance.", isFeatured: false, carat: "4.1 carat", metal: "Loose Stone" }),
  item({ id: "gold-emerald-cuff", name: "18K Gold Emerald Heritage Cuff", type: "Gold Fine Jewelry", priceInr: 156000, image: productImages.artisanRing, tags: ["18K Gold", "Hallmarked", "Jaipur Craft"], category: "Gold", goldPurity: "18K Gold", certificate: "Hallmarked", origin: "Jaipur, India", description: "A hand-finished cuff inspired by Jaipur palace architecture and heirloom jewellery.", isFeatured: false, carat: "3.6 carat", metal: "18K Gold" }),
  item({ id: "emerald-gold-pendant", name: "18K Gold Emerald Heirloom Pendant", type: "Gold Fine Jewelry", priceInr: 118000, image: productImages.emeraldRing, tags: ["18K Gold", "Natural Emerald", "Jaipur Craft"], category: "Fine Jewelry", goldPurity: "18K Gold", certificate: "IGL Certified", origin: "Jaipur, India", description: "An everyday heirloom pendant with a deep green natural emerald in 18K gold.", isFeatured: true, carat: "2.1 carat", metal: "18K Gold" }),
]

export const formatPrice = (priceInr: number, currency: string) => {
  const rates: Record<string, number> = { INR: 1, USD: 0.012, AED: 0.044, GBP: 0.0094, EUR: 0.011 }
  const locales: Record<string, string> = { INR: "en-IN", USD: "en-US", AED: "ar-AE", GBP: "en-GB", EUR: "de-DE" }
  return new Intl.NumberFormat(locales[currency] ?? "en-IN", { style: "currency", currency, maximumFractionDigits: currency === "INR" ? 0 : 2 }).format(priceInr * (rates[currency] ?? 1))
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug || product.id === slug)
}
