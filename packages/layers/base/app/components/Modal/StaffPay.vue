<script setup lang="ts">
import * as z from 'zod'

const props = defineProps<{
  onSubmit: () => Promise<void>
  showPriority?: boolean
}>()

defineEmits<{ close: [], submit: [] }>()

const { t } = useI18n()
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const title = t('label.staffPayment')

const emptySchema = z.object<Partial<StaffPayment>>({})

const { staffPayment } = storeToRefs(useStaffPaymentStore())

const loading = ref(false)
const submit = async () => {
  loading.value = true
  await props.onSubmit()
  loading.value = false
}
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
        <UForm
          :schema="emptySchema"
          :state="staffPayment"
          @submit="submit"
        >
          <StaffPayment v-model="staffPayment" :show-priority />
          <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
            <UButton
              :block="isSmallScreen"
              :disabled="loading"
              :label="$t('label.cancel')"
              size="xl"
              variant="outline"
              @click="$emit('close')"
            />
            <UButton
              :block="isSmallScreen"
              :disabled="loading"
              :label="$t('label.continueToPayment')"
              :loading
              size="xl"
              type="submit"
            />
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>
