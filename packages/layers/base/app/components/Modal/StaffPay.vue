<script setup lang="ts">
defineProps<{
  onSubmit: () => void
  showPriority?: boolean
}>()

defineEmits<{ close: [], submit: [] }>()

const { t } = useI18n()
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const title = t('label.staffPayment')

const { staffPayment } = storeToRefs(useStaffPaymentStore())
</script>

<template>
  <UModal
    id="staff-payment-modal"
    overlay
    :title
    :description="title"
    dismissible
  >
    <template #content>
      <div class="p-10 space-y-6 overflow-scroll">
        <h2 class="text-2xl font-semibold text-neutral-highlighted">
          {{ title }}
        </h2>
        <UForm :state="staffPayment" @submit="onSubmit">
          <StaffPayment v-model="staffPayment" :show-priority />
          <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
            <UButton
              :block="isSmallScreen"
              :label="$t('label.cancel')"
              size="xl"
              variant="outline"
              @click="$emit('close')"
            />
            <UButton
              :block="isSmallScreen"
              :label="$t('label.continueToPayment')"
              size="xl"
              type="submit"
            />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>
