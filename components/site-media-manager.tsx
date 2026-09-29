"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Media = { id: string; kind: "hero" | "signature" | "slider"; label: string; url: string; sort_order: number }

const heroDefaults = {
  heroBannerLight: "/hero-emerald-gold.png",
  heroBannerDark: "/hero-emerald-gold.png",
}

const STORAGE_KEY = "clp-slider-banners"
const BANNER_FALLBACK = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000"

async function withTimeout<T>(promise: PromiseLike<T>, message: string): Promise<T> {
  return Promise.race([Promise.resolve(promise), new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error(message)), 5000))])
}

async function uploadBanner(file: File, id: string) {
  const path = `banners/${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
  const upload = await withTimeout(supabase.storage.from("products-image").upload(path, file, { upsert: true, contentType: file.type }), "Banner upload timed out after 5 seconds.")
  if (upload.error) throw upload.error
  return supabase.storage.from("products-image").getPublicUrl(path).data.publicUrl
}

export function SiteMediaManager() {
  const [items, setItems] = useState<Media[]>([
    { id: "heroBannerLight", kind: "hero", label: "Hero Banner (Light Mode)", url: heroDefaults.heroBannerLight, sort_order: -2 },
    { id: "heroBannerDark", kind: "hero", label: "Hero Banner (Dark Mode)", url: heroDefaults.heroBannerDark, sort_order: -1 },
  ])
  const [sliderItems, setSliderItems] = useState<Media[]>([])
  const [notice, setNotice] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadMedia = async () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored && active) setSliderItems(JSON.parse(stored) as Media[])
        const { data, error } = await withTimeout(supabase.from("banners").select("id,kind,label,url,sort_order").eq("kind", "hero"), "Banner load timed out after 5 seconds.")
        if (error) throw error
        if (active && data?.length) setItems((current) => current.map((item) => data.find((remote) => remote.id === item.id) || item))
      } catch (reason) {
        console.error("[v0] Banner load failed", reason)
        if (active) setNotice(reason instanceof Error ? `Error: ${reason.message}` : "Unable to load saved banners.")
      }
    }
    void loadMedia()
    return () => { active = false }
  }, [])

  const persistSliders = (next: Media[]) => {
    setSliderItems(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const updateHero = async (item: Media, file: File) => {
    setSavingId(item.id)
    setNotice(`Saving ${item.label}...`)
    try {
      let url = BANNER_FALLBACK
      try { url = await uploadBanner(file, item.id) } catch (uploadError) { console.error("[v0] Banner upload failed", uploadError) }
      const { error } = await withTimeout(supabase.from("banners").upsert({ id: item.id, kind: item.kind, label: item.label, url, sort_order: item.sort_order }, { onConflict: "id" }), "Banner save timed out after 5 seconds.")
      if (error) throw error
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url } : entry))
      setNotice(`${item.label} saved successfully.`)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to save banner."
      console.error("[v0] Banner save failed", reason)
      window.alert(`Error: ${message}`)
      setNotice(`Error: ${message}`)
    } finally { setSavingId(null) }
  }

  return (
    <section className="site-media-manager">
      <div className="admin-toolbar">
        <div><p className="eyebrow">Homepage control</p><h2>Site Media &amp; Banners</h2><p className="admin-muted">Manage banners locally in this browser without an external database.</p></div>
      </div>
      {notice && <p className="admin-success" role="status">{notice}</p>}
      <div className="media-grid">
        {items.map((item) => <article className="media-card" key={item.id}><img src={item.url} alt={item.label} /><strong>{item.label}</strong><label className="admin-button media-upload-label" aria-disabled={savingId === item.id}>{savingId === item.id ? "Saving..." : "Replace Image"}<input type="file" accept="image/*" hidden disabled={savingId === item.id} onChange={(event) => { const file = event.target.files?.[0]; if (file) void updateHero(item, file); event.currentTarget.value = "" }} /></label></article>)}
      </div>
      <section className="slider-manager">
        <div className="admin-toolbar"><div><p className="eyebrow">Homepage Slider Banners</p><h3>Upload New Banner Images</h3><p className="admin-muted">Promotional banners autoplay every 3 seconds on the storefront.</p></div><label className="admin-button media-upload-label">Choose Multiple Images<input type="file" accept="image/*" multiple hidden onChange={(event) => { const files = Array.from(event.target.files || []); if (!files.length) return; const added = files.map((file, index): Media => ({ id: `slider-${Date.now()}-${index}`, kind: "slider", label: file.name, url: URL.createObjectURL(file), sort_order: sliderItems.length + index })); persistSliders([...sliderItems, ...added]); setNotice(`${added.length} banner${added.length === 1 ? "" : "s"} added locally.`); event.currentTarget.value = "" }} /></label></div>
        <div className="slider-items">{sliderItems.map((item, index) => <article className="slider-item" key={item.id}><img src={item.url} alt={item.label} /><strong>{item.label}</strong><button type="button" onClick={() => persistSliders(sliderItems.filter((entry) => entry.id !== item.id))}>Delete</button><button type="button" disabled={index === 0} onClick={() => { const next = [...sliderItems]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; persistSliders(next) }}>↑</button><button type="button" disabled={index === sliderItems.length - 1} onClick={() => { const next = [...sliderItems]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; persistSliders(next) }}>↓</button></article>)}</div>
      </section>
    </section>
  )
}

export async function getSiteMedia(kind?: "hero" | "signature" | "slider") {
  if (typeof window === "undefined") return [] as Media[]
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as Media[]
    return kind ? stored.filter((item) => item.kind === kind) : stored
  } catch { return [] as Media[] }
}

export type { Media }
