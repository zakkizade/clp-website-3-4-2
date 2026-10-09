"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDownRight, ArrowRight, ChevronDown, Crown, Download, Heart, LogIn, Mail, Menu, MessageCircle, Package, Play, Rotate3D, Search, Send, ShoppingBag, Star, Sun, Moon, User, X, ShieldCheck, Globe2, Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/products"
import { useProducts } from "@/components/product-store"
import { useWishlist } from "@/components/wishlist-provider"
import { useCart } from "@/components/cart-provider"
import { createClient } from "@/lib/supabase/client"
import { HeroSlider } from "@/components/hero-slider"
import { ProductViewer360 } from "@/components/product-viewer-360"
import { saleDetails } from "@/lib/pricing"
import { useCurrency } from "@/components/currency-provider"
import { CheckoutForm } from "@/components/checkout-form"
import { getActiveOffer, getAnnouncement, getBannerVisibility, hydrateSiteConfig, offerIsActive, offerLabel, subscribeSiteConfig, type Announcement } from "@/lib/site-config"
const signatureSubtitles: Record<string, string> = {
  loose_gemstones: "From the earth",
  fine_gold: "Made to last",
  jaipur_silver: "Heritage in every detail",
  custom_craft: "By hand, in Jaipur",
}

export default function Home() {
  const { products, loading: productsLoading } = useProducts()
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All pieces")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6
  const { wishlist, toggleWishlist } = useWishlist()
  const { cartItems, setCartItems, addToCart, removeFromCart } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[number] | null>(null)
  const [selectedImage, setSelectedImage] = useState("")
  const [selectedMediaMode, setSelectedMediaMode] = useState<"gallery" | "360" | "video">("gallery")
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const cart = cartItems.length
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id))
  const cartProducts = products.filter((product) => cartItems.includes(product.id))
  const [selectedCartIds, setSelectedCartIds] = useState<string[]>([])
  useEffect(() => {
    setSelectedCartIds((current) => current.length === 0 ? cartProducts.map((product) => product.id) : current.filter((id) => cartProducts.some((product) => product.id === id)))
  }, [cartProducts.map((product) => product.id).join(",")])
  const cartQuantity = (id: string) => cartItems.filter((item) => item === id).length
  const selectedCartProducts = cartProducts.filter((product) => selectedCartIds.includes(product.id))
  const cartCheckoutItems = selectedCartProducts.map((product) => ({ product, quantity: cartQuantity(product.id) }))
  const selectedCartTotal = selectedCartProducts.reduce((sum, product) => sum + product.priceInr * cartQuantity(product.id), 0)
  const updateCartQuantity = (id: string, nextQuantity: number) => setCartItems((items) => { const without = items.filter((item) => item !== id); return [...without, ...Array.from({ length: Math.max(1, nextQuantity) }, () => id)] })
  const removeCartLine = (id: string) => { setCartItems((items) => items.filter((item) => item !== id)); setSelectedCartIds((current) => current.filter((item) => item !== id)) }
  const [newsletter, setNewsletter] = useState("")
  const [newsletterSent, setNewsletterSent] = useState(false)
  const addProductToCart = (product: (typeof products)[number]) => addToCart(product.id)
  const [subscribed, setSubscribed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountView, setAccountView] = useState<"menu" | "auth" | "orders" | "wishlist">("menu")
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [rotated, setRotated] = useState<string[]>([])
  const { currency, setCurrency } = useCurrency()
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [siteMedia, setSiteMedia] = useState<Record<string, string>>({})
  const [heroImage, setHeroImage] = useState("")
  const [mediaLoading, setMediaLoading] = useState(true)
  const [announcement, setAnnouncementState] = useState<Announcement>(getAnnouncement())
  const [activeOffer, setActiveOfferState] = useState(getActiveOffer())
  const [bannerVisible, setBannerVisible] = useState(true)
  useEffect(() => {
    hydrateSiteConfig()
    setAnnouncementState(getAnnouncement())
    setActiveOfferState(getActiveOffer())
    return subscribeSiteConfig(() => { setAnnouncementState(getAnnouncement()); setActiveOfferState(getActiveOffer()); setBannerVisible(getBannerVisibility()) })
  }, [])
  useEffect(() => {
    try {
      const storedVisibility = window.localStorage.getItem("clp-banner-visible")
      if (storedVisibility !== null) setBannerVisible(storedVisibility === "true")
    } catch { /* optional preference */ }
  }, [])
  const [signatureCategories, setSignatureCategories] = useState<Array<{ id: string; label: string; url: string; sort_order: number }>>([])
  const displaySignatureCategories = signatureCategories.filter((category) => category.url)
  const isSaleActive = bannerVisible && products.some((product) => {
    const sale = saleDetails(product)
    return Boolean(product.showSaleBadge) && sale.discounted && sale.sale < sale.regular
  })
  useEffect(() => {
    const client = createClient()
    const mediaStartedAt = performance.now()
    void client.from("site_media").select("id, url").in("id", ["hero_light", "hero_dark", "loose_gemstones", "fine_gold", "jaipur_silver", "custom_craft"]).then(({ data, error }) => {
      if (error) {
        console.error("[v0] Site media query failed", error)
        window.setTimeout(() => setMediaLoading(false), Math.max(0, 200 - (performance.now() - mediaStartedAt)))
        return
      }
      const labels: Record<string, string> = {
        loose_gemstones: "Loose Gemstones",
        fine_gold: "Fine Gold Jewelry",
        jaipur_silver: "Jaipur Silver",
        custom_craft: "Custom Craft",
      }
      const rows = (data || []) as Array<Record<string, unknown>>
      const remoteMedia = Object.fromEntries(rows.filter((item) => ["hero_light", "hero_dark"].includes(String(item.id)) && String(item.url || "")).map((item) => [String(item.id), String(item.url)]))
      setSiteMedia((current) => ({ ...current, ...remoteMedia }))
      const remoteCategories = rows
        .filter((item) => ["loose_gemstones", "fine_gold", "jaipur_silver", "custom_craft"].includes(String(item.id)) && String(item.url || ""))
        .map((item) => ({ id: String(item.id), label: labels[String(item.id)] || String(item.id), url: String(item.url), sort_order: ["loose_gemstones", "fine_gold", "jaipur_silver", "custom_craft"].indexOf(String(item.id)) }))
        .sort((a, b) => a.sort_order - b.sort_order)
      setSignatureCategories(remoteCategories)
      setSiteMedia((current) => ({ ...current, ...Object.fromEntries(remoteCategories.map((item) => [item.id, item.url])) }))
      window.setTimeout(() => setMediaLoading(false), Math.max(0, 200 - (performance.now() - mediaStartedAt)))
    })
    const onBannerUpdate = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, string>>).detail
      if (!detail || typeof detail !== "object") return
      setSiteMedia((current) => ({ ...current, ...detail }))
      setSignatureCategories((current) => {
        const labels: Record<string, string> = { loose_gemstones: "Loose Gemstones", fine_gold: "Fine Gold Jewelry", jaipur_silver: "Jaipur Silver", custom_craft: "Custom Craft" }
        const next = [...current]
        Object.entries(detail).forEach(([id, url]) => {
          if (!url) return
          const index = next.findIndex((category) => category.id === id)
          if (index >= 0) next[index] = { ...next[index], url }
          else if (labels[id]) next.push({ id, label: labels[id], url, sort_order: ["loose_gemstones", "fine_gold", "jaipur_silver", "custom_craft"].indexOf(id) })
        })
        return next.sort((a, b) => a.sort_order - b.sort_order)
      })
    }
    window.addEventListener("site-banners-updated", onBannerUpdate)
    const mediaChannel = client
      .channel("site-media-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_media" }, (payload) => {
        const row = (payload.new || {}) as { id?: string; url?: string }
        if (row.id && row.url) onBannerUpdate(new CustomEvent("site-banners-updated", { detail: { [row.id]: row.url } }))
      })
      .subscribe()
    return () => {
      window.removeEventListener("site-banners-updated", onBannerUpdate)
      void client.removeChannel(mediaChannel)
    }
  }, [])
  useEffect(() => {
    const nextHero = siteMedia[theme === "light" ? "hero_light" : "hero_dark"]
    if (!nextHero || nextHero === heroImage) return
    const image = new window.Image()
    image.onload = () => setHeroImage(nextHero)
    image.src = nextHero
  }, [heroImage, siteMedia, theme])
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light")
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])
  const filters = ["All pieces", "Gold", "Emerald", "Ruby", "Diamond", "Loose Stones"]
  const filteredProducts = useMemo(() => products.filter((product) => {
    const category = String(product.category || "").trim().toLowerCase()
    const type = String(product.type || "").trim().toLowerCase()
    const metal = String(product.metal || "").trim().toLowerCase()
    const searchable = `${product.name} ${type} ${category} ${product.origin} ${product.description} ${product.tags.join(" ")}`.toLowerCase()
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const filter = activeFilter.toLowerCase()
    const matchesFilter = activeFilter === "All pieces" || (filter === "gold" ? category === "gold" || metal.includes("gold") || type.includes("gold") || searchable.includes("gold") : filter === "loose stones" ? category === "loose gemstones" || category === "loose stones" || type.includes("gemstone") : filter === "diamond" ? searchable.includes("diamond") : searchable.includes(filter))
    return matchesQuery && matchesFilter
  }), [activeFilter, query, products])
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const pageProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const saleSlides = products.filter((product) => {
    const sale = saleDetails(product)
    return Boolean(product.showSaleBadge) && sale.discounted && sale.sale < sale.regular && Boolean(product.image)
  }).map((product) => {
    const sale = saleDetails(product)
    return { id: `sale-${product.id}`, image: product.image, href: `/product/${product.id}`, label: `${product.name} · ${formatPrice(sale.sale, currency)}`, sale: true, percentOff: sale.percentOff }
  })
  useEffect(() => setCurrentPage(1), [activeFilter, query])

  return <main className="min-h-screen overflow-hidden bg-[#0a0a0a] text-[#f5e6c8]">
    <a className="announcement-bar" href={announcement.href}>{announcement.text}</a><div className="utility-bar"><span>Direct customer care: <u>Email</u> &amp; <u>WhatsApp</u></span><label className="utility-right" htmlFor="currency-select">Deliver to: <select id="currency-select" value={currency} onChange={(event) => setCurrency(event.target.value)} aria-label="Select country and currency"><option value="INR">India (INR ₹)</option><option value="USD">United States (USD $)</option><option value="AED">United Arab Emirates (AED)</option><option value="GBP">United Kingdom (GBP £)</option><option value="EUR">Europe (EUR €)</option></select><ChevronDown /></label></div>
    <header className="site-header"><a href="#top" className="brand-mark" aria-label="CLP home"><img src="/clp-logo-attached.png" alt="CLP Gems & Jewellery" /></a><form className="search-wrap" onSubmit={(event) => { event.preventDefault(); window.location.href = `/shop?q=${encodeURIComponent(query)}` }}><select aria-label="Search category" defaultValue="All"><option value="All">All categories</option><option>Gemstones</option><option>Fine Jewelry</option></select><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Natural Emeralds, Swat/Zambian Panna, Gold Rings..." aria-label="Search products" /><button type="submit" aria-label="Search"><ArrowRight size={15} /></button></form><div className="header-actions"><button className="icon-button header-wishlist" aria-label={`${wishlist.length} wishlist items`} onClick={() => { setAccountView("wishlist"); setAccountOpen(true) }}><Heart />{wishlist.length > 0 && <b>{wishlist.length}</b>}</button><button className="icon-button cart-button" aria-label={`${cart} items in cart`} onClick={() => setCartOpen(true)}><ShoppingBag />{cart > 0 && <b>{cart}</b>}</button><button className="theme-toggle" type="button" role="switch" aria-checked={theme === "light"} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}><span className="theme-toggle-icon">{theme === "dark" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}</span><span className="theme-toggle-track"><span className="theme-toggle-thumb" /></span></button><button className="account-trigger" onClick={() => { setAccountView("menu"); setAccountOpen(true) }} aria-label="Open account menu"><User /><span>Account</span></button><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button></div></header>
    <nav className={`main-nav ${menuOpen ? "open" : ""}`} aria-label="Main navigation">{[["Natural Gemstones", "/shop?category=Emerald"], ["Gold Fine Jewelry", "/shop?category=Gold"], ["Bespoke Custom", "/contact"], ["Certified Authenticity", "/authenticity"], ["About Us", "/about"]].map(([item, href]) => <a key={item} href={href}>{item}{item === "Natural Gemstones" && <ChevronDown />}</a>)}</nav>
    <section id="top" className="hero-section"><div className="hero-layout"><div className="hero-copy"><p className="eyebrow gold-text">EST. 1987 · JAIPUR, INDIA</p><h1>CLP: The Royal<br /><em>Legacy of Jaipur</em></h1><p className="hero-description">100% certified natural stones in gold jewelry, made in Jaipur for the world.</p><div className="hero-buttons"><a href="#collection" className="button button-gold">Explore gemstones <ArrowRight /></a><a href="#story" className="text-link">Our story <ArrowDownRight /></a></div></div><div className="hero-banner relative" role="img" aria-label={`${theme === "light" ? "Light" : "Dark"} mode luxury emerald banner`} style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{mediaLoading && <div className="absolute inset-0 z-20 grid place-items-center bg-black/60" role="status" aria-live="polite"><div className="clp-loading-spinner" aria-hidden="true" /><span className="sr-only">Loading banners</span></div>}<div className="hero-caption">Natural light / emerald cut / 18k gold<br /><span>Scroll to discover</span></div></div></div></section>{isSaleActive && saleSlides.length > 0 && <section className="promo-slider-section content-width" aria-label="Promotional offers">{offerIsActive(activeOffer) && <p className="campaign-strip">SPECIAL OFFER: Apply <strong>{activeOffer?.code}</strong> for {offerLabel(activeOffer!)}{activeOffer?.end ? ` · Sale ends ${activeOffer.end}` : ""}</p>}<HeroSlider slides={[...saleSlides, ...Object.entries(siteMedia).filter(([id, image]) => id.startsWith("slider-") && Boolean(image)).map(([id, image]) => ({ id, image, href: "/shop?category=Gold", label: "Shop the latest CLP Jewels offer" }))]} /></section>}
    <section className="intro-section content-width"><p className="eyebrow">A legacy, cut by hand</p><h2>Objects of <em>lasting wonder.</em></h2><p className="intro-copy">We source natural gemstones from the world&apos;s most storied mines and bring them to life in Jaipur, where every piece is shaped by generations of craft.</p></section>
    <section className="category-section content-width" id="collection"><div className="section-heading"><div><p className="eyebrow">Explore the house</p><h2>Find your <em>signature.</em></h2></div><a className="text-link" href="#products">View all collections <ArrowRight /></a></div><div className="category-grid">{displaySignatureCategories.map((category, index) => { const subtitle = signatureSubtitles[category.id] || "EXPLORE COLLECTION"; const name = category.label || ["LOOSE GEMSTONES", "FINE GOLD JEWELRY", "JAIPUR SILVER", "CUSTOM CRAFT"][index] || "CATEGORY TITLE"; const imageUrl = category.url || siteMedia[category.id]; return <a className={`category-card category-card-${(index % 4) + 1}`} href={`/shop?category=${encodeURIComponent(name)}`} key={category.id}><div className="relative group overflow-hidden rounded-2xl aspect-[3/4] w-full">{imageUrl ? <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center bg-black/20 text-xs uppercase tracking-[0.2em] text-[#a39a82]">Upload image in Admin</div>}<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" /><div className="category-copy absolute bottom-0 left-0 right-0 p-4 text-center z-20 flex flex-col items-center justify-end pointer-events-none"><span className="text-[10px] font-semibold tracking-[0.25em] text-[#D4AF37] uppercase mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{subtitle}</span><h3 className="text-xs sm:text-sm font-serif font-medium text-white tracking-[0.15em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{name}</h3></div></div></a> })}</div></section>
    <section className="products-section content-width" id="products"><div className="section-heading product-heading"><div><p className="eyebrow">The edit</p><h2>Pieces to <em>keep.</em></h2></div><div className="filters">{filters.map((filter) => <button className={activeFilter === filter ? "active" : ""} key={filter} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div></div><div className="product-grid">{productsLoading ? <div className="clp-loading-overlay col-span-full" role="status" aria-live="polite"><div className="clp-loading-spinner" aria-hidden="true" /><span className="sr-only">Loading products</span></div> : pageProducts.map((product) => <Link href={`/product/${product.id}`} className="product-card glass-panel" key={product.id} onClick={(event) => { if ((event.target as HTMLElement).closest("button")) event.preventDefault() }}><div className={`product-image ${rotated.includes(product.name) ? "rotated" : ""}`}><img className="w-full h-full object-cover" src={product.image} alt={product.name} /><button className="wishlist-button" onClick={() => toggleWishlist(product.id)} aria-label={`Add ${product.name} to wishlist`}><Heart fill={wishlist.includes(product.id) ? "currentColor" : "none"} /></button>{product.view && <button className="view-360" onClick={() => setRotated((current) => current.includes(product.name) ? current.filter((item) => item !== product.name) : [...current, product.name])}><Rotate3D /> {rotated.includes(product.name) ? "ROTATE BACK" : "360° VIEW"}</button>}</div><div className="product-info"><div><p className="product-type">{product.type}</p><h3>{product.name}</h3></div><strong>{(() => { const sale = saleDetails(product); return product.showSaleBadge && sale.discounted ? <><span className="sale-badge">{sale.percentOff}% OFF</span> <del>{formatPrice(sale.regular, currency)}</del> {formatPrice(sale.sale, currency)}</> : formatPrice(product.regularPriceInr || product.priceInr, currency) })()}</strong></div><div className="tag-row">{product.tags.map((tag) => <span key={tag}><span>✓</span>{tag}</span>)}</div><div className="product-actions"><button className="button button-dark" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelectedProduct(product); setSelectedImage(product.image) }}>View details <ArrowRight /></button><button className="customize-button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setSelectedProduct(product) }}>Customize</button></div></Link>)}</div>{!productsLoading && filteredProducts.length === 0 && <div className="clp-empty-state" role="status"><p className="eyebrow gold-text">Jaipur atelier</p><h3>New pieces arriving soon from the Jaipur atelier.</h3><button type="button" className="button button-gold" onClick={() => { setActiveFilter("All pieces"); setQuery("") }}>View all pieces</button></div>}</section>
    <nav className="catalog-pagination" aria-label="Product pages"><button type="button" onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.max(1, page - 1)) }} disabled={currentPage === 1} aria-label="Previous page">‹</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button type="button" key={page} className={page === currentPage ? "active" : ""} onClick={(event) => { event.preventDefault(); setCurrentPage(page) }} aria-current={page === currentPage ? "page" : undefined}>{page}</button>)}<button type="button" onClick={(event) => { event.preventDefault(); setCurrentPage((page) => Math.min(totalPages, page + 1)) }} disabled={currentPage === totalPages} aria-label="Next page">›</button></nav>
    <section className="trust-section"><div className="content-width trust-grid"><div><span className="trust-icon"><Globe2 aria-hidden="true" /></span><h3>Worldwide insured shipping</h3><p>Handled with care, from our atelier to your door.</p></div><div><span className="trust-icon"><Crown aria-hidden="true" /></span><h3>Lifetime authenticity</h3><p>Every natural stone is certified and guaranteed.</p></div><div><span className="trust-icon"><ShieldCheck aria-hidden="true" /></span><h3>Safe &amp; encrypted checkout</h3><p>Your details remain private, always.</p></div></div></section>
    <section className="story-section content-width" id="story"><div className="story-image"><img className="w-full h-full object-cover" src="/category-jaipur-craft.png" alt="Jaipur emerald gold atelier" /></div><div className="story-copy"><p className="eyebrow gold-text">The CLP atelier</p><h2>Made in Jaipur.<br /><em>Meant for everywhere.</em></h2><p>From a small family workshop in the Pink City to collectors across the world, our practice has always been about patience. We believe the finest jewelry should feel discovered, not designed.</p><a href="#top" className="button button-outline">Read our story <ArrowRight /></a></div></section>
    <section className="newsletter-section"><div className="content-width newsletter-inner"><div><p className="eyebrow gold-text">A note from Jaipur</p><h2>Receive the <em>rare finds.</em></h2><p>Private previews, new arrivals, and stories from the atelier.</p></div><form onSubmit={(event) => { event.preventDefault(); if (newsletter) setSubscribed(true) }}><div className="newsletter-input"><Mail /><input value={newsletter} onChange={(event) => setNewsletter(event.target.value)} type="email" placeholder="Your email address" aria-label="Your email address" required /><button aria-label="Subscribe"><Send /></button></div>{subscribed && <span className="success-message">You&apos;re on the list. Welcome to CLP.</span>}</form></div></section>
    <footer className="site-footer"><div className="content-width footer-grid"><div className="footer-brand"><a className="brand-mark footer-logo" href="#top"><img src="/clp-logo-attached.png" alt="CLP Gems & Jewellery" /></a><p>Natural stones and gold jewelry, shaped by Jaipur.</p><div className="socials"><a href="#top" aria-label="Social profile"><Star /></a><a href="mailto:hello@clpjewels.com" aria-label="Email"><Mail /></a></div></div><div><h4>Explore</h4><a href="#collection">Gemstones</a><a href="#products">Fine jewelry</a><a href="#story">Our story</a><a href="#products">Custom design</a></div><div><h4>Care</h4><a href="#story">Shipping &amp; returns</a><a href="#story">Authenticity</a><a href="#story">Care guide</a><a href="mailto:hello@clpjewels.com">Contact us</a></div><div><h4>Payments we accept</h4><div className="payment-row"><span>VISA</span><span>MC</span><span>UPI</span><span>PayPal</span></div><p className="copyright">© 2026 CLP Jewels. All rights reserved.</p></div></div></footer>
    <a className="whatsapp-widget" href="https://wa.me/919828354333" target="_blank" rel="noreferrer"><MessageCircle /><span>Chat with a<br /><b>Gem Expert</b></span></a>
    {cartOpen && <div className="account-backdrop" role="presentation" onClick={() => setCartOpen(false)}><aside className="cart-drawer glass-panel" role="dialog" aria-modal="true" aria-label="Shopping bag" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setCartOpen(false)} aria-label="Close shopping bag"><X /></button><p className="eyebrow gold-text">Your bag</p><h2>Pieces selected.</h2>{cartProducts.length === 0 ? <p className="modal-copy">Your bag is waiting for something rare.</p> : <div className="cart-items">{cartProducts.map((product) => { const quantity = cartQuantity(product.id); const selected = selectedCartIds.includes(product.id); return <div className={`cart-item ${selected ? "is-selected" : "is-unselected"}`} key={product.id}><input className="cart-item-check" type="checkbox" checked={selected} onChange={() => setSelectedCartIds((current) => selected ? current.filter((id) => id !== product.id) : [...current, product.id])} aria-label={`Include ${product.name} in checkout`} /><img src={product.image} alt={product.name} /><div className="cart-item-details"><strong>{product.name}</strong><span>{formatPrice(product.priceInr, currency)} each</span><div className="cart-quantity" aria-label={`Quantity for ${product.name}`}><button type="button" onClick={() => updateCartQuantity(product.id, quantity - 1)} disabled={quantity <= 1} aria-label={`Decrease ${product.name} quantity`}>−</button><span>{quantity}</span><button type="button" onClick={() => updateCartQuantity(product.id, quantity + 1)} aria-label={`Increase ${product.name} quantity`}>+</button></div></div><strong className="cart-line-total">{formatPrice(product.priceInr * quantity, currency)}</strong><button className="cart-remove" onClick={() => removeCartLine(product.id)} aria-label={`Remove ${product.name}`}><X /></button></div> })}<div className="cart-total"><span>Total selected</span><strong>{formatPrice(selectedCartTotal, currency)}</strong></div>{selectedCartProducts.length === 0 && <p className="cart-selection-hint" role="status">Select at least one piece</p>}<button className="button button-gold" disabled={selectedCartProducts.length === 0} onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>Proceed to Checkout <ArrowRight /></button></div>}</aside></div>}
    {selectedProduct && <div className="account-backdrop" role="presentation" onClick={() => { setSelectedProduct(null); setSelectedMediaMode("gallery") }}><section className="account-modal product-modal glass-panel" role="dialog" aria-modal="true" aria-label={`${selectedProduct.name} details`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => { setSelectedProduct(null); setSelectedMediaMode("gallery") }} aria-label="Close product details"><X /></button><div className="modal-product-grid"><div>{selectedMediaMode === "video" && selectedProduct.videoUrl ? <video className="modal-product-image" src={selectedProduct.videoUrl} controls autoPlay playsInline /> : selectedMediaMode === "360" && selectedProduct.view360?.length ? <ProductViewer360 images={selectedProduct.view360} alt={selectedProduct.name} /> : <img className="modal-product-image" src={selectedImage || selectedProduct.image} alt={selectedProduct.name} />}<div className="modal-thumbs">{selectedProduct.gallery.filter((image) => typeof image === "string" && image.trim().length > 0).slice(0, 6).map((image, index) => <button key={`${image}-${index}`} onClick={() => setSelectedImage(image)}><img src={image} alt={`View ${index + 1}`} /></button>)}</div></div><div><p className="eyebrow gold-text">{selectedProduct.type}</p><h2>{selectedProduct.name}</h2><p className="pdp-price">{formatPrice(selectedProduct.priceInr, currency)}</p><div className="modal-tabs"><button className={selectedMediaMode === "gallery" ? "active" : ""} onClick={() => setSelectedMediaMode("gallery")}>Gallery</button><button disabled={!selectedProduct.view360?.length} className={selectedMediaMode === "360" ? "active" : ""} onClick={() => setSelectedMediaMode("360")}><Rotate3D /> 360° View</button><button disabled={!selectedProduct.videoUrl} className={selectedMediaMode === "video" ? "active" : ""} onClick={() => setSelectedMediaMode("video")}><Play /> Video Preview</button></div><div className="tag-row">{selectedProduct.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="modal-product-actions"><div className="modal-primary-actions"><button className="button button-outline" onClick={() => { addProductToCart(selectedProduct); setSelectedProduct(null); setCartOpen(true) }}>Add to Cart <ShoppingBag /></button><button className={`button wishlist-action ${wishlist.includes(selectedProduct.name) ? "active" : ""}`} onClick={() => toggleWishlist(selectedProduct.id)} aria-label={wishlist.includes(selectedProduct.name) ? `Remove ${selectedProduct.name} from wishlist` : `Add ${selectedProduct.name} to wishlist`}><Heart fill={wishlist.includes(selectedProduct.name) ? "currentColor" : "none"} /> Wishlist</button></div><a className="whatsapp-cta" href="https://wa.me/919828354333" target="_blank" rel="noreferrer"><MessageCircle /> Inquire via WhatsApp</a></div></div></div></section></div>}
    {checkoutOpen && <div className="account-backdrop" role="presentation" onClick={() => setCheckoutOpen(false)}><section className="account-modal checkout-modal glass-panel" role="dialog" aria-modal="true" aria-label="Checkout" onClick={(event) => event.stopPropagation()}>{productsLoading ? <div className="clp-loading-overlay" role="status" aria-label="Loading checkout"><div className="clp-loading-spinner" aria-hidden="true" /></div> : <CheckoutForm items={cartCheckoutItems} onComplete={() => setCheckoutOpen(false)} />}<button className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X /></button><p className="eyebrow gold-text">Secure checkout</p><h2>Complete your order.</h2><form className="account-form checkout-form" onSubmit={(event) => { event.preventDefault(); setCheckoutOpen(false) }}><div className="checkout-field"><label htmlFor="checkout-name">Full name</label><input id="checkout-name" required placeholder="Your name" /></div><div className="checkout-field"><label htmlFor="checkout-phone">Phone number</label><input id="checkout-phone" required type="tel" placeholder="+91 98765 43210" /></div><div className="checkout-field checkout-field-wide"><label htmlFor="checkout-address">Address</label><input id="checkout-address" required placeholder="Shipping address" /></div><div className="checkout-fields"><div className="checkout-field"><label htmlFor="checkout-city">City</label><input id="checkout-city" required placeholder="Jaipur" /></div><div className="checkout-field"><label htmlFor="checkout-state">State</label><input id="checkout-state" required placeholder="Rajasthan" /></div><div className="checkout-field"><label htmlFor="checkout-pincode">Pincode</label><input id="checkout-pincode" required inputMode="numeric" placeholder="302001" /></div></div><div className="payment-options"><strong>Payment method</strong><label><input type="radio" name="payment" defaultChecked /> UPI · GPay / PhonePe</label><label><input type="radio" name="payment" /> Credit / Debit Card</label><label><input type="radio" name="payment" /> NetBanking</label><label><input type="radio" name="payment" /> Cash on Delivery</label></div><button className="button button-gold" type="submit">Place order <ArrowRight /></button></form></section></div>}
    {accountOpen && <div className="account-backdrop" role="presentation" onClick={() => setAccountOpen(false)}><section className="account-modal glass-panel" role="dialog" aria-modal="true" aria-label="CLP account" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setAccountOpen(false)} aria-label="Close account"><X /></button>{accountView === "menu" && <><p className="eyebrow gold-text">Your CLP account</p><h2>Welcome to the <em>inner circle.</em></h2><p className="modal-copy">Save rare finds, follow every order, and receive private atelier previews.</p><div className="account-menu"><button onClick={() => { setAccountView("auth"); setAuthMode("login") }}><LogIn /><span><strong>Login / Sign up</strong><small>Access your account</small></span><ArrowRight /></button><button onClick={() => setAccountView("orders")}><Package /><span><strong>My Orders</strong><small>Track shipments and invoices</small></span><ArrowRight /></button><button onClick={() => setAccountView("wishlist")}><Heart /><span><strong>Wishlist</strong><small>{wishlist.length} saved pieces</small></span><ArrowRight /></button></div></>}{accountView === "auth" && <><button className="modal-back" onClick={() => setAccountView("menu")}><ArrowDownRight /> Account</button><p className="eyebrow gold-text">Private client access</p><h2>{authMode === "login" ? "Welcome back." : "Join the inner circle."}</h2><button className="google-button" type="button" onClick={async () => { try { if (window.self !== window.top) { window.alert("Google sign-in opens in a new tab from the preview."); window.open(`${window.location.origin}/auth/callback?provider=google`, "_blank", "noopener,noreferrer"); return } const client = createClient(); if (!client) { window.alert("Authentication is temporarily unavailable."); return } const { error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } }); if (error) window.alert("Google sign-in is unavailable right now. Please use email sign-in.") } catch { window.alert("Google sign-in is unavailable in the preview. Please use email sign-in.") } }}><span className="google-logo" aria-hidden="true">G</span> Continue with Google</button><div className="auth-divider"><span>or continue with email</span></div><form className="account-form" onSubmit={(event) => { event.preventDefault(); setAccountView("menu") }}><label>Email address<input type="email" placeholder="you@example.com" required /></label><label>Phone number<input type="tel" placeholder="+91 98765 43210" required /></label><label>{authMode === "login" ? "Password or OTP" : "Create password"}<input type="password" placeholder="Enter securely" required /></label><button className="button button-gold" type="submit">{authMode === "login" ? "Continue securely" : "Create account"} <ArrowRight /></button></form><button className="switch-auth" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>{authMode === "login" ? "New to CLP? Create an account" : "Already have an account? Login"}</button></>}{accountView === "orders" && <><button className="modal-back" onClick={() => setAccountView("menu")}><ArrowDownRight /> Account</button><p className="eyebrow gold-text">Private client orders</p><h2>My <em>orders.</em></h2><div className="order-card"><div className="order-top"><strong>CLP-1987-0421</strong><span className="order-status">Shipped</span></div><div className="order-item"><img src={products[0].image} alt="Zambian emerald" /><span><strong>{products[0].name}</strong><small>1 piece · {formatPrice(products[0].priceInr, currency)}</small></span></div><div className="order-progress"><span className="done">Processing</span><span className="done">Shipped</span><span>Delivered</span></div><button className="invoice-button"><Download /> Download invoice</button></div></>}{accountView === "wishlist" && <><button className="modal-back" onClick={() => setAccountView("menu")}><ArrowDownRight /> Account</button><p className="eyebrow gold-text">Saved by you</p><h2>Your <em>wishlist.</em></h2><div className="wishlist-grid">{wishlistProducts.map((product) => <article key={product.id}><img src={product.image} alt={product.name} /><div><strong>{product.name}</strong><small>{formatPrice(product.priceInr, currency)}</small><button onClick={() => setCartItems((items) => items)}>Move to cart</button></div></article>)}</div></>}</section></div>}
  </main>
}
