"use client"

import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"
import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { formatPrice } from "@/lib/products"
import { useProducts } from "@/components/product-store"

const filters = ["All", "Gold", "Emerald", "Ruby", "Loose Gemstones", "Fine Jewelry"]

function ShopContent() {
  const { products } = useProducts()
  const [query, setQuery] = useState("")
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState(searchParams.get("category") || "All")
  const visible = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.type} ${product.tags.join(" ")}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (filter === "All" || product.category === filter)
  }), [filter, query])
  return <main className="catalog-page"><header className="catalog-header"><Link href="/" className="brand-mark"><span className="crest-mark"><b>CLP</b></span><small>JAIPUR • EST. 1987</small></Link><Link href="/" className="text-link">Back home</Link></header><section className="catalog-content"><p className="eyebrow gold-text">The complete edit</p><h1>Shop the collection.</h1><div className="catalog-toolbar"><label className="catalog-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search gemstones, jewelry, origin..." aria-label="Search products" /></label><div className="catalog-filters" aria-label="Product filters">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="catalog-grid">{visible.map((product) => <Link className="catalog-card" href={`/product/${product.slug}`} key={product.id}><div className="catalog-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 100vw, 25vw" className="object-cover" /></div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><strong>{formatPrice(product.priceInr, "INR")}</strong></Link>)}</div>{visible.length === 0 && <div className="empty-state"><h2>No pieces found.</h2><p>Try another search or collection.</p></div>}</section></main>
}

export default function ShopPage() {
  return <Suspense fallback={<main className="catalog-page"><section className="catalog-content"><p className="eyebrow gold-text">Loading the collection</p><h1>Shop the collection.</h1></section></main>}><ShopContent /></Suspense>
}
