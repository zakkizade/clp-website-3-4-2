export type LocalOrder = {
  id: string
  product_id: string
  product_name: string
  quantity: number
  total_inr: number
  customer_name: string
  customer_phone: string
  address: string
  city: string
  state: string
  pincode: string
  payment_method: "UPI" | "Card" | "COD"
  destination: string
  buyer_notes: string
  dispatch_status: "New" | "Completed" | "Overdue"
  created_at: string
}

const orders: LocalOrder[] = []

export function addLocalOrder(order: LocalOrder) {
  orders.unshift(order)
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("clp:order-created", { detail: order }))
}

export function getLocalOrders() { return orders }

export function orderId() { return `CLP-${Date.now().toString(36).toUpperCase()}` }
export function whatsappOrderUrl(message: string) {
  return `https://wa.me/919828354333?text=${encodeURIComponent(message)}`
}
