"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Media = { id: string; kind: "hero" | "signature" | "slider"; label: string; url: string; sort_order: number }
type BannerRow = { type: string; image_url: string }

const heroDefaults = {
  heroBannerLight: "/hero-emerald-gold.png",
  heroBannerDark: "/hero-emerald-gold.png",
}

const signatureDefaults = [
  ["signature-loose", "Loose Gemstones", "/category-loose-gemstones.png"],
  ["signature-gold", "Fine Gold Jewelry", "/category-gold-jewelry.png"],
  ["signature-jaipur", "Jaipur Silver", "/category-jaipur-craft.png"],
  ["signature-custom", "Custom Craft", "/category-jaipur-craft.png"],
] as const

const STORAGE_KEY = "clp-slider-banners"
const HERO_STORAGE_KEY = "site_banners"
const BANNER_FALLBACK = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000"

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error("The selected banner could not be read."))
    reader.readAsDataURL(file)
  })
}

async function uploadBanner(file: File, id: string) {
  const fallback = await fileToDataUrl(file)
  try {
    const path = `banners/${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
    const upload = await supabase.storage.from("banners").upload(path, file, { upsert: true, contentType: file.type })
    if (upload.error) return fallback
    return supabase.storage.from("banners").getPublicUrl(path).data.publicUrl || fallback
  } catch (error) {
    console.error("[v0] Banner storage upload failed; using selected file", error)
    return fallback
  }
}

export function SiteMediaManager() {
  const [items, setItems] = useState<Media[]>([
    { id: "heroBannerLight", kind: "hero", label: "Hero Banner (Light Mode)", url: heroDefaults.heroBannerLight, sort_order: -2 },
    { id: "heroBannerDark", kind: "hero", label: "Hero Banner (Dark Mode)", url: heroDefaults.heroBannerDark, sort_order: -1 },
    ...signatureDefaults.map(([id, label, url], index) => ({ id, kind: "signature" as const, label, url, sort_order: index })),
  ])
  const [sliderItems, setSliderItems] = useState<Media[]>([])
  const [notice, setNotice] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadMedia = async () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        const storedHeroes = JSON.parse(window.localStorage.getItem(HERO_STORAGE_KEY) || "{}") as Record<string, string>
        if (stored && active) setSliderItems(JSON.parse(stored) as Media[])
        if (active) setItems((current) => current.map((item) => storedHeroes[item.id] ? { ...item, url: storedHeroes[item.id] } : item))
        const { data, error } = await supabase.from("banners").select("type,image_url")
        if (error) throw error
        if (active && data?.length) {
          const rows = data as BannerRow[]
          setItems((current) => current.map((item) => {
            const type = item.id === "heroBannerDark" ? "hero_dark" : "hero_light"
            const remote = rows.find((row) => row.type === type || row.type === type.replace("hero_", ""))
            return remote?.image_url ? { ...item, url: remote.image_url } : item
          }))
        }
        const signatures = await supabase.from("site_media").select("id,url").eq("kind", "signature")
        if (signatures.error) throw signatures.error
        if (active && signatures.data?.length) {
          setItems((current) => current.map((item) => {
            const remote = (signatures.data as Array<{ id: string; url: string }>).find((row) => row.id === item.id)
            return remote?.url ? { ...item, url: remote.url } : item
          }))
        }
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
      if (item.kind === "signature") {
        try {
          const { error } = await supabase.from("site_media").upsert({ id: item.id, kind: "signature", label: item.label, url, sort_order: item.sort_order }, { onConflict: "id" })
          if (error) throw error
        } catch (databaseError) {
          console.error("[v0] Signature banner database save failed; keeping local publish", databaseError)
        }
        const cached = JSON.parse(window.localStorage.getItem(HERO_STORAGE_KEY) || "{}") as Record<string, string>
        const nextCache = { ...cached, [item.id]: url }
        window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(nextCache))
        window.localStorage.setItem("clp-signature-media-cache", JSON.stringify(nextCache))
        window.dispatchEvent(new CustomEvent("site-banners-updated", { detail: nextCache }))
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url } : entry))
        setNotice(`${item.label} saved successfully.`)
        return
      }
      const bannerType = item.id === "heroBannerDark" ? "hero_dark" : "hero_light"
      const { error } = await supabase.from("banners").upsert({ type: bannerType, image_url: url }, { onConflict: "type" })
      if (error) {
        const storedHeroes = JSON.parse(window.localStorage.getItem(HERO_STORAGE_KEY) || "{}") as Record<string, string>
        window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify({ ...storedHeroes, [item.id]: url }))
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url } : entry))
        setNotice(`${item.label} saved locally while Supabase is unavailable.`)
        return
      }
      try {
        const cached = JSON.parse(window.localStorage.getItem(HERO_STORAGE_KEY) || "{}") as Record<string, string>
        const nextCache = { ...cached, [item.id]: url }
        window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(nextCache))
        window.dispatchEvent(new CustomEvent("site-banners-updated", { detail: nextCache }))
      } catch { /* cache is optional */ }
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
