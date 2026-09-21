"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useWishlist } from "@/components/wishlist-provider"
import { products, formatPrice } from "@/lib/products"
import { useCart } from "@/components/cart-provider"
import { useState } from "react"

export default function CartPage() {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [success, setSuccess] = useState(false)
  const items = products.filter((product) => cartItems.includes(product.id))
  const quantityOf = (id: string) => cartItems.filter((item) => item === id).length
  const total = items.reduce((sum, product) => sum + product.priceInr * quantityOf(product.id), 0)
  if (success) return <main className="catalog-page"><section className="success-page"><p className="eyebrow gold-text">Order received</p><h1>Thank you for choosing CLP.</h1><p>This is a demo order. In the live version, confirmation will be sent to your email.</p><Link href="/shop" className="button button-gold">Continue shopping</Link></section></main>
  return <main className="catalog-page"><header className="catalog-header"><Link href="/" className="brand-mark"><span className="crest-mark"><b>CLP</b></span><small>JAIPUR • EST. 1987</small></Link><Link href="/shop" className="text-link">Continue shopping</Link></header><section className="catalog-content"><p className="eyebrow gold-text"><ShoppingBag size={14} /> Your selection</p><h1>Your cart.</h1>{items.length === 0 ? <div className="empty-state"><ShoppingBag size={34} /><h2>Your cart is empty.</h2><p>Discover a piece made to become part of your story.</p><Link href="/shop" className="button button-gold">Explore collection</Link></div> : <div className="cart-page-layout"><div className="cart-page-items">{items.map((product) => <article className="cart-page-item" key={product.id}><Image src={product.image} alt={product.name} width={150} height={150} /><div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><strong>{formatPrice(product.priceInr, "INR")}</strong><div className="quantity-control"><button onClick={() => removeFromCart(product.id)} aria-label={`Decrease ${product.name}`}><Minus size={14} /></button><span>{quantityOf(product.id)}</span><button onClick={() => addToCart(product.id)} aria-label={`Increase ${product.name}`}><Plus size={14} /></button><button className="remove-item" onClick={() => removeFromCart(product.id)}><Trash2 size={14} /> Remove</button><button className="remove-item" onClick={() => { toggleWishlist(product.id); removeFromCart(product.id) }}><Heart size={14} /> {isWishlisted(product.id) ? "Saved to wishlist" : "Move to wishlist"}</button></div></div></article>)}</div><aside className="cart-summary"><p className="eyebrow">Order summary</p><div><span>Subtotal</span><strong>{formatPrice(total, "INR")}</strong></div><div><span>Insured delivery</span><span>Complimentary</span></div><button className="button button-gold" onClick={() => { clearCart(); setSuccess(true) }}>Proceed to Checkout</button></aside></div>}</section></main>
}
