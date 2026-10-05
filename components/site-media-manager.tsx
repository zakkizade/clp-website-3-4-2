"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Media = { id: string; kind: "hero" | "signature" | "slider"; label: string; url: string; sort_order: number }
type SiteMediaRow = { id: string; type: string; url: string }

const signatureDefaults = [
  ["loose_gemstones", "Loose Gemstones"],
  ["fine_gold", "Fine Gold Jewelry"],
  ["jaipur_silver", "Jaipur Silver"],
  ["custom_craft", "Custom Craft"],
] as const

const MEDIA_BUCKET = "site-banners"

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
    return { blob }
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

async function uploadBanner(file: File, id: string) {
  const compressed = await compressImage(file)
  const path = `banners/${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
  const upload = await supabase.storage.from(MEDIA_BUCKET).upload(path, compressed.blob, { upsert: true, contentType: "image/webp" })
  if (upload.error) throw new Error(`Storage upload failed: ${upload.error.message}`)
  const publicUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
  if (!publicUrl) throw new Error("Supabase did not return a banner URL.")
  return publicUrl
}

export function SiteMediaManager() {
  const [items, setItems] = useState<Media[]>([
    { id: "hero_light", kind: "hero", label: "Hero Banner (Light Mode)", url: "", sort_order: -2 },
    { id: "hero_dark", kind: "hero", label: "Hero Banner (Dark Mode)", url: "", sort_order: -1 },
    ...signatureDefaults.map(([id, label], index) => ({ id, kind: "signature" as const, label, url: "", sort_order: index })),
  ])
  const [sliderItems, setSliderItems] = useState<Media[]>([])
  const [notice, setNotice] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const loadMedia = async () => {
      try {
        const { data, error } = await supabase
          .from("site_media")
          .select("id,type,url")
        if (error) throw error
        if (active && data?.length) {
          const rows = data as SiteMediaRow[]
          setItems((current) => current.map((item) => {
            const remote = rows.find((row) => row.id === item.id)
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
  }

  const updateHero = async (item: Media, file: File) => {
    setSavingId(item.id)
    setNotice(`Saving ${item.label}...`)
    try {
      const url = await uploadBanner(file, item.id)

      const { data, error: saveError } = await supabase.from("site_media").upsert({
        id: item.id,
        type: "banner",
        url,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" }).select()
      if (saveError) {
        console.error("[v0] site_media upsert failed", saveError)
        throw new Error(`DB upsert failed: ${saveError.message}`)
      }
      if (!data) throw new Error("DB upsert failed: Supabase returned no saved row.")
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, url } : entry))
      window.dispatchEvent(new CustomEvent("site-banners-updated", { detail: { [item.id]: url } }))
      setNotice(`${item.label} saved successfully.`)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to save banner."
      console.error("[v0] Banner save failed", reason)
      setNotice(`Error: ${message}`)
    } finally { setSavingId(null) }
  }

  return (
    <section className="site-media-manager">
      <div className="admin-toolbar">
        <div><p className="eyebrow">Homepage control</p><h2>Site Media &amp; Banners</h2><p className="admin-muted">Manage homepage media for every visitor through the shared site media database.</p></div>
      </div>
      {notice && <p className={notice.startsWith("Error:") ? "admin-error" : "admin-success"} role="status" aria-live="polite">{notice}</p>}
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

export async function getSiteMedia(_kind?: "hero" | "signature" | "slider") {
  const { data, error } = await supabase.from("site_media").select("id,type,url,updated_at").order("updated_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map((row) => ({
    id: row.id,
    kind: row.id.startsWith("hero") ? "hero" : "signature",
    label: row.id,
    url: row.url,
    sort_order: 0,
  })) as Media[]
}

export type { Media }
