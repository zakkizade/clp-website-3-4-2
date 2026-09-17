"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, MessageCircle, Play, Rotate3D, ShieldCheck } from "lucide-react"
import { formatPrice, type Product } from "@/lib/products"

const viewLabels = ["Front Angle", "Side Profile", "On-Hand View", "Hallmark Detail", "Certificate", "Craft Detail"]

export default function ProductClient({ product }: { product: Product }) {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<"gallery" | "360" | "video">("gallery")
  const [angle, setAngle] = useState(0)
  const image = product.gallery[active] || product.image

  return <main className="pdp-page"><header className="pdp-header"><Link href="/" className="pdp-back"><ArrowLeft size={16} /> Back to collection</Link><span className="pdp-brand">CLP / Jaipur Heritage</span></header><div className="pdp-shell"><section className="pdp-gallery" aria-label="Product gallery"><div className="pdp-main-image">{mode === "video" ? <div className="craft-video"><div className="video-glow" /><button className="video-play" onClick={() => setMode("gallery")} aria-label="Close video preview"><Play fill="currentColor" /></button><span>Atelier preview · 00:28</span></div> : <Image src={image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 55vw" className="object-cover" style={{ transform: mode === "360" ? `rotate(${angle}deg)` : undefined }} priority />}<div className="image-badge"><Rotate3D size={13} /> {mode === "360" ? "Drag to rotate" : "360° view"}</div></div><div className="gallery-tools"><button className={mode === "gallery" ? "active" : ""} onClick={() => setMode("gallery")}>Gallery</button><button className={mode === "360" ? "active" : ""} onClick={() => setMode("360")}><Rotate3D size={13} /> 360° View</button><button className={mode === "video" ? "active" : ""} onClick={() => setMode("video")}><Play size={13} /> Atelier Video</button></div>{mode === "360" && <input className="angle-slider" type="range" min="0" max="360" value={angle} onChange={(event) => setAngle(Number(event.target.value))} aria-label="Rotate product 360 degrees" />}<div className="thumbnail-row">{viewLabels.map((label, index) => <button key={label} className={active === index ? "active" : ""} onClick={() => { setActive(index); setMode("gallery") }}><Image src={product.gallery[index] || product.image} alt={label} fill sizes="90px" className="object-cover" /><span>{label}</span></button>)}</div></section><section className="pdp-info"><p className="eyebrow">{product.type} · Jaipur atelier</p><h1>{product.name}</h1><p className="pdp-price">{formatPrice(product.priceInr, "INR")}</p><p className="pdp-description">A collector-grade natural emerald jewel, finished by Jaipur artisans with a focus on provenance, polish, and heirloom wear.</p><div className="spec-grid"><div><span>Carat weight</span><strong>{product.carat}</strong></div><div><span>Certificate</span><strong>{product.tags.find((tag) => tag.includes("GIA") || tag.includes("IGI")) || "GIA Certified"}</strong></div><div><span>Gold purity</span><strong>{product.metal}</strong></div><div><span>Origin</span><strong>{product.tags.find((tag) => tag.includes("Origin")) || "Jaipur, India"}</strong></div></div><div className="trust-row"><ShieldCheck size={18} /><span>Authenticity guaranteed · Insured worldwide delivery</span></div><a className="whatsapp-cta" href="https://wa.me/919315592037" target="_blank" rel="noreferrer"><MessageCircle size={18} /> Inquire via WhatsApp</a></section></div></main>
}
