"use client"

import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"
import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { formatPrice } from "@/lib/products"
import { useProducts } from "@/components/product-store"
import { useCurrency } from "@/components/currency-provider"

const filters = ["All", "Gold", "Emerald", "Ruby", "Loose Gemstones", "Fine Jewelry"]

function ShopContent() {
  const { products } = useProducts()
  const { currency } = useCurrency()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [filter, setFilter] = useState(searchParams.get("category") || "All")
  const [maxPrice, setMaxPrice] = useState("all")
  const visible = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.type} ${product.category} ${product.origin} ${product.description} ${product.tags.join(" ")}`.toLowerCase()
    const matchesPrice = maxPrice === "all" || product.priceInr <= Number(maxPrice)
    return text.includes(query.toLowerCase()) && (filter === "All" || product.category === filter) && matchesPrice
  }), [filter, maxPrice, products, query])
  return <main className="catalog-page"><header className="catalog-header"><Link href="/" className="brand-mark"><span className="crest-mark"><b>CLP</b></span><small>JAIPUR • EST. 1987</small></Link><Link href="/" className="text-link">Back home</Link></header><section className="catalog-content"><p className="eyebrow gold-text">The complete edit</p><h1>Shop the collection.</h1><div className="catalog-toolbar"><form className="catalog-search" onSubmit={(event) => event.preventDefault()}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search gemstones, jewelry, origin..." aria-label="Search products" /><button type="submit" aria-label="Search"><Search size={14} /></button></form><div className="catalog-filters" aria-label="Product filters">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><select className="catalog-price-filter" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} aria-label="Filter by maximum price"><option value="all">Any price</option><option value="50000">Under ₹50,000</option><option value="150000">Under ₹1,50,000</option><option value="500000">Under ₹5,00,000</option></select></div><div className="catalog-grid">{visible.map((product) => <Link className="catalog-card" href={`/product/${product.slug}`} key={product.id}><div className="catalog-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 25vw" className="object-cover" /></div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><strong>{formatPrice(product.priceInr, currency)}</strong></Link>)}</div>{visible.length === 0 && <div className="empty-state"><h2>No pieces found.</h2><p>Try another search or collection.</p></div>}</section></main>
}

export default function ShopPage() {
  return <Suspense fallback={<main className="catalog-page"><section className="catalog-content"><p className="eyebrow gold-text">Loading the collection</p><h1>Shop the collection.</h1></section></main>}><ShopContent /></Suspense>
}
