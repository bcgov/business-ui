<script setup lang="ts">
const toast = useToast()
const brdModal = useBrdModals()
const affStore = useAffiliationsStore()
const { t } = useNuxtApp().$i18n

defineProps<{
  email: string
}>()

async function handleClose () {
  await affStore.loadAffiliations()
  toast.add({ title: t('form.manageBusiness.toast.emailSent') }) // add success toast
  brdModal.close()
}
</script>
<template>
  <ModalBase
    :title="$t('form.manageBusiness.emailSent.heading')"
    @modal-closed="handleClose"
  >
    <div class="-mt-6 space-y-4">
      <p> <ConnectI18nHelper translation-path="form.manageBusiness.emailSent.p1" :email /> </p>
      <p> {{ $t('form.manageBusiness.emailSent.p2') }} </p>
      <div class="flex justify-center">
        <UButton
          :label="$t('btn.close')"
          @click="brdModal.close()"
        />
      </div>
    </div>
  </ModalBase>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
