/**
 * Composable for handling account validation scenarios
 * This consolidates the logic for checking account status, membership, and subscriptions
 */
export function useAccountValidation () {
  const affStore = useAffiliationsStore()
  const brdModal = useBrdModals()
  const accountStore = useConnectAccountStore()

  /**
   * Validates account status and handles the three scenarios:
   * 1. Admin with complete account but no BC Registries product - auto-add subscription
   * 2. Admin with incomplete account setup - show admin modal
   * 3. Non-admin user with incomplete setup - show non-admin modal
   *
   * @returns Promise<boolean> - true if validation passed and user can proceed, false if modal was shown
   */
  const validateAccountStatus = async (): Promise<boolean> => {
    try {
      // Load membership and subscription status (these methods are idempotent)
      await affStore.loadMembership()
      await affStore.loadSubscriptionStatus()

      // Get current account ID
      const currentAccountId = accountStore.currentAccount.id

      // Scenario 2: Check if user with incomplete account setup
      if(!affStore.membership) {
        brdModal.openAdminAccountSetupIncomplete()
        return false
      }

      // Check if user is an admin and if their membership is active
      const isAdmin = (affStore.membership?.membershipTypeCode === MembershipType.Admin)
      const isMembershipActive = (affStore.membership?.membershipStatus === MembershipStatus.Active)

      // Scenario 1: Admin with complete (active membership) account but no BC Registries product
      if (isAdmin && isMembershipActive && !affStore.isSubscribed) {
        // Automatically add the Business Registry Dashboard product
        await addBusinessRegistryDashboardSubscription(currentAccountId)
        // Reload subscription status after adding the product
        await affStore.loadSubscriptionStatus()
        return true
      }

      // Scenario 2: Admin with inactive membership
      if (isAdmin && !isMembershipActive) {
        brdModal.openAdminAccountSetupIncomplete()
        return false
      }

      // Scenario 3: Non-admin user with either inactive membership or no subscription
      if (!isAdmin && (!isMembershipActive || !affStore.isSubscribed)) {
        brdModal.openNonAdminAccountSetupIncomplete()
        return false
      }

      // All checks passed - user can proceed
      return true
    } catch (error) {
      console.error('Error during account validation:', error)
      // In case of error, show the no subscription modal as fallback
      brdModal.openNoSubscriptionModal()
      return false
    }
  }

  return {
    validateAccountStatus
  }
}
