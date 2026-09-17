export type Product = {
  id: string
  name: string
  type: string
  priceInr: number
  image: string
  gallery: string[]
  tags: string[]
  view: boolean
  carat: string
  metal: string
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
export const products: Product[] = [
  { id: "zambian-emerald", name: "3.2 Carat Natural Zambian Emerald (Deep Green Cut)", type: "Natural Emeralds · Panna Collection", priceInr: 125000, image: productImages.zambian, gallery: gallery(productImages.zambian), tags: ["100% Natural", "Zambian Origin", "GIA Certified"], view: true, carat: "3.2 carat", metal: "18K Gold" },
  { id: "colombian-solitaire", name: "2.8 Carat Colombian Emerald Solitaire Ring", type: "Natural Emeralds · Panna Collection", priceInr: 210000, image: productImages.colombian, gallery: gallery(productImages.colombian), tags: ["18K Gold", "Colombian Fine", "IGI Certified"], view: true, carat: "2.8 carat", metal: "18K Gold" },
  { id: "brazilian-emerald", name: "4.5 Carat Brazilian Natural Emerald (Unheated)", type: "Natural Emeralds · Panna Collection", priceInr: 85000, image: productImages.brazilian, gallery: gallery(productImages.brazilian), tags: ["Unheated", "Brazilian Origin", "18K Gold Setting"], view: true, carat: "4.5 carat", metal: "18K Gold" },
  { id: "royal-necklace", name: "14K Gold Emerald & Diamond Royal Necklace", type: "Gold Fine Jewelry", priceInr: 195000, image: productImages.necklace, gallery: gallery(productImages.necklace), tags: ["18K Gold", "Hallmarked", "Jaipur Craft"], view: true, carat: "Custom weight", metal: "18K Gold" },
  { id: "rose-gold-bangle", name: "14K Rose Gold Natural Emerald Bangle", type: "Gold Fine Jewelry", priceInr: 98000, image: productImages.goldJewelry, gallery: gallery(productImages.goldJewelry), tags: ["14K Rose Gold", "Hallmarked", "100% Earth Mined"], view: true, carat: "2.4 carat", metal: "14K Rose Gold" },
  { id: "rough-emerald", name: "Natural Rough Emerald Collector Stone", type: "Natural Emeralds · Panna Collection", priceInr: 64000, image: productImages.pendant, gallery: gallery(productImages.pendant), tags: ["Unheated", "Earth Mined", "GIA Certified"], view: true, carat: "4.1 carat", metal: "Loose Stone" },
  { id: "gold-emerald-cuff", name: "18K Gold Emerald Heritage Cuff", type: "Gold Fine Jewelry", priceInr: 156000, image: productImages.artisanRing, gallery: gallery(productImages.artisanRing), tags: ["18K Gold", "Hallmarked", "Jaipur Craft"], view: true, carat: "3.6 carat", metal: "18K Gold" },
  { id: "emerald-gold-pendant", name: "18K Gold Emerald Heirloom Pendant", type: "Gold Fine Jewelry", priceInr: 118000, image: productImages.emeraldRing, gallery: gallery(productImages.emeraldRing), tags: ["18K Gold", "Natural Emerald", "Jaipur Craft"], view: true, carat: "2.1 carat", metal: "18K Gold" },
]

export const formatPrice = (priceInr: number, currency: string) => {
  const rates: Record<string, number> = { INR: 1, USD: 0.012, AED: 0.044, GBP: 0.0094, EUR: 0.011 }
  const locales: Record<string, string> = { INR: "en-IN", USD: "en-US", AED: "ar-AE", GBP: "en-GB", EUR: "de-DE" }
  return new Intl.NumberFormat(locales[currency] ?? "en-IN", { style: "currency", currency, maximumFractionDigits: currency === "INR" ? 0 : 2 }).format(priceInr * (rates[currency] ?? 1))
}
