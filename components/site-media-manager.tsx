"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Media = { id: string; kind: "hero" | "signature" | "slider"; label: string; url: string; sort_order: number }
type BannerRow = { type: string; image_url: string }

const signatureDefaults = [
  ["signature-loose", "Loose Gemstones"],
  ["signature-gold", "Fine Gold Jewelry"],
  ["signature-jaipur", "Jaipur Silver"],
  ["signature-custom", "Custom Craft"],
] as const

const STORAGE_KEY = "clp-slider-banners"
const HERO_STORAGE_KEY = "site_banners"
async function compressImage(file: File) {
  const sourceUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.decoding = "async"
    image.src = sourceUrl
    await image.decode()
    const maxDimension = 1600
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Unable to prepare the banner image.")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Unable to compress the banner image.")), "image/webp", 0.72)
    })
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error ?? new Error("The selected banner could not be read."))
      reader.readAsDataURL(blob)
    })
    return { blob, dataUrl }
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

function readBannerCache() {
  try {
    return JSON.parse(window.localStorage.getItem(HERO_STORAGE_KEY) || "{}") as Record<string, string>
  } catch {
    return {} as Record<string, string>
  }
}

function writeBannerCache(nextCache: Record<string, string>) {
  try {
    window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(nextCache))
    return true
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("[v0] Banner cache quota exceeded; keeping the image in React state only")
    } else {
      console.warn("[v0] Banner cache could not be written", error)
    }
    return false
  }
}

async function uploadBanner(file: File, id: string) {
  const compressed = await compressImage(file)
  const fallback = compressed.dataUrl
  try {
    const path = `banners/${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
    const upload = await supabase.storage.from("banners").upload(path, compressed.blob, { upsert: true, contentType: "image/webp" })
    if (upload.error) return fallback
    return supabase.storage.from("banners").getPublicUrl(path).data.publicUrl || fallback
  } catch (error) {
    console.error("[v0] Banner storage upload failed; using selected file", error)
    return fallback
  }
}

export function SiteMediaManager() {
  const [items, setItems] = useState<Media[]>([
    { id: "heroBannerLight", kind: "hero", label: "Hero Banner (Light Mode)", url: "", sort_order: -2 },
    { id: "heroBannerDark", kind: "hero", label: "Hero Banner (Dark Mode)", url: "", sort_order: -1 },
    ...signatureDefaults.map(([id, label], index) => ({ id, kind: "signature" as const, label, url: "", sort_order: index })),
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
        // Signature banners are optional on older projects. Keep the local cache
        // and current preview when the optional table is unavailable.
        const signatures = await supabase.from("site_media").select("id,url").eq("kind", "signature")
        if (active && !signatures.error && signatures.data?.length) {
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
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") console.warn("[v0] Slider cache quota exceeded; keeping slider changes in memory")
    }
  }

  const updateHero = async (item: Media, file: File) => {
    setSavingId(item.id)
    setNotice(`Saving ${item.label}...`)
    try {
      let url = ""
      try { url = await uploadBanner(file, item.id) } catch (uploadError) { console.error("[v0] Banner upload failed", uploadError) }
      if (!url) throw new Error("The uploaded media could not be prepared.")
      if (item.kind === "signature") {
        const response = await fetch("/api/site-media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, kind: "signature", label: item.label, url, sort_order: item.sort_order }),
        })
        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          console.warn("[v0] Signature banner API save failed; using local preview", result.error)
          const nextCache = { ...readBannerCache(), [item.id]: url }
          writeBannerCache(nextCache)
          setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url } : entry))
          window.dispatchEvent(new CustomEvent("site-banners-updated", { detail: nextCache }))
          setNotice(`${item.label} saved locally while the shared database is unavailable.`)
          return
        }
        const nextCache = { ...readBannerCache(), [item.id]: url }
        writeBannerCache(nextCache)
        try {
          window.localStorage.setItem("clp-signature-media-cache", JSON.stringify(nextCache))
        } catch (error) {
          if (error instanceof DOMException && error.name === "QuotaExceededError") console.warn("[v0] Signature cache quota exceeded; preview remains in memory")
        }
        window.dispatchEvent(new CustomEvent("site-banners-updated", { detail: nextCache }))
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url } : entry))
        setNotice(`${item.label} saved successfully.`)
        return
      }
      const response = await fetch("/api/site-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, kind: "hero", url }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || "Unable to save banner.")
      }
      const nextCache = { ...readBannerCache(), [item.id]: url }
      writeBannerCache(nextCache)
      window.dispatchEvent(new CustomEvent("site-banners-updated", { detail: nextCache }))
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
        <div><p className="eyebrow">Homepage control</p><h2>Site Media &amp; Banners</h2><p className="admin-muted">Manage homepage media for every visitor through the shared site media database.</p></div>
      </div>
      {notice && <p className="admin-success" role="status">{notice}</p>}
      <div className="media-grid">
        {items.map((item) => <article className="media-card min-w-0 overflow-hidden" key={item.id}>{item.url ? <div className="h-48 max-h-48 w-full max-w-2xl overflow-hidden rounded-md border border-[#75643a] bg-black/20"><img className="h-full max-h-48 w-full max-w-full object-cover" src={item.url} alt={item.label} /></div> : <div className="media-preview-empty h-48 max-h-48 w-full max-w-2xl overflow-hidden rounded-md border border-[#75643a]" aria-label={`${item.label} has no uploaded image`}>No image uploaded</div>}<strong className="block max-w-full truncate">{item.label}</strong><label className="admin-button media-upload-label" aria-disabled={savingId === item.id}>{savingId === item.id ? "Saving..." : "Replace Image"}<input type="file" accept="image/*" hidden disabled={savingId === item.id} onChange={(event) => { const file = event.target.files?.[0]; if (file) void updateHero(item, file); event.currentTarget.value = "" }} /></label></article>)}
      </div>
      <section className="slider-manager">
        <div className="admin-toolbar"><div><p className="eyebrow">Homepage Slider Banners</p><h3>Upload New Banner Images</h3><p className="admin-muted">Promotional banners autoplay every 3 seconds on the storefront.</p></div><label className="admin-button media-upload-label">Choose Multiple Images<input type="file" accept="image/*" multiple hidden onChange={(event) => { const files = Array.from(event.target.files || []); if (!files.length) return; const added = files.map((file, index): Media => ({ id: `slider-${Date.now()}-${index}`, kind: "slider", label: file.name, url: URL.createObjectURL(file), sort_order: sliderItems.length + index })); persistSliders([...sliderItems, ...added]); setNotice(`${added.length} banner${added.length === 1 ? "" : "s"} added locally.`); event.currentTarget.value = "" }} /></label></div>
        <div className="slider-items">{sliderItems.map((item, index) => <article className="slider-item min-w-0 overflow-hidden" key={item.id}><img className="h-24 max-h-24 w-24 max-w-24 shrink-0 rounded-md object-cover" src={item.url} alt={item.label} /><strong>{item.label}</strong><button type="button" onClick={() => persistSliders(sliderItems.filter((entry) => entry.id !== item.id))}>Delete</button><button type="button" disabled={index === 0} onClick={() => { const next = [...sliderItems]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; persistSliders(next) }}>↑</button><button type="button" disabled={index === sliderItems.length - 1} onClick={() => { const next = [...sliderItems]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; persistSliders(next) }}>↓</button></article>)}</div>
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
