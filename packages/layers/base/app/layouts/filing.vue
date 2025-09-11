<script setup lang="ts">
const accountStore = useConnectAccountStore()
</script>

<template>
  <div
    class="app-container"
    data-testid="filing-layout"
  >
    <ConnectHeaderAuth />
    <ConnectSystemBanner />
    <ConnectBreadcrumb
      :account-id="accountStore.currentAccount.id
        ? String(accountStore.currentAccount.id)
        : undefined"
    />
    <ConnectTombstone state-key="business-filing-tombstone" data-testid="business-filing-tombstone" />
    <main class="app-body px-2 sm:px-4">
      <div class="flex flex-col lg:flex-row lg:gap-6 grow app-inner-container">
        <div class="grow max-w-full overflow-hidden">
          <slot />
        </div>

        <div class="shrink-0 lg:w-[300px] lg:static sticky lg:mt-10">
          <ConnectFeeWidget class="sticky lg:top-10" />
        </div>
      </div>
    </main>
    <ConnectButtonControlWrapper data-testid="business-filing-button-control" />
    <ConnectFooter />
  </div>
</template>
