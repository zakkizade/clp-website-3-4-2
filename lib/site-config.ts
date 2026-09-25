export type Announcement = { text: string; href: string }
export type ActiveOffer = { type: "percentage" | "fixed"; value: number; start: string; end: string; noEnd: boolean; requirement: string; minimum: number; code: string }

let announcement: Announcement = { text: "Complimentary insured shipping on every CLP Jewels order", href: "#collection" }
let activeOffer: ActiveOffer | null = null
const listeners = new Set<() => void>()

export function getAnnouncement() { return announcement }
export function setAnnouncement(next: Announcement) { announcement = next; listeners.forEach((listener) => listener()) }
export function getActiveOffer() { return activeOffer }
export function setActiveOffer(next: ActiveOffer | null) { activeOffer = next; listeners.forEach((listener) => listener()) }
export function subscribeSiteConfig(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } }

export function offerIsActive(offer: ActiveOffer | null, now = new Date()) {
  if (!offer) return false
  const startOk = !offer.start || new Date(offer.start) <= now
  const endOk = offer.noEnd || !offer.end || new Date(`${offer.end}T23:59:59`) >= now
  return startOk && endOk && offer.value > 0
}

export function offerLabel(offer: ActiveOffer) { return offer.type === "percentage" ? `${offer.value}% OFF` : `₹${offer.value.toLocaleString("en-IN")} OFF` }
