<script setup lang="ts">
const { t } = useI18n()
const brdModal = useBrdModals()
const toast = useToast()
const affStore = useAffiliationsStore()

defineProps<{
  contactEmail: string
}>()

async function handleClose () {
  toast.add({ title: t('form.manageBusiness.toast.emailSent') }) // add success toast
  await affStore.loadAffiliations() // update table with new affilitations
  brdModal.close()
}
</script>
<template>
  <div class="flex flex-col gap-4 text-left text-bcGovColor-midGray">
    <h2 class="text-xl font-semibold text-bcGovColor-darkGray">
      {{ $t('form.manageBusiness.emailSent.heading') }}
    </h2>
    <p>
      <SbcI18nBold translation-path="form.manageBusiness.emailSent.p1" :email="contactEmail" />
    </p>
    <p>{{ $t('form.manageBusiness.emailSent.p2') }}</p>
    <div class="flex justify-center gap-2">
      <UButton
        :label="$t('btn.close')"
        @click="handleClose"
      />
    </div>
  </div>
</template>
