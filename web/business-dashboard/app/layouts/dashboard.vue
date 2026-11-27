<script setup lang="ts">
const accountStore = useConnectAccountStore()
</script>

<template>
  <ConnectLayout>
    <template #header>
      <ConnectHeaderAuth />
    </template>
    <template #breadcrumb>
      <ConnectBreadcrumb
        :account-id="accountStore.currentAccount.id ? String(accountStore.currentAccount.id) : undefined"
      />
    </template>
    <template #bottomHeaders>
      <ConnectTombstone />
    </template>
    <slot />
  </ConnectLayout>
</template>
