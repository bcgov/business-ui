// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf
export function getCurrencyList() {
  return Intl.supportedValuesOf('currency')
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
export function formatCurrency(amount: number, currency: string, maximumDigits: number = 2) {
  const locale = useNuxtApp().$i18n.locale.value
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: maximumDigits
    }).format(amount)
  } catch {
    // will throw an error if an invalid currency was provided
    return amount
  }
}
