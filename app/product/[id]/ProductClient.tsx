"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Award, Gem, Globe2, Heart, MessageCircle, Play, Rotate3D, ShieldCheck, ShoppingBag, Sparkles, X } from "lucide-react" // lucide icons keep the detail tree consistent with the luxury theme.
import { formatPrice, type Product } from "@/lib/products"
import { useWishlist } from "@/components/wishlist-provider"
import { useCart } from "@/components/cart-provider"
import { useProducts } from "@/components/product-store"
import { ProductViewer360 } from "@/components/product-viewer-360"
import { ProductImageZoom } from "@/components/product-image-zoom"
import { purityOptions, sizingForProduct } from "@/lib/sizing"
import { saleDetails } from "@/lib/pricing"
import { useCurrency } from "@/components/currency-provider"
import { CheckoutForm } from "@/components/checkout-form"

const viewLabels = ["Front Angle", "Side Profile", "On-Hand View", "Hallmark Detail", "Certificate", "Craft Detail"]
const fallback360Frames = (product: Product) => product.gallery.length > 1 ? product.gallery : [product.image]

export default function ProductClient({ product: initialProduct }: { product: Product }) {
  const { products: liveProducts } = useProducts()
  const product = liveProducts.find((item) => item.id === initialProduct.id) || initialProduct
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<"gallery" | "360" | "video">("gallery")
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlist = isWishlisted(product.id)
  const { addToCart } = useCart()
  const { currency } = useCurrency()
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [success, setSuccess] = useState(false)
  const metalOptions = product.metalOptions || {}
  const hasConfiguredMetal = typeof metalOptions.gold === "number" || typeof metalOptions.silver === "number"
  const hasGold = hasConfiguredMetal ? typeof metalOptions.gold === "number" : true
  const hasSilver = hasConfiguredMetal && typeof metalOptions.silver === "number"
  const [metal, setMetal] = useState<"Gold" | "Silver">(hasGold ? "Gold" : "Silver")
  const [purity, setPurity] = useState<"14K" | "18K" | "22K">((product.goldPurity.match(/14K|18K|22K/)?.[0] as "14K" | "18K" | "22K") || "18K")
  const [size, setSize] = useState("")
  const goldPurityPrice = metalOptions.goldPurities?.[purity]
  const selectedPrice = metal === "Silver" && hasSilver ? Number(metalOptions.silver) : Number(goldPurityPrice || metalOptions.gold || product.priceInr)
  const priceOnRequest = metalOptions.priceOnRequest === true
  const selectedPriceIsFixed = selectedPrice > 0 && !priceOnRequest
  const sizing = sizingForProduct(product)
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card">("UPI")
  const [checkoutMessage, setCheckoutMessage] = useState("")
  const [shipping, setShipping] = useState({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" })
  const updateShipping = (key: keyof typeof shipping, value: string) => setShipping((current) => ({ ...current, [key]: value }))
  const useLocation = () => setCheckoutMessage("Please enter your city and pincode manually.")
  const completeOrder = () => setCheckoutMessage("Please use the checkout form to place your order.")
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200) }
  const [brokenImages, setBrokenImages] = useState<string[]>([])
  const galleryImages = Array.from(new Set([product.image, ...product.gallery].filter((url): url is string => typeof url === "string" && /^(https?:\/\/|\/|data:image|blob:)/i.test(url.trim()) && !brokenImages.includes(url))))
  const image = galleryImages[active] || galleryImages[0] || product.image

  const productJsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: product.gallery, brand: { "@type": "Brand", name: "CLP Jewels" }, offers: { "@type": "Offer", priceCurrency: "INR", price: product.priceInr, availability: "https://schema.org/InStock", url: `https://clpjewels.com/product/${product.slug}` } }

  if (success) return <main className="pdp-page"><section className="success-page"><p className="eyebrow">Order received</p><h1>Thank you for choosing CLP.</h1><p>This is a demo order. In the live version, confirmation will be sent to your email.</p><Link href="/shop" className="button button-gold">Continue shopping</Link></section></main>

  return (
    <main className="pdp-page">{toast && <div className="wishlist-toast" role="status"><Heart size={15} fill="currentColor" /> {toast}</div>}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <header className="pdp-header"><Link href="/" className="pdp-back"><ArrowLeft size={16} /> Back to collection</Link><span className="pdp-brand">CLP / Jaipur Heritage</span></header>
      <div className="pdp-shell">
        <section className="pdp-gallery" aria-label="Product gallery">
          <div className="pdp-main-image">{mode === "video" ? (product.videoUrl ? <video className="product-video h-full w-full object-cover" src={product.videoUrl} controls playsInline preload="metadata" aria-label={`${product.name} atelier video`} /> : <div className="craft-video"><div className="video-glow" /><button className="video-play" onClick={() => setMode("gallery")} aria-label="Close video preview"><Play fill="currentColor" /></button><span>Atelier preview · 00:28</span></div>) : mode === "360" ? <ProductViewer360 images={product.view360 && product.view360.length > 1 ? product.view360 : fallback360Frames(product)} alt={product.name} /> : <ProductImageZoom src={image} alt={product.name} />}</div>
          <div className="gallery-tools"><button className={mode === "gallery" ? "active" : ""} onClick={() => setMode("gallery")}>Gallery</button><button className={mode === "360" ? "active" : ""} onClick={() => setMode("360")}><Rotate3D size={13} /> 360° View</button><button className={mode === "video" ? "active" : ""} onClick={() => setMode("video")}><Play size={13} /> Atelier Video</button></div>
          
          {galleryImages.length > 0 && <div className="thumbnail-row">{galleryImages.map((galleryImage, index) => <button type="button" key={`${galleryImage}-${index}`} className={active === index ? "active" : ""} onClick={() => { setActive(index); setMode("gallery") }}><Image src={galleryImage} alt={`${product.name} gallery image ${index + 1}`} fill sizes="90px" className="object-cover" onError={() => setBrokenImages((current) => current.includes(galleryImage) ? current : [...current, galleryImage])} /><span>{viewLabels[index] || `Gallery image ${index + 1}`}</span></button>)}</div>}
        </section>
        <section className="pdp-info">
          <p className="eyebrow">{product.type} · Jaipur atelier</p><h1>{product.name}</h1><p className="pdp-price">{(() => { const sale = saleDetails(product); const hasMetalPricing = hasGold && hasSilver; return product.showSaleBadge && sale.discounted && !hasMetalPricing && !priceOnRequest ? <><span className="sale-badge">{sale.percentOff}% OFF</span> <del>{formatPrice(sale.regular, currency)}</del> {formatPrice(sale.sale, currency)}</> : formatPrice(selectedPrice, currency) })()}</p>
          <div className="pdp-specs"><div><span>Carat</span><strong>{product.carat}</strong></div><div><span>Metal</span><strong>{metal === "Silver" ? "925 Sterling Silver" : product.goldPurity}</strong></div><div><span>Certificate</span><strong>{product.certificate}</strong></div><div><span>Origin</span><strong>{product.origin}</strong></div></div><div className="product-option-grid">{(hasGold || hasSilver) && <label>Metal<select value={metal} onChange={(event) => setMetal(event.target.value as "Gold" | "Silver")}><option>Gold</option><option>Silver</option></select></label>}{metal === "Gold" && <label>Gold Purity<select value={purity} onChange={(event) => setPurity(event.target.value as "14K" | "18K" | "22K")}>{purityOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}{metal === "Silver" && <div className="product-option-label"><span>Metal</span><strong>925 Sterling Silver</strong></div>}<label>{sizing.label}<select value={size} onChange={(event) => setSize(event.target.value)}><option value="">Select {sizing.label.toLowerCase()}</option>{sizing.options.map((option) => <option key={option}>{option}</option>)}</select></label></div>
<div className="pdp-actions" aria-label="Purchase actions">
  {priceOnRequest ? <button className="pdp-buy-button" onClick={() => window.open(`https://wa.me/919828354333?text=${encodeURIComponent(`Hello CLP Jewels, please share the price for ${product.name}.\nMetal: ${metal}${metal === "Gold" ? `\nPurity: ${purity}` : "\nPurity: 925 Sterling Silver"}\n${sizing.label}: ${size || "Not selected"}`)}`, "_blank", "noopener,noreferrer")}>INQUIRE PRICE ON WHATSAPP</button> : <button className="pdp-buy-button" onClick={() => { if (!size) { showToast(`Choose ${sizing.label.toLowerCase()} first`); return }; addToCart(product.id); setCheckoutOpen(true) }}>BUY NOW</button>}
  {selectedPriceIsFixed && <button className="pdp-cart-button" onClick={() => { if (!size) { showToast(`Choose ${sizing.label.toLowerCase()} first`); return }; addToCart(product.id); setCartOpen(true) }}><ShoppingBag size={16} /> ADD TO CART</button>}
            <button className={`pdp-wishlist-button ${wishlist ? "is-saved" : ""}`} onClick={() => { toggleWishlist(product.id); showToast(wishlist ? "Removed from Wishlist" : "Added to Wishlist") }} aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}><Heart size={18} fill={wishlist ? "currentColor" : "none"} /><span>WISHLIST</span></button>
          </div>
          <button className="pdp-whatsapp" onClick={() => window.open(`https://wa.me/919828354333?text=${encodeURIComponent(`I am interested in ${product.name}\nMetal: ${metal}${metal === "Gold" ? `\nPurity: ${purity}` : "\nPurity: 925 Sterling Silver"}\n${sizing.label}: ${size || "Not selected"}\nPrice: ${formatPrice(selectedPrice, currency)}`)}`, "_blank")}><MessageCircle size={16} /> INQUIRE VIA WHATSAPP</button>
          <div className="pdp-trust">Certified provenance · Secure insured delivery · Jaipur atelier support</div>
        </section>
      </div>
      <section className="mx-auto mt-16 w-full max-w-6xl border-t border-[#75643a]/40 pt-10" aria-labelledby="item-details-title">
        <div className="mb-8 flex items-end justify-between gap-6"><div><p className="eyebrow">The provenance tree</p><h2 id="item-details-title" className="font-serif text-4xl text-[#f5e6c8]">Item Details</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#a39a82]">Live specifications from this saved piece, including its atelier provenance and certification.</p></div><Sparkles className="text-[#d4af37]" size={24} /></div>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <div><h3 className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d4af37]">Product Impact</h3><ul className="grid gap-3 sm:grid-cols-2">{[[Award, "Gold Purity", product.goldPurity], [Gem, "Carat", product.carat], [Sparkles, "Gemstone", product.type], [Globe2, "Origin", product.origin], [ShieldCheck, "Certificate", product.certificate], [Sparkles, "Atelier Provenance", product.origin ? `CLP Jaipur atelier · ${product.origin}` : "CLP Jaipur atelier"]].map(([Icon, label, value]) => <li key={String(label)} className="flex items-center gap-3 border-b border-[#75643a]/25 py-3"><Icon size={17} className="shrink-0 text-[#d4af37]" /><span className="text-sm text-[#a39a82]">{String(label)}</span><strong className="ml-auto text-right text-sm font-normal text-[#f5e6c8]">{String(value || "—")}</strong></li>)}</ul></div>
          <div className="border-l border-[#75643a]/30 pl-6"><h3 className="mb-4 text-xs uppercase tracking-[0.24em] text-[#d4af37]">Description</h3><p className="whitespace-pre-line text-base leading-8 text-[#c8bfa9]">{product.description || ""}</p></div>
        </div>
      </section>
      {checkoutOpen && <div className="pdp-modal-backdrop" role="presentation" onClick={() => setCheckoutOpen(false)}><section className="pdp-modal checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onClick={(event) => event.stopPropagation()}><div className="shared-checkout-form"><CheckoutForm product={{ ...product, metal, priceInr: selectedPrice, regularPriceInr: selectedPrice }} initialPurity={metal === "Gold" ? purity : undefined} initialSize={size} onComplete={() => { setCheckoutOpen(false); setSuccess(true) }} onLocation={useLocation} /></div><button className="pdp-modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X /></button><p className="eyebrow">CLP secure checkout</p><h2 id="checkout-title">Complete your purchase</h2><p className="checkout-product-line">{product.name} · {formatPrice(product.priceInr, currency)}</p><button type="button" className="location-button" onClick={useLocation}>Use My Location</button><div className="checkout-modal-fields">{([['fullName','Full Name'],['phone','Phone'],['address','Address'],['city','City'],['state','State'],['pincode','Pincode']] as const).map(([key,label]) => <label key={key}>{label}<input required value={shipping[key]} onChange={(event) => updateShipping(key, event.target.value)} /></label>)}</div><div className="payment-options" role="radiogroup" aria-label="Payment method">{(["UPI","Card"] as const).map((method) => <button type="button" key={method} className={paymentMethod === method ? "active" : ""} onClick={() => setPaymentMethod(method)}>{method === "UPI" ? "UPI Payment" : "Credit / Debit Card"}</button>)}</div><div className="checkout-modal-fields"><label>Gold Purity<select value={purity} onChange={(event) => setPurity(event.target.value as "14K" | "18K" | "22K")}>{purityOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>{sizing.label}<select required value={size} onChange={(event) => setSize(event.target.value)}><option value="">Select {sizing.label.toLowerCase()}</option>{sizing.options.map((option) => <option key={option}>{option}</option>)}</select></label></div>{checkoutMessage && <p className="payment-note" role="status">{checkoutMessage}</p>}<button className="pdp-buy-button" type="button" onClick={completeOrder}>COMPLETE ORDER &amp; PAY</button></section></div>}
      {cartOpen && <aside className="pdp-cart-drawer" aria-label="Cart drawer"><button className="pdp-modal-close" onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button><p className="eyebrow">Your bag</p><h2>Added to cart</h2><div className="cart-item"><Image src={product.image} alt="" width={72} height={72} /><div><strong>{product.name}</strong><span>{formatPrice(product.priceInr, currency)}</span></div></div><button className="pdp-buy-button" onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>PROCEED TO CHECKOUT</button></aside>}
    </main>
  )
}
