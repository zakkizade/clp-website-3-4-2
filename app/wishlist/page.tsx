"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Trash2 } from "lucide-react"
import { products, formatPrice } from "@/lib/products"
import { useWishlist } from "@/components/wishlist-provider"

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist()
  const saved = products.filter((product) => wishlist.includes(product.id))
  return <main className="catalog-page"><header className="catalog-header"><Link href="/" className="brand-mark"><span className="crest-mark"><b>CLP</b></span><small>JAIPUR • EST. 1987</small></Link><Link href="/shop" className="text-link">Shop collection</Link></header><section className="catalog-content"><p className="eyebrow gold-text"><Heart size={14} /> Your private edit</p><h1>Your wishlist.</h1>{saved.length === 0 ? <div className="empty-state"><Heart size={34} /><h2>Your wishlist is waiting.</h2><p>Save pieces you love and they will appear here.</p><Link href="/shop" className="button button-gold">Explore collection</Link></div> : <div className="catalog-grid">{saved.map((product) => <article className="catalog-card" key={product.id}><Link href={`/product/${product.slug}`}><div className="catalog-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 25vw" className="object-cover" /></div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><strong>{formatPrice(product.priceInr, "INR")}</strong></Link><button className="remove-item" onClick={() => toggleWishlist(product.id)}><Trash2 size={14} /> Remove</button></article>)}</div>}</section></main>
}
