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
  const { products, loading } = useProducts()
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
  return <main className="catalog-page"><header className="catalog-header"><Link href="/" className="brand-mark"><span className="crest-mark"><b>CLP</b></span><small>JAIPUR • EST. 1987</small></Link><Link href="/" className="text-link">Back home</Link></header><section className="catalog-content"><p className="eyebrow gold-text">The complete edit</p><h1>Shop the collection.</h1><div className="catalog-toolbar"><form className="catalog-search" onSubmit={(event) => event.preventDefault()}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search gemstones, jewelry, origin..." aria-label="Search products" /><button type="submit" aria-label="Search"><Search size={14} /></button></form><div className="catalog-filters" aria-label="Product filters">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><select className="catalog-price-filter" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} aria-label="Filter by maximum price"><option value="all">Any price</option>{[50000, 150000, 500000].map((limit) => <option key={limit} value={limit}>Under {formatPrice(limit, currency)}</option>)}</select></div>{loading ? <div className="clp-loading-overlay" role="status" aria-live="polite"><div className="clp-loading-spinner" aria-hidden="true" /><span className="sr-only">Loading products</span></div> : <div className="catalog-grid">{visible.map((product) => <Link className="catalog-card" href={`/product/${product.slug}`} key={product.id}><div className="catalog-image">{product.image && <Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 25vw" className="object-cover" />}</div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><strong>{formatPrice(product.priceInr, currency)}</strong></Link>)}</div>}{!loading && visible.length === 0 && <div className="clp-empty-state" role="status"><p className="eyebrow gold-text">{filter === "All" ? "Jaipur atelier" : filter}</p><h2>New pieces arriving soon from the Jaipur atelier.</h2><div className="clp-empty-actions"><button type="button" className="button button-gold" onClick={() => { setFilter("All"); setQuery(""); setMaxPrice("all") }}>View all pieces</button><button type="button" className="button button-dark" onClick={() => { setFilter("Fine Jewelry"); setQuery(""); setMaxPrice("all") }}>Fine Jewelry</button></div></div>}</section></main>
}

export default function ShopPage() {
  return <Suspense fallback={<main className="catalog-page"><section className="catalog-content"><p className="eyebrow gold-text">Loading the collection</p><h1>Shop the collection.</h1></section></main>}><ShopContent /></Suspense>
}
