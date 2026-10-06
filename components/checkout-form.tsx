"use client"

import { FormEvent, useMemo, useState } from "react"
import type { Product } from "@/lib/products"
import { formatPrice } from "@/lib/products"
import { addLocalOrder, orderId, whatsappOrderUrl } from "@/lib/order-store"
import { purityOptions, sizingForProduct } from "@/lib/sizing"
import { useCurrency } from "@/components/currency-provider"

const fields = [["fullName", "Full Name"], ["phone", "Phone Number"], ["address", "Full Address"], ["city", "City"], ["state", "State"], ["pincode", "Pincode / Zip Code"]] as const
type Shipping = Record<(typeof fields)[number][0], string>

export function CheckoutForm({ product, quantity = 1, onComplete }: { product: Product; quantity?: number; onComplete?: () => void }) {
  const [shipping, setShipping] = useState<Shipping>({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" })
  const [purity, setPurity] = useState(product.goldPurity.replace(" Gold", "") || "18K")
  const [size, setSize] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card">("UPI")
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState("")
  const { currency } = useCurrency()
  const sizing = sizingForProduct(product)
  const total = useMemo(() => product.priceInr * quantity, [product.priceInr, quantity])
  const update = (key: keyof Shipping, value: string) => setShipping((current) => ({ ...current, [key]: value }))
  const messageText = `Hello CLP Jewels, I would like to order:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nTotal: ${formatPrice(total, currency)}\nPurity: ${purity}\n${sizing.label}: ${size}\nPayment preference: ${paymentMethod === "Card" ? "Credit / Debit Card" : "UPI"}\n\nShipping details:\n${shipping.fullName}\n${shipping.phone}\n${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}${notes ? `\n\nNotes: ${notes}` : ""}`
  const submit = (event: FormEvent) => {
    event.preventDefault()
    addLocalOrder({ id: orderId(), product_id: product.id, product_name: product.name, quantity, total_inr: total, customer_name: shipping.fullName, customer_phone: shipping.phone, address: shipping.address, city: shipping.city, state: shipping.state, pincode: shipping.pincode, payment_method: paymentMethod, destination: "India", buyer_notes: `${notes}${notes ? "\n" : ""}Purity: ${purity}; ${sizing.label}: ${size}`, dispatch_status: "New", created_at: new Date().toISOString() })
    setMessage("Order saved in this preview. WhatsApp is ready with your order summary.")
    window.open(whatsappOrderUrl(messageText), "_blank", "noopener,noreferrer")
    onComplete?.()
  }
  return <form className="checkout-form" onSubmit={submit}><div className="checkout-fields">{fields.map(([key, label]) => <label key={key}>{label}<input required type="text" value={shipping[key]} onChange={(event) => update(key, event.target.value)} /></label>)}<label>Gold Purity<select value={purity} onChange={(event) => setPurity(event.target.value)}>{purityOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>{sizing.label}<select required value={size} onChange={(event) => setSize(event.target.value)}><option value="">Select {sizing.label.toLowerCase()}</option>{sizing.options.map((option) => <option key={option}>{option}</option>)}</select></label></div><fieldset className="payment-options"><legend>Payment preference</legend><label><input type="radio" name="payment" checked={paymentMethod === "UPI"} onChange={() => setPaymentMethod("UPI")} /> UPI</label><label><input type="radio" name="payment" checked={paymentMethod === "Card"} onChange={() => setPaymentMethod("Card")} /> Credit / Debit Card</label></fieldset><label>Buyer notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gift message or delivery notes" /></label><div className="checkout-total"><span>Total</span><strong>{formatPrice(total, "INR")}</strong></div>{message && <p className="admin-success" role="status">{message}</p>}<button className="button button-gold" type="submit">Place order via WhatsApp</button><p className="form-caption">No payment details are collected here. Our team will guide you on WhatsApp.</p></form>
}
