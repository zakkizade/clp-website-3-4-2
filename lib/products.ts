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
  zambian: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000",
  colombian: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000",
  brazilian: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=1000",
  necklace: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=1000",
  pendant: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=1000",
}

const fallbackImages = [productImages.brazilian, productImages.colombian]

export const products: Product[] = [
  { id: "zambian-emerald", name: "3.2 Carat Natural Zambian Emerald (Deep Green Cut)", type: "Natural Emeralds · Panna Collection", priceInr: 125000, image: productImages.zambian, gallery: [productImages.zambian, productImages.colombian], tags: ["100% Natural", "Zambian Origin", "GIA Certified"], view: true, carat: "3.2 carat", metal: "18K Gold" },
  { id: "colombian-solitaire", name: "2.8 Carat Colombian Emerald Solitaire Ring", type: "Natural Emeralds · Panna Collection", priceInr: 210000, image: productImages.colombian, gallery: [productImages.colombian, productImages.zambian], tags: ["18K Gold", "Colombian Fine", "IGI Certified"], view: true, carat: "2.8 carat", metal: "18K Gold" },
  { id: "brazilian-emerald", name: "4.5 Carat Brazilian Natural Emerald (Unheated)", type: "Natural Emeralds · Panna Collection", priceInr: 85000, image: productImages.brazilian, gallery: [productImages.brazilian, productImages.zambian], tags: ["Unheated", "Brazilian Origin"], view: true, carat: "4.5 carat", metal: "925 Silver" },
  { id: "royal-necklace", name: "14K Gold Emerald & Diamond Royal Necklace", type: "Gold & Silver Fine Jewelry", priceInr: 195000, image: productImages.necklace, gallery: [productImages.necklace, productImages.colombian], tags: ["18K Gold", "Hallmarked", "Jaipur Craft"], view: true, carat: "Custom weight", metal: "18K Gold" },
  { id: "silver-pendant", name: "925 Sterling Silver Royal Emerald Pendant", type: "Gold & Silver Fine Jewelry", priceInr: 18500, image: productImages.pendant, gallery: [productImages.pendant, productImages.zambian], tags: ["925 Silver", "Handcrafted"], view: true, carat: "1.1 carat", metal: "925 Silver" },
  { id: "rose-gold-bangle", name: "14K Rose Gold Natural Emerald Bangle", type: "Gold & Silver Fine Jewelry", priceInr: 98000, image: "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?auto=format&fit=crop&w=1200&q=90", gallery: ["https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?auto=format&fit=crop&w=1200&q=90", fallbackImages[1]], tags: ["14K Rose Gold", "Hallmarked"], view: true, carat: "2.4 carat", metal: "18K Gold" },
]

export const formatPrice = (priceInr: number, currency: string) => {
  const rates: Record<string, number> = { INR: 1, USD: 0.012, AED: 0.044, GBP: 0.0094, EUR: 0.011 }
  const locales: Record<string, string> = { INR: "en-IN", USD: "en-US", AED: "ar-AE", GBP: "en-GB", EUR: "de-DE" }
  return new Intl.NumberFormat(locales[currency] ?? "en-IN", { style: "currency", currency, maximumFractionDigits: currency === "INR" ? 0 : 2 }).format(priceInr * (rates[currency] ?? 1))
}
