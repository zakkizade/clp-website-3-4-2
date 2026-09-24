export function saleDetails(product: { priceInr: number; regularPriceInr?: number; salePriceInr?: number; discountPercent?: number }) {
  const regular = product.regularPriceInr ?? product.priceInr
  const sale = product.salePriceInr ?? product.priceInr
  const discounted = regular > sale && sale > 0
  return { regular, sale, discounted, percentOff: product.discountPercent ?? (discounted ? Math.round(((regular - sale) / regular) * 100) : 0), savings: discounted ? regular - sale : 0 }
}
