export type Announcement = { text: string; href: string }
export type ActiveOffer = { type: "percentage" | "fixed"; value: number; start: string; end: string; noEnd: boolean; requirement: string; minimum: number; code: string }

const ANNOUNCEMENT_STORAGE_KEY = "clp-announcement"
const OFFER_STORAGE_KEY = "clp-active-offer"
let announcement: Announcement = { text: "Complimentary insured shipping on every CLP Jewels order", href: "#collection" }
let activeOffer: ActiveOffer | null = null

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

function hydrateSiteConfig() {
  announcement = readStored(ANNOUNCEMENT_STORAGE_KEY, announcement)
  activeOffer = readStored<ActiveOffer | null>(OFFER_STORAGE_KEY, activeOffer)
}

if (typeof window !== "undefined") hydrateSiteConfig()
const listeners = new Set<() => void>()

export function getAnnouncement() { return announcement }
export function setAnnouncement(next: Announcement) { announcement = next; if (typeof window !== "undefined") window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(next)); listeners.forEach((listener) => listener()) }
export function getActiveOffer() { return activeOffer }
export function setActiveOffer(next: ActiveOffer | null) { activeOffer = next; if (typeof window !== "undefined") { if (next) window.localStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify(next)); else window.localStorage.removeItem(OFFER_STORAGE_KEY) }; listeners.forEach((listener) => listener()) }
export function subscribeSiteConfig(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } }

export function offerIsActive(offer: ActiveOffer | null, now = new Date()) {
  if (!offer) return false
  const startOk = !offer.start || new Date(offer.start) <= now
  const endOk = offer.noEnd || !offer.end || new Date(`${offer.end}T23:59:59`) >= now
  return startOk && endOk && offer.value > 0
}

export function offerLabel(offer: ActiveOffer) { return offer.type === "percentage" ? `${offer.value}% OFF` : `₹${offer.value.toLocaleString("en-IN")} OFF` }
