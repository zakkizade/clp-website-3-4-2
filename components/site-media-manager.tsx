"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Media = { id: string; kind: "hero" | "signature"; label: string; url: string; sort_order: number }

const heroDefaults = {
  heroBannerLight: "/hero-emerald-gold.png",
  heroBannerDark: "/hero-emerald-gold.png",
}

export function SiteMediaManager() {
  const [items, setItems] = useState<Media[]>([])
  const [notice, setNotice] = useState("")
  const load = async () => { const { data } = await createClient().from("site_media").select("id,kind,label,url,sort_order").order("sort_order"); const rows = (data || []) as Media[]; const legacy = rows.find((item) => item.id === "hero-default")?.url; const heroLight = rows.find((item) => item.id === "heroBannerLight")?.url || legacy || heroDefaults.heroBannerLight; const heroDark = rows.find((item) => item.id === "heroBannerDark")?.url || legacy || heroDefaults.heroBannerDark; setItems([{ id: "heroBannerLight", kind: "hero", label: "Hero Banner (Light Mode)", url: heroLight, sort_order: -2 }, { id: "heroBannerDark", kind: "hero", label: "Hero Banner (Dark Mode)", url: heroDark, sort_order: -1 }, ...rows.filter((item) => item.kind === "signature")]) }
  useEffect(() => { void load() }, [])
  const update = async (item: Media, url: string) => { const { error } = await createClient().from("site_media").upsert({ ...item, url }); if (error) setNotice(error.message); else { setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url } : entry)); setNotice(`${item.label} updated.`) } }
  const upload = async (item: Media, file: File) => { const path = `site/${item.id}-${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`; const { error } = await createClient().storage.from("product-media").upload(path, file, { upsert: true }); if (error) { setNotice(error.message); return } const { data } = createClient().storage.from("product-media").getPublicUrl(path); await update(item, data.publicUrl) }
  return <section className="site-media-manager"><div className="admin-toolbar"><div><p className="eyebrow">Homepage control</p><h2>Site Media &amp; Banners</h2><p className="admin-muted">Manage independent Light Mode and Dark Mode hero banners plus signature collection imagery.</p></div></div>{notice && <p className="admin-success" role="status">{notice}</p>}<div className="site-media-grid">{items.map((item) => <article className="site-media-card" key={item.id}><div className="site-media-preview"><img src={item.url} alt={item.label} /></div><div className="site-media-card-body"><strong>{item.label}</strong><input value={item.url} onChange={(event) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url: event.target.value } : entry))} onBlur={(event) => void update(item, event.target.value)} aria-label={`${item.label} URL`} /><label className="admin-button media-upload-label">Upload image<input type="file" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(item, file) }} /></label></div></article>)}</div></section>
}

export async function getSiteMedia(kind?: "hero" | "signature") { const query = createClient().from("site_media").select("id,kind,label,url,sort_order").order("sort_order"); const { data } = kind ? await query.eq("kind", kind) : await query; return (data || []) as Media[] }

export type { Media }
