import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type MediaPayload = {
  id?: string
  kind?: "hero" | "signature"
  url?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MediaPayload
    if (!body.id || !body.url || !/^https?:\/\/|^data:image\//i.test(body.url)) {
      return NextResponse.json({ error: "A valid banner image URL is required." }, { status: 400 })
    }

    const type = body.kind === "signature"
      ? "banner"
      : body.id === "heroBannerDark" ? "hero_dark" : "hero_light"
    const { error } = await supabase.from("site_media").upsert({
      id: body.id,
      type,
      url: body.url,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
    if (error) return NextResponse.json({ error: error.message }, { status: 502 })

    return NextResponse.json({ ok: true, id: body.id, url: body.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save banner."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  // Media is optional for older deployments. Return a usable empty payload when
  // either optional table is unavailable so the storefront can render its curated
  // image assets instead of turning a media read into a page-level error.
  const { data, error } = await supabase
    .from("site_media")
    .select("id,type,url,updated_at")
    .order("updated_at", { ascending: false })

  return NextResponse.json({
    media: error ? [] : data || [],
    mediaErrors: error ? [error.message] : [],
  })
}

export const dynamic = "force-dynamic"
