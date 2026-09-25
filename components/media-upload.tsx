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
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .84))
    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }) : file
  }

  async function uploadFiles(files: FileList | File[]) {
    const selected = Array.from(files)
    if (!selected.length) return
    setUploading(true)
    setUploadError(null)
    try {
      const client = createClient()
      if (!client) {
        setUploadError("Media uploads are unavailable because Supabase is not configured.")
        return
      }

      const uploaded: string[] = []
      for (const originalFile of selected) {
        const file = await compressImage(originalFile)
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
        const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`
        const result = await client.storage.from("product-images").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        })

        if (result.error) {
          const message = result.error.message.toLowerCase()
          setUploadError(message.includes("bucket not found")
            ? "The product-images storage bucket is not available, so this file was not uploaded."
            : `Upload failed: ${result.error.message}`)
          return
        }

        uploaded.push(client.storage.from("product-images").getPublicUrl(path).data.publicUrl)
      }

      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1))
    } catch (error) {
      const message = error instanceof Error ? error.message : "The media upload could not be completed."
      setUploadError(message.toLowerCase().includes("bucket not found")
        ? "The product-images storage bucket is not available, so this file was not uploaded."
        : message)
    } finally {
      setUploading(false)
    }
  }

  return <div className="space-y-2"><div className="flex items-center justify-between"><label className="text-sm text-[#c8bfa9]">{label}</label>{value.length > 0 && <span className="text-xs text-[#a99562]">{value.length} uploaded</span>}</div>{uploadError && <p role="alert" className="rounded border border-red-400/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">{uploadError}</p>}<button type="button" className={`flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded border border-dashed px-4 py-5 text-center transition-colors ${dragging ? "border-[#d4af37] bg-[#d4af37]/10" : "border-[#75643a] bg-black/20 hover:border-[#d4af37]"}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void uploadFiles(event.dataTransfer.files) }}><input ref={inputRef} hidden type="file" accept={accept} multiple={multiple} onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files); event.currentTarget.value = "" }} />{uploading ? <Loader2 className="animate-spin text-[#d4af37]" size={20} /> : <Upload className="text-[#d4af37]" size={20} />}<span className="text-xs text-[#c8bfa9]">{uploading ? "Uploading…" : "Drop files here or click to browse"}</span></button>{value.length > 0 && <div className="space-y-1">{value.map((url) => <div key={url} className="flex items-center gap-2 rounded bg-black/20 px-2 py-1 text-xs text-[#a39a82]"><span className="min-w-0 flex-1 truncate">{url}</span><button type="button" onClick={() => onChange(value.filter((item) => item !== url))} aria-label={`Remove ${url}`}><X size={14} /></button></div>)}</div>}</div>
}
