"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useWishlist } from "@/components/wishlist-provider"
import { formatPrice } from "@/lib/products"
import { saleDetails } from "@/lib/pricing"
import { useCart } from "@/components/cart-provider"
import { useProducts } from "@/components/product-store"
import { useState } from "react"
import { CheckoutForm } from "@/components/checkout-form"
import { useCurrency } from "@/components/currency-provider"

export default function CartPage() {
  const { cartItems, addToCart, removeFromCart } = useCart(); const { products } = useProducts(); const { currency } = useCurrency(); const { toggleWishlist, isWishlisted } = useWishlist(); const [checkout, setCheckout] = useState(false)
  const items = products.filter((product) => cartItems.includes(product.id)); const quantityOf = (id: string) => cartItems.filter((item) => item === id).length; const total = items.reduce((sum, product) => sum + saleDetails(product).sale * quantityOf(product.id), 0)
  if (checkout && items[0]) return <main className="catalog-page"><header className="catalog-header"><Link href="/shop" className="text-link">Back to selection</Link><p className="eyebrow gold-text">Secure order details</p></header><section className="checkout-page"><p className="eyebrow gold-text">Checkout</p><h1>Complete your order.</h1><p className="checkout-intro">{items.length === 1 ? items[0].name : `${items.length} pieces from your selection`} · {formatPrice(total, currency)}</p><CheckoutForm product={items[0]} quantity={quantityOf(items[0].id)} onComplete={() => setCheckout(false)} /></section></main>
  return <main className="catalog-page"><header className="catalog-header"><Link href="/" className="brand-mark"><span className="crest-mark"><b>CLP</b></span><small>JAIPUR • EST. 1987</small></Link><Link href="/shop" className="text-link">Continue shopping</Link></header><section className="catalog-content"><p className="eyebrow gold-text"><ShoppingBag size={14} /> Your selection</p><h1>Your cart.</h1>{items.length === 0 ? <div className="empty-state"><ShoppingBag size={34} /><h2>Your cart is empty.</h2><p>Discover a piece made to become part of your story.</p><Link href="/shop" className="button button-gold">Explore collection</Link></div> : <div className="cart-page-layout"><div className="cart-page-items">{items.map((product) => <article className="cart-page-item" key={product.id}><Image src={product.image} alt={product.name} width={150} height={150} /><div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><strong>{saleDetails(product).discounted && <span className="sale-badge">{saleDetails(product).percentOff}% OFF</span>} {saleDetails(product).discounted && <del>{formatPrice(saleDetails(product).regular, "INR")}</del>} {formatPrice(saleDetails(product).sale, "INR")}</strong><div className="quantity-control"><button onClick={() => removeFromCart(product.id)} aria-label={`Decrease ${product.name}`}><Minus size={14} /></button><span>{quantityOf(product.id)}</span><button onClick={() => addToCart(product.id)} aria-label={`Increase ${product.name}`}><Plus size={14} /></button><button className="remove-item" onClick={() => removeFromCart(product.id)}><Trash2 size={14} /> Remove</button><button className="remove-item" onClick={() => { toggleWishlist(product.id); removeFromCart(product.id) }}><Heart size={14} /> {isWishlisted(product.id) ? "Saved to wishlist" : "Move to wishlist"}</button></div></div></article>)}</div><aside className="cart-summary"><p className="eyebrow">Order summary</p><div><span>Subtotal</span><strong>{formatPrice(total, currency)}</strong></div><div><span>Insured delivery</span><span>Complimentary</span></div><button className="button button-gold" onClick={() => setCheckout(true)}>Proceed to Checkout</button></aside></div>}</section></main>
}
