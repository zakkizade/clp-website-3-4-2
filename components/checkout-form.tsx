"use client"

import { FormEvent, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/products"
import { formatPrice } from "@/lib/products"

const fields = [["fullName", "Full Name"], ["email", "Email"], ["phone", "Phone Number"], ["address", "Full Address"], ["city", "City"], ["state", "State"], ["pincode", "Pincode / Zip Code"]] as const
type Shipping = Record<(typeof fields)[number][0], string>

export function CheckoutForm({ product, quantity = 1, onComplete }: { product: Product; quantity?: number; onComplete?: () => void }) {
  const [shipping, setShipping] = useState<Shipping>({ fullName: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" })
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const total = useMemo(() => product.priceInr * quantity, [product.priceInr, quantity])
  const messageText = () => `Hello CLP Jewels, I would like to order:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nTotal: ${formatPrice(total, "INR")}\n\nShipping details:\n${shipping.fullName}\n${shipping.phone}\n${shipping.email}\n${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}${notes ? `\n\nNotes: ${notes}` : ""}`
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const order = { product_id: product.id, product_name: product.name, quantity, total_inr: total, customer_name: shipping.fullName, customer_email: shipping.email, customer_phone: shipping.phone, address: shipping.address, city: shipping.city, state: shipping.state, pincode: shipping.pincode, destination: shipping.state.toLowerCase().includes("india") ? "India" : "International", buyer_notes: notes, dispatch_status: "New" }
    const { error } = await createClient().from("orders").insert(order)
    if (error && error.code !== "42P01") { setMessage(error.message); return }
    setMessage("Order received. We will contact you shortly.")
    window.open(`https://wa.me/919828354333?text=${encodeURIComponent(messageText())}`, "_blank", "noopener,noreferrer")
    onComplete?.()
  }
  return <form className="checkout-form" onSubmit={submit}><div className="checkout-fields">{fields.map(([key, label]) => <label key={key}>{label}<input required type={key === "email" ? "email" : "text"} value={shipping[key]} onChange={(event) => setShipping({ ...shipping, [key]: event.target.value })} /></label>)}</div><label>Buyer notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gift message or delivery notes" /></label><div className="checkout-total"><span>Total</span><strong>{formatPrice(total, "INR")}</strong></div>{message && <p className="admin-success" role="status">{message}</p>}<button className="button button-gold" type="submit">Order via WhatsApp</button><p className="form-caption">Your details are also saved for order notification email setup.</p></form>
}
