<script setup lang="ts">
// const { t } = useI18n() // TODO: add translations
const brdModal = useBrdModals()
const toast = useToast()
const affStore = useAffiliationsStore()

const props = defineProps<{
  contactEmail: string
}>()

async function handleClose () {
  toast.add({ title: 'Confirmation email sent, pending authorization.' }) // add success toast
  await affStore.loadAffiliations() // update table with new affilitations
  brdModal.close()
}
</script>
<template>
  <div class="flex flex-col gap-4 text-left text-bcGovColor-midGray">
    <h2 class="text-xl font-semibold text-bcGovColor-darkGray">
      Authorization Email Sent
    </h2>
    <p>{{ `An email was sent to ${props.contactEmail}` }}</p>
    <p>Confirm your access by clicking the link inside. This will add the business to your Business Registry List. The link is valid for 15 minutes.</p>
    <div class="flex justify-center gap-2">
      <UButton
        :label="$t('btn.close')"
        @click="handleClose"
      />
    </div>
  </div>
</template>
