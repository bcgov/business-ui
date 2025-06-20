/**
 * Checks if the given account ID matches the ID of the current account in the store.
 *
 * @param {number} accountId - The account ID to check.
 * @returns {boolean} True if the given account ID matches the current account ID, false otherwise.
 */
export const isCurrentOrganization = (accountId: number) => {
  const accountStore = useConnectAccountStore()
  return accountId === Number(accountStore.currentAccount.id)
}

/**
 * Checks if the organization has an active subscription to the business registry dashboard.
 * Makes an API call to check the organization's products and looks for the "BUSINESS" product
 * with "ACTIVE" subscription status.
 *
 * @param {number | string} orgId - The organization ID to check.
 * @returns {Promise<boolean>} True if the organization has an active BRD subscription, false otherwise.
 */
export async function hasActiveBusinessRegistryDashboardSubscription (orgId: number | string): Promise<boolean> {
  try {
    const { $authApi } = useNuxtApp()
    const products = await $authApi<string>(`/orgs/${orgId}/products`)
    const parsedProducts = JSON.parse(products) as OrgProduct[]

    // Code for the Business Registry Dashboard product
    const BUSINESS_PRODUCT_CODE = 'BUSINESS'

    // Find the BUSINESS product (BRD)
    const businessProduct = parsedProducts.find(parsedProduct => parsedProduct.code === BUSINESS_PRODUCT_CODE)

    // If no business product is found, return false
    if (!businessProduct) {
      return false
    }

    // Return true only if subscription status is ACTIVE
    return businessProduct.subscriptionStatus === ProductStatus.ACTIVE
  } catch (error) {
    console.error(`Failed to check business subscription for org ${orgId}:`, error)
    return false
  }
}
