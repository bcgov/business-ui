<script setup lang="ts">
const brdModal = useBrdModals()

defineProps<{
  contactEmail: string
}>()
</script>
<template>
  <div class="flex flex-col gap-4 text-left text-bcGovColor-midGray">
    <h2 class="text-xl font-semibold text-bcGovColor-darkGray">
      {{ $t('form.manageBusiness.emailSent.heading') }}
    </h2>
    <p>
      <ConnectI18nBold translation-path="form.manageBusiness.emailSent.p1" :email="contactEmail" />
    </p>
    <p>{{ $t('form.manageBusiness.emailSent.p2') }}</p>
    <div class="flex content-end items-end gap-2">
      <UButton
        :label="$t('btn.close')"
        class="ml-auto flex justify-self-end px-3 py-2"
        @click="brdModal.close()"
      />
    </div>
  </div>
</template>
