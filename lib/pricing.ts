export function saleDetails(product: { priceInr: number; regularPriceInr?: number; salePriceInr?: number }) {
  const regular = product.regularPriceInr ?? product.priceInr
  const sale = product.salePriceInr ?? product.priceInr
  const discounted = regular > sale && sale > 0
  return { regular, sale, discounted, percentOff: discounted ? Math.round(((regular - sale) / regular) * 100) : 0, savings: discounted ? regular - sale : 0 }
}
