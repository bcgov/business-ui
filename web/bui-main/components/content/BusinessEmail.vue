<script setup lang="ts">
const busStore = useBusinessStore()
const accountStore = useAccountStore()

const displayEmail = computed(() => {
  const mailingAddress = accountStore.currentAccount?.mailingAddress
  if (mailingAddress && mailingAddress.length > 0 && 'email' in mailingAddress[0]) {
    return mailingAddress[0].email
  } else {
    return busStore.currentBusiness?.invitationEmail ?? 'No email found'
  }
})
</script>
<template>
  <ClientOnly>
    <span class="not-prose font-semibold">{{ displayEmail }}</span>
  </ClientOnly>
</template>
