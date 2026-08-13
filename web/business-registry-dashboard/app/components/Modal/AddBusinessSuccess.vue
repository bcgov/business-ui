<script setup lang="ts">
const brdModal = useBrdModals()
const affStore = useAffiliationsStore()
const { t } = useNuxtApp().$i18n

const props = defineProps<{
  businessName: string
  identifier: string
}>()

async function handleClosed () {
  // newlyAddedIdentifier makes the reload highlight and scroll to the new row.
  affStore.newlyAddedIdentifier = props.identifier
  await affStore.loadAffiliations()
}
</script>

<template>
  <ModalBase
    :title="t('modal.addBusinessSuccess.title', { name: businessName })"
    :actions="[
      { label: t('btn.ok'), handler: () => brdModal.close() }
    ]"
    @modal-closed="handleClosed"
  >
    <div class="-my-6 space-y-2">
      <p v-for="text in $tm('modal.addBusinessSuccess.description')" :key="text" class="text-bcGovColor-darkGray">
        {{ $rt(text) }}
      </p>
    </div>
  </ModalBase>
</template>

<style scoped>
:deep(.sm\:max-w-lg) {
  max-width: 42rem; /* sm:max-w-2xl */
}
</style>
