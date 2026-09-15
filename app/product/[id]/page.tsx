"use client"

import { use, useState } from "react"
import { ArrowLeft, Check, ChevronDown, MessageCircle, Rotate3D, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { products, formatPrice } from "@/lib/products"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeImage, setActiveImage] = useState(0)
  const [currency, setCurrency] = useState("INR")
  const [metal, setMetal] = useState("18K Gold")
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!id) params.then((value) => setId(value.id))
  const product = products.find((item) => item.id === id) ?? products[0]

  return <main className="pdp-page">
    <div className="utility-bar"><span>Direct customer care: <u>Email</u> &amp; <u>WhatsApp</u></span><span>Deliver to: <select value={currency} onChange={(event) => setCurrency(event.target.value)} aria-label="Select currency"><option value="INR">India (INR ₹)</option><option value="USD">United States (USD $)</option><option value="AED">United Arab Emirates (AED)</option><option value="GBP">United Kingdom (GBP £)</option><option value="EUR">Europe (EUR €)</option></select></span></div>
    <header className="pdp-header"><Link href="/" className="brand-mark"><span>CLP</span><small>JAIPUR • EST. 1987</small></Link><Link href="/" className="pdp-back"><ArrowLeft /> Back to collection</Link><button className="pdp-cart" aria-label="Shopping bag"><ShoppingBag /></button></header>
    <div className="pdp-shell">
      <div className="pdp-gallery">
        <div className="pdp-main-image"><img className="w-full h-full object-cover" src={product.gallery[activeImage]} alt={product.name} /><span className="certification-stamp">{product.tags.find((tag) => tag.includes("Certified")) ?? "CERTIFIED"}</span></div>
        <div className="thumbnail-row">{product.gallery.map((image, index) => <button key={image} className={activeImage === index ? "active" : ""} onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`}><img className="w-full h-full object-cover" src={image} alt="" /></button>)}<div className="viewer-360"><Rotate3D /> 360° Interactive Viewer</div></div>
      </div>
      <section className="pdp-info"><p className="eyebrow gold-text">{product.type}</p><h1>{product.name}</h1><div className="pdp-price-row"><strong>{formatPrice(product.priceInr, currency)}</strong><span>Complimentary insured delivery</span></div><p className="pdp-description">A one-of-a-kind natural stone selected for its exceptional color and character, finished by Jaipur artisans for a lifetime of wear.</p><div className="pdp-tags">{product.tags.map((tag) => <span key={tag}><Check /> {tag}</span>)}</div><div className="pdp-option"><label htmlFor="metal">Metal</label><select id="metal" value={metal} onChange={(event) => setMetal(event.target.value)}><option>18K Gold</option><option>925 Silver</option></select><ChevronDown /></div><div className="pdp-details"><span>Carat weight <b>{product.carat}</b></span><span>Origin <b>{product.tags.find((tag) => tag.includes("Origin"))?.replace(" Origin", "") ?? "Jaipur atelier"}</b></span></div><div className="pdp-buy-row"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div><button className="button button-gold pdp-add" onClick={() => setAdded(true)}>{added ? "Added to bag" : "Add to cart"}</button></div><a className="pdp-whatsapp" href={`https://wa.me/919876543210?text=I%20am%20interested%20in%20${encodeURIComponent(product.name)}`} target="_blank" rel="noreferrer"><MessageCircle /> Direct WhatsApp Inquiry</a></section>
    </div>
  </main>
}
