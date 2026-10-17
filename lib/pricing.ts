export type MetalPricingProduct = { priceInr: number; regularPriceInr?: number; salePriceInr?: number; discountPercent?: number; metalOptions?: { gold?: number; silver?: number; goldPurities?: { "14K"?: number; "18K"?: number; "22K"?: number } } }

export function saleDetails(product: { priceInr: number; regularPriceInr?: number; salePriceInr?: number; discountPercent?: number; showSaleBadge?: boolean }) {
  const regular = product.regularPriceInr ?? product.priceInr
  const sale = product.salePriceInr && product.salePriceInr > 0 && product.salePriceInr < regular
    ? product.salePriceInr
    : product.discountPercent && product.discountPercent > 0 && product.discountPercent < 100
      ? Math.round(regular * (1 - product.discountPercent / 100))
      : product.priceInr
  const discounted = regular > sale && sale > 0
  return { regular, sale: discounted ? sale : regular, discounted, percentOff: discounted ? (product.discountPercent && product.discountPercent > 0 ? product.discountPercent : Math.round(((regular - sale) / regular) * 100)) : 0, savings: discounted ? regular - sale : 0 }
}

export function metalPriceDetails(product: MetalPricingProduct, metal: "Gold" | "Silver", purity: "14K" | "18K" | "22K") {
  const base = metal === "Silver" ? Number(product.metalOptions?.silver || 0) : Number(product.metalOptions?.goldPurities?.[purity] || product.metalOptions?.gold || 0)
  const productSale = saleDetails(product)
  const activeBase = base > 0 ? base : productSale.sale
  const ratio = productSale.regular > 0 && productSale.sale > 0 && productSale.sale < productSale.regular ? productSale.sale / productSale.regular : Number(product.discountPercent || 0) > 0 ? 1 - Number(product.discountPercent) / 100 : 1
  const original = activeBase
  const sale = ratio < 1 && activeBase >= productSale.regular ? Math.round(activeBase * ratio) : activeBase
  const discounted = sale > 0 && original > sale
  return { original, sale, discounted, percentOff: discounted ? Math.round((1 - sale / original) * 100) : 0 }
}
