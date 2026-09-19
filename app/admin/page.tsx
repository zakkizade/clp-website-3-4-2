"use client"

import { FormEvent, useState } from "react"
import { LogOut, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import { useProducts } from "@/components/product-store"
import type { Product } from "@/lib/products"

const blankProduct: Product = { id: "", name: "", type: "Fine Jewelry", slug: "", priceInr: 0, image: "", gallery: [], tags: [], category: "Fine Jewelry", goldPurity: "18K Gold", certificate: "", origin: "Jaipur, India", description: "", isFeatured: false, view: true, carat: "", metal: "18K Gold", videoUrl: "", view360: [] }
const categories: Product["category"][] = ["Emerald", "Gold", "Fine Jewelry", "Loose Gemstones", "Ruby"]

function splitLines(value: string) { return value.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }

export default function AdminPage() {
  const { products, saveProduct, deleteProduct } = useProducts()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [editing, setEditing] = useState<Product | null>(null)
  const [notice, setNotice] = useState("")

  const login = (event: FormEvent) => {
    event.preventDefault()
    if (password === "clp2026") { setAuthenticated(true); setPassword("") } else setNotice("Incorrect password")
  }

  if (!authenticated) return <main className="admin-page"><section className="admin-login"><p className="eyebrow">Private workspace</p><h1>CLP Admin</h1><p>Sign in to manage the collection.</p><form onSubmit={login}><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required /></label>{notice && <p className="admin-error" role="alert">{notice}</p>}<button className="admin-button" type="submit">Enter dashboard</button></form></section></main>

  const update = (key: keyof Product, value: string | boolean) => setEditing((current) => current ? { ...current, [key]: value } : current)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing || !editing.name || !editing.image) return
    const id = editing.id || slugify(editing.name)
    saveProduct({ ...editing, id, slug: editing.slug || id, priceInr: Number(editing.priceInr), gallery: Array.isArray(editing.gallery) ? editing.gallery : splitLines(String(editing.gallery)), view360: Array.isArray(editing.view360) ? editing.view360 : splitLines(String(editing.view360 || "")), tags: editing.tags || [] })
    setEditing(null); setNotice(editing.id ? "Product updated successfully." : "Product added successfully."); window.setTimeout(() => setNotice(""), 3000)
  }
  const remove = (product: Product) => { if (window.confirm(`Delete ${product.name}? This cannot be undone.`)) { deleteProduct(product.id); setNotice("Product deleted."); window.setTimeout(() => setNotice(""), 3000) } }

  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">Private workspace</p><h1>CLP Admin</h1><p className="admin-muted">Product manager · changes sync to the storefront</p></div><button className="admin-logout" onClick={() => setAuthenticated(false)}><LogOut size={15} /> Log out</button></header>{notice && <p className="admin-success" role="status">{notice}</p>}<section className="admin-stats"><div><span>Total products</span><strong>{products.length}</strong></div><div><span>Featured</span><strong>{products.filter((product) => product.isFeatured).length}</strong></div><div><span>Categories</span><strong>{new Set(products.map((product) => product.category)).size}</strong></div></section><div className="admin-toolbar"><h2>Products</h2><button className="admin-button" onClick={() => setEditing({ ...blankProduct })}><Plus size={16} /> Add new product</button></div><div className="admin-table">{products.map((product) => <article key={product.id}><div><strong>{product.name}</strong><span>{product.category} · ₹{product.priceInr.toLocaleString("en-IN")}</span></div><div className="admin-actions"><button onClick={() => setEditing({ ...product })} aria-label={`Edit ${product.name}`}><Pencil size={15} /></button><button onClick={() => remove(product)} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button></div></article>)}</div>{editing && <div className="admin-editor-backdrop"><form className="admin-editor" onSubmit={submit}><div className="admin-editor-heading"><div><p className="eyebrow">Collection editor</p><h2>{editing.id ? "Edit product" : "Add product"}</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Close editor"><X size={18} /></button></div><div className="admin-form-grid"><label>Product Name<input required value={editing.name} onChange={(event) => update("name", event.target.value)} /></label><label>Price (INR)<input required type="number" min="0" value={editing.priceInr} onChange={(event) => update("priceInr", event.target.value)} /></label><label>Category<select value={editing.category} onChange={(event) => update("category", event.target.value as Product["category"])}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Carat<input value={editing.carat} onChange={(event) => update("carat", event.target.value)} /></label><label>Gold Purity<input value={editing.goldPurity} onChange={(event) => update("goldPurity", event.target.value)} /></label><label>Certificate<input value={editing.certificate} onChange={(event) => update("certificate", event.target.value)} /></label><label>Origin<input value={editing.origin} onChange={(event) => update("origin", event.target.value)} /></label><label>Main Image URL<input required type="url" value={editing.image} onChange={(event) => update("image", event.target.value)} /></label><label>Video URL <span className="admin-optional">optional</span><input type="url" value={editing.videoUrl || ""} onChange={(event) => update("videoUrl", event.target.value)} /></label><label className="admin-wide">Short Description<textarea required rows={3} value={editing.description} onChange={(event) => update("description", event.target.value)} /></label><label className="admin-wide">Additional Image URLs <span className="admin-optional">one per line or comma separated</span><textarea rows={3} value={editing.gallery.join("\n")} onChange={(event) => update("gallery", event.target.value)} /></label><label className="admin-wide">360 View Image URLs <span className="admin-optional">optional · one per line</span><textarea rows={3} value={(editing.view360 || []).join("\n")} onChange={(event) => update("view360", event.target.value)} /></label></div><label className="admin-check"><input type="checkbox" checked={editing.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} /> Featured product</label><button className="admin-button" type="submit"><Save size={16} /> Save product</button></form></div>}</main>
}
