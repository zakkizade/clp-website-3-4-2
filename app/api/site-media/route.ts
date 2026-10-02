import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type MediaPayload = {
  id?: string
  kind?: "hero" | "signature"
  label?: string
  url?: string
  sort_order?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MediaPayload
    if (!body.id || !body.url || !/^https?:\/\/|^data:image\//i.test(body.url)) {
      return NextResponse.json({ error: "A valid banner image URL is required." }, { status: 400 })
    }

    if (body.kind === "signature") {
      const { error } = await supabase.from("site_media").upsert({
        id: body.id,
        kind: "signature",
        label: body.label || body.id,
        url: body.url,
        sort_order: Number(body.sort_order || 0),
      }, { onConflict: "id" })
      if (error) return NextResponse.json({ error: error.message }, { status: 502 })
    } else {
      const type = body.id === "heroBannerDark" ? "hero_dark" : "hero_light"
      const { error } = await supabase.from("banners").upsert({ type, image_url: body.url }, { onConflict: "type" })
      if (error) return NextResponse.json({ error: error.message }, { status: 502 })
    }

    return NextResponse.json({ ok: true, id: body.id, url: body.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save banner."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [signatures, heroes] = await Promise.all([
      supabase.from("site_media").select("id,kind,label,url,sort_order").eq("kind", "signature").order("sort_order"),
      supabase.from("banners").select("type,image_url"),
    ])
    if (signatures.error) throw signatures.error
    if (heroes.error) throw heroes.error
    return NextResponse.json({ signatures: signatures.data || [], heroes: heroes.data || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load saved banners."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

export const dynamic = "force-dynamic"
