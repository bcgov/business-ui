<script setup lang="ts">
const { t } = useI18n()
const accountStore = useConnectAccountStore()
const config = useRuntimeConfig().public
const { isAuthenticated } = useKeycloak()
const route = useRoute()
const { validateAccountStatus } = useAccountValidation()

// Create a computed property to determine if we should show staff dashboard text based on authorization
const showStaffText = computed(() => {
  return IsAuthorized(AuthorizedActions.STAFF_DASHBOARD) &&
         (!route.params.orgId || route.params.orgId === accountStore.currentAccount.id.toString())
})

// Show staff breadcrumbs if user is authorized
const showStaffBreadcrumb = computed(() => {
  return IsAuthorized(AuthorizedActions.STAFF_BREADCRUMBS)
})

useHead({
  title: showStaffText.value ? t('page.home.titleStaff') : t('page.home.title')
})

// Make breadcrumbs reactive to showStaffText changes
watchEffect(() => {
  setBreadcrumbs([
    {
      to: showStaffBreadcrumb.value
        ? `${config.authWebUrl}/staff/dashboard/active`
        : `${config.registryHomeURL}dashboard?accountid=${accountStore.currentAccount.id}`,
      label: showStaffBreadcrumb.value ? t('labels.bcRegStaffDashboard') : t('labels.bcRegDashboard')
    },
    { label: showStaffText.value ? t('page.home.h1Staff') : t('page.home.h1') }
  ])
})

// Watch for changes to the orgId route parameter
watch(() => route.params.orgId, (orgId) => {
  // Only proceed if we have an orgId and it exists in the user's account list
  if (orgId &&
      accountStore.userAccounts.find(account => account.id.toString() === orgId)) {
    // Find the account that matches the orgId
    const targetAccount = accountStore.userAccounts.find(
      account => account.id.toString() === orgId
    )
    // If matching account found, update the current account
    if (targetAccount) {
      accountStore.currentAccount = targetAccount
    }
  }
}, { immediate: true }) // immediate: true ensures this runs on initial page load

// Watch for changes to the current account and update the URL if needed
watch(() => accountStore.currentAccount.id, (newAccountId) => {
  // Only update URL if the account ID changed and doesn't match the current route's orgId parameter
  if (newAccountId && newAccountId.toString() !== route.params.orgId) {
    // Navigate to the account's URL, preserving the same page structure
    navigateTo(`/account/${newAccountId}`, { replace: true })
  }
})

onMounted(async () => {
  // Redirect unauthenticated users to login page with current URL as redirect target
  if (!isAuthenticated.value) {
    const registryHomeURL = config.registryHomeURL
    const redirectUrl = encodeURIComponent(window.location.href)
    window.location.href = `${registryHomeURL}/login/?return=${redirectUrl}`
  }
  // Redirect inactive accounts to the account settings page
  // This ensures users can't access the dashboard until their account is activated
  // We check for valid IDs (>= 0) to ensure we only redirect accounts that exist in the system
  if (accountStore.currentAccount &&
      +accountStore.currentAccount.id >= 0 &&
      accountStore.currentAccount.accountStatus !== AccountStatus.ACTIVE) {
    const accountId = accountStore.currentAccount.id
    window.location.href = `${config.authWebUrl}/account/${accountId}/settings/account-info`
  }

  // Validate account status and handle the scenarios of incomplete account setups
  // show modal if account is not complete
  await validateAccountStatus()
})
</script>
<template>
  <div class="mx-auto flex flex-col gap-4 px-2 py-8 sm:px-4 sm:py-10">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 md:flex-row md:justify-between">
        <div class="flex flex-col gap-4 md:flex-1">
          <h1 class="text-[32px]">
            {{ showStaffText ? t('page.home.h1Staff') : t('page.home.h1') }}
          </h1>

          <p class="text-gray-700">
            {{ $t('page.home.intro') }}
          </p>
        </div>
        <ClientOnly>
          <div v-if="accountStore.currentAccount.id" class="flex-none">
            <UTooltip
              :text="$t('btn.busGetStarted.tooltip')"
              :popper="{ arrow: true }"
            >
              <UButton
                :label="$t('btn.busGetStarted.label')"
                variant="outline"
                icon="i-mdi-domain"
                size="bcGov"
                class="w-full"
                :to="`${config.nrURL}${(IsAuthorized(AuthorizedActions.STAFF_DASHBOARD) && route.params.orgId)
                  ? route.params.orgId
                  : accountStore.currentAccount.id.toString()}`"
              />
            </UTooltip>
          </div>
        </ClientOnly>
      </div>
      <HelpTextSection />
    </div>

    <slot /> <!-- This is where the page content will be injected -->
    <UModals />
    <UNotifications />
  </div>
</template>
