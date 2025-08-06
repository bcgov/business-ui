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
 * Gets the current user's membership information for the specified organization.
 * Makes an API call to /users/orgs/{orgId}/membership endpoint.
 *
 * @param {number | string} orgId - The organization ID to check.
 * @returns {Promise<Member | null>} The membership information or null if not found/error.
 */
export async function getUserMembership (orgId: number | string): Promise<Member | null> {
  try {
    const { $authApiBRD } = useNuxtApp()
    const membership = await $authApiBRD<Member>(`/users/orgs/${orgId}/membership`)

    return membership
  } catch (error) {
    console.error(`Failed to get membership for org ${orgId}:`, error)
    return null
  }
}

/**
 * Adds a product subscription for the current user to the specified organization.
 * Makes a POST call to /users/orgs/{orgId}/products endpoint.
 *
 * @param {number | string} orgId - The organization ID to add the product to.
 * @param {OrgProductsRequestBody} payload - The request payload containing product subscription details.
 * @returns {Promise<boolean>} True if the product was added successfully, false otherwise.
 */
export async function addUserProductSubscription (orgId: number | string, payload: OrgProductsRequestBody): Promise<boolean> {
  try {
    const { $authApiBRD } = useNuxtApp()
    await $authApiBRD(`/orgs/${orgId}/products`, {
      method: 'POST',
      body: payload
    })

    return true
  } catch (error) {
    console.error(`Failed to add product subscription for org ${orgId}:`, error)
    return false
  }
}

/**
 * Adds the Business Registry Dashboard product subscription for the current user.
 * Convenience function that calls addUserProductSubscription with the BUSINESS product code.
 *
 * @param {number | string} orgId - The organization ID to add the product to.
 * @returns {Promise<boolean>} True if the product was added successfully, false otherwise.
 */
export async function addBusinessRegistryDashboardSubscription (orgId: number | string): Promise<boolean> {
  const payload: OrgProductsRequestBody = {
    subscriptions: [{ productCode: 'BUSINESS' }]
  }

  return await addUserProductSubscription(orgId, payload)
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
    const { $authApiBRD } = useNuxtApp()
    const products = await $authApiBRD<string>(`/orgs/${orgId}/products`)
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
