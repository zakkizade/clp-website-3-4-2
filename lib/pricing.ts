export function saleDetails(product: { priceInr: number; regularPriceInr?: number; salePriceInr?: number; discountPercent?: number; showSaleBadge?: boolean }) {
  const regular = product.regularPriceInr ?? product.priceInr
  const sale = product.salePriceInr && product.salePriceInr > 0 && product.salePriceInr < regular
    ? product.salePriceInr
    : product.discountPercent && product.discountPercent > 0 && product.discountPercent < 100
      ? Math.round(regular * (1 - product.discountPercent / 100))
      : product.priceInr
  const discounted = product.showSaleBadge === true && regular > sale && sale > 0
  return { regular, sale: discounted ? sale : regular, discounted, percentOff: discounted ? (product.discountPercent && product.discountPercent > 0 ? product.discountPercent : Math.round(((regular - sale) / regular) * 100)) : 0, savings: discounted ? regular - sale : 0 }
}
