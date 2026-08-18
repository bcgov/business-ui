<script setup lang="ts">
// Chrome for pages scoped to a single business (e.g. View Access). Unlike the dashboard layout this
// renders no heading, intro or breadcrumbs of its own -- the page owns those, since each business
// page has its own title and breadcrumb trail.
const config = useRuntimeConfig().public
const accountStore = useConnectAccountStore()
const { isAuthenticated } = useKeycloak()
const { validateAccountStatus } = useAccountValidation()

onMounted(async () => {
  // Redirect unauthenticated users to login page with current URL as redirect target
  if (!isAuthenticated.value) {
    const registryHomeURL = config.registryHomeURL
    const redirectUrl = encodeURIComponent(window.location.href)
    window.location.href = `${registryHomeURL}/login/?return=${redirectUrl}`
    return
  }
  // Redirect inactive accounts to the account settings page
  if (accountStore.currentAccount &&
      +accountStore.currentAccount.id >= 0 &&
      accountStore.currentAccount.accountStatus !== AccountStatus.ACTIVE) {
    window.location.href = `${config.authWebUrl}/account/${accountStore.currentAccount.id}/settings/account-info`
    return
  }

  await validateAccountStatus()
})
</script>

<template>
  <!-- w-full, not mx-auto: the parent is a column flex container, where auto margins stop the
       item stretching and shrink it to its content width instead. -->
  <div class="flex w-full flex-col gap-4 px-2 py-8 sm:px-4 sm:py-10">
    <slot />

    <UNotifications />
  </div>
</template>
