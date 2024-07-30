export async function handlePaymentRedirect (payToken: number, filingId: number): Promise<void> {
  const config = useRuntimeConfig()
  const { $i18n } = useNuxtApp()
  const paymentUrl = config.public.paymentPortalUrl
  const baseUrl = config.public.baseUrl
  const returnUrl = encodeURIComponent(`${baseUrl}${$i18n.locale.value}/submitted?filing_id=${filingId}`)
  const payUrl = paymentUrl + payToken + '/' + returnUrl

  await navigateTo(payUrl, { external: true })
}
