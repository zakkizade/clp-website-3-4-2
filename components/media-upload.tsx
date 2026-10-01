"use client"

import { useRef, useState } from "react"
import { Loader2, Upload, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type MediaUploadProps = {
  label: string
  accept: string
  multiple?: boolean
  value: string[]
  onChange: (urls: string[]) => void
}

export function MediaUpload({ label, accept, multiple = false, value, onChange }: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function compressImage(file: File) {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .84))
    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }) : file
  }

  async function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error ?? new Error("The selected file could not be read."))
      reader.readAsDataURL(file)
    })
  }

  async function uploadFiles(files: FileList | File[]) {
    const selected = Array.from(files)
    if (!selected.length) return
    setUploading(true)
    setUploadError(null)
    try {
      const client = createClient()
      if (!client) throw new Error("Supabase upload client could not be initialized.")
      const uploaded: string[] = []
      for (const originalFile of selected) {
        const file = await compressImage(originalFile)
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
        const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`
        const result = await client.storage.from("products").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        })

        if (result.error) {
          // A storage policy or missing bucket must not block the form. Preserve the
          // selected media as a data URL so the product can still be saved.
          uploaded.push(await fileToDataUrl(file))
          continue
        }

        const publicUrl = client.storage.from("products").getPublicUrl(path).data.publicUrl
        uploaded.push(publicUrl || await fileToDataUrl(file))
      }

      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1))
    } catch (error) {
      const message = error instanceof Error ? error.message : "The media upload could not be completed."
      setUploadError(message.toLowerCase().includes("bucket not found")
        ? "The products-image storage bucket is not available, so this file was not uploaded."
        : message)
    } finally {
      setUploading(false)
    }
  }

  return <div className="min-w-0 max-w-full space-y-2 overflow-hidden"><div className="flex min-w-0 items-center justify-between gap-3"><label className="min-w-0 max-w-full truncate text-sm text-[#c8bfa9]">{label}</label>{value.length > 0 && <span className="shrink-0 text-xs text-[#a99562]">{value.length} uploaded</span>}</div>{uploadError && <p role="alert" className="max-w-full overflow-hidden truncate rounded border border-red-400/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">{uploadError}</p>}<button type="button" className={`flex min-h-24 w-full max-w-full flex-col items-center justify-center gap-2 overflow-hidden rounded border border-dashed px-4 py-5 text-center transition-colors ${dragging ? "border-[#d4af37] bg-[#d4af37]/10" : "border-[#75643a] bg-black/20 hover:border-[#d4af37]"}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void uploadFiles(event.dataTransfer.files) }}><input ref={inputRef} hidden type="file" accept={accept} multiple={multiple} onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files); event.currentTarget.value = "" }} />{uploading ? <Loader2 className="animate-spin text-[#d4af37]" size={20} /> : <Upload className="text-[#d4af37]" size={20} />}<span className="max-w-full truncate text-xs text-[#c8bfa9]">{uploading ? "Uploading…" : "Drop files here or click to browse"}</span></button>{value.length > 0 && <div className="flex max-w-xs max-h-48 flex-wrap gap-2 overflow-auto">{value.map((url, index) => { const isImage = url.startsWith("data:image/") || /\.(avif|gif|jpe?g|png|webp)(\?|$)/i.test(url); return <div key={`${url}-${index}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-[#75643a] bg-black/30"><span className="sr-only">Uploaded media {index + 1}</span>{isImage ? <img src={url} alt={`Uploaded media ${index + 1}`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] uppercase tracking-wide text-[#c8bfa9]">Media</div>}<button type="button" className="absolute right-1 top-1 rounded-full bg-black/75 p-1 text-white transition-colors hover:bg-red-700" onClick={() => onChange(value.filter((item) => item !== url))} aria-label={`Remove uploaded media ${index + 1}`}><X size={12} /></button></div> })}</div>}</div>
}
