"use client"

import { FormEvent, useMemo, useState } from "react"
import type { Product } from "@/lib/products"
import { formatPrice } from "@/lib/products"
import { addLocalOrder, orderId, whatsappOrderUrl } from "@/lib/order-store"
import { purityOptions, sizingForProduct } from "@/lib/sizing"
import { saleDetails } from "@/lib/pricing"
import { useCurrency } from "@/components/currency-provider"

const fields = [["fullName", "Full Name"], ["phone", "Phone Number"], ["address", "Address"], ["city", "City"], ["state", "State"], ["pincode", "Pincode"]] as const
type Shipping = Record<(typeof fields)[number][0], string>
type Payment = "UPI · GPay / PhonePe" | "Credit / Debit Card" | "Netbanking" | "Cash on Delivery"
type CheckoutItem = { product: Product; quantity: number; purity?: string; size?: string }

export function CheckoutForm({ product, quantity = 1, items, initialPurity, initialSize, onComplete, onLocation }: { product?: Product; quantity?: number; items?: CheckoutItem[]; initialPurity?: string; initialSize?: string; onComplete?: () => void; onLocation?: () => void }) {
  const checkoutItems = items?.length ? items : product ? [{ product, quantity }] : []
  const first = checkoutItems[0]?.product
  const [shipping, setShipping] = useState<Shipping>({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "" })
  const [purity, setPurity] = useState(initialPurity || first?.goldPurity.replace(" Gold", "") || "18K")
  const selectedMetal = first?.metal === "Silver" ? "Silver" : "Gold"
  const selectedMetalLabel = selectedMetal === "Silver" ? "925 Sterling Silver" : "Gold"
  const firstHasMetalPricing = Boolean(first?.metalOptions && (typeof first.metalOptions.gold === "number" || typeof first.metalOptions.silver === "number" || first.metalOptions.goldPurities))
  const [size, setSize] = useState(initialSize || "")
  const [paymentMethod, setPaymentMethod] = useState<Payment>("UPI · GPay / PhonePe")
  const [message, setMessage] = useState("")
  const { currency } = useCurrency()
  const sizing = first ? sizingForProduct(first) : null
  const itemPrice = (item: CheckoutItem) => item.product.priceInr > 0 && (item === checkoutItems[0] && firstHasMetalPricing || item.product.metalOptions && (typeof item.product.metalOptions.gold === "number" || typeof item.product.metalOptions.silver === "number" || item.product.metalOptions.goldPurities)) ? item.product.priceInr : saleDetails(item.product).sale
  const total = useMemo(() => checkoutItems.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0), [checkoutItems, firstHasMetalPricing])
  const update = (key: keyof Shipping, value: string) => setShipping((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(shipping).some((value) => !value.trim()) || (first && (!size || (selectedMetal === "Gold" && !purity)))) { setMessage("Please complete your shipping details and product options."); return }
    const id = orderId()
    checkoutItems.forEach(({ product: item, quantity: itemQuantity }) => addLocalOrder({ id, product_id: item.id, product_name: item.name, quantity: itemQuantity, total_inr: itemPrice({ product: item, quantity: itemQuantity }) * itemQuantity, customer_name: shipping.fullName, customer_phone: shipping.phone, address: shipping.address, city: shipping.city, state: shipping.state, pincode: shipping.pincode, payment_method: paymentMethod === "UPI · GPay / PhonePe" ? "UPI" : "Card", destination: "India", buyer_notes: first === item ? `Metal: ${selectedMetalLabel}${selectedMetal === "Gold" ? `; Purity: ${purity}` : ""}; ${sizing?.label}: ${size}` : "", dispatch_status: "New", created_at: new Date().toISOString() }))
    const productLines = checkoutItems.map(({ product: item, quantity: itemQuantity }) => `Product: ${item.name}\nQuantity: ${itemQuantity}\nPrice shown: ${formatPrice(itemPrice({ product: item, quantity: itemQuantity }) * itemQuantity, currency)}${first === item ? `\nMetal: ${selectedMetalLabel}${selectedMetal === "Gold" ? `\nPurity: ${purity}` : ""}\nSize/Length: ${size}` : ""}`).join("\n\n")
    const whatsappText = `Hello CLP Jewels, I would like to place an order.\n\nOrder ID: ${id}\n\n${productLines}\n\nPayment Method: ${paymentMethod}\n\nCustomer: ${shipping.fullName}\nPhone: ${shipping.phone}\nAddress: ${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}`
    window.open(whatsappOrderUrl(whatsappText), "_blank", "noopener,noreferrer")
    onComplete?.()
  }
  return <form className="checkout-form" onSubmit={submit}><div className="checkout-form-heading"><p className="eyebrow gold-text">SECURE CHECKOUT</p><h2>Complete your order.</h2></div>{first && <p className="checkout-product-line">{checkoutItems.length > 1 ? `${checkoutItems.length} pieces` : first.name} · {formatPrice(total, currency)}</p>}<div className="checkout-fields">{fields.map(([key, label]) => <label key={key}>{label}<input required type="text" value={shipping[key]} onChange={(event) => update(key, event.target.value)} /></label>)}{first && <>{selectedMetal === "Gold" ? <label>Gold Purity<select value={purity} onChange={(event) => setPurity(event.target.value)}>{purityOptions.map((option) => <option key={option}>{option}</option>)}</select></label> : <div className="checkout-metal-summary"><span>Metal</span><strong>925 Sterling Silver</strong></div>}<label>{sizing?.label}<select required value={size} onChange={(event) => setSize(event.target.value)}><option value="">Select {sizing?.label.toLowerCase()}</option>{sizing?.options.map((option) => <option key={option}>{option}</option>)}</select></label></>}</div><fieldset className="payment-options"><legend>Payment method</legend>{(["UPI · GPay / PhonePe", "Credit / Debit Card", "Netbanking", "Cash on Delivery"] as Payment[]).map((method) => <label key={method}><input type="radio" name="payment-method" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />{method}</label>)}</fieldset>{message && <p className="payment-note" role="status">{message}</p>}<div className="checkout-total"><span>Total</span><strong>{formatPrice(total, currency)}</strong></div><button className="button button-gold" type="submit">PLACE ORDER →</button><p className="form-caption">You will be redirected to WhatsApp to confirm your order.</p></form>
}

export type { CheckoutItem }
export { fields }
