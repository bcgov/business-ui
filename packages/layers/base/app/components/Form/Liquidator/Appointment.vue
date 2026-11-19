<script setup lang="ts">
import type { Form, FormError, RadioGroupItem } from '@nuxt/ui'

const model = defineModel<LiquidatorRoleMeta>({ required: true })

const { t } = useI18n()

const schema = getLiquidatorAppointmentSchema()

// edited locally then written back as a new object, so the parent can store it on the role immutably
const localState = reactive<LiquidatorAppointmentSchema>({
  appointmentMethod: model.value.appointmentMethod,
  courtOrderNumber: model.value.courtOrderNumber ?? ''
})

const formRef = useTemplateRef<Form<LiquidatorAppointmentSchema>>('liquidator-appointment-form')

const formErrors = computed<FormError[] | undefined>(() => formRef.value?.getErrors())

const isCourt = computed(() => localState.appointmentMethod === LiquidatorAppointmentMethod.COURT)

const radioOptions: RadioGroupItem[] = [
  { label: t('label.byTheCompany'), value: LiquidatorAppointmentMethod.COMPANY },
  { label: t('label.byTheCourt'), value: LiquidatorAppointmentMethod.COURT }
]

watch(localState, ({ appointmentMethod, courtOrderNumber }) => {
  // the court order number only applies (and is only sent) when appointed by the court
  const trimmed = courtOrderNumber?.trim()
  model.value = {
    ...model.value,
    appointmentMethod,
    courtOrderNumber: appointmentMethod === LiquidatorAppointmentMethod.COURT && trimmed ? trimmed : undefined
  }
})

function onMethodChange() {
  if (!isCourt.value) {
    localState.courtOrderNumber = ''
  }
  formRef.value?.clear()
}

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="liquidator-appointment-form"
    :schema
    :state="localState"
    data-testid="liquidator-appointment-form"
  >
    <!-- one error bar spans the method and the court order number -->
    <div
      class="padding-xy-default space-y-6"
      :class="{ 'shadow-section-error': formErrors?.length }"
    >
      <ConnectFieldset :label="$t('label.appointedBy')" padding-class="">
        <UFormField name="appointmentMethod">
          <URadioGroup
            id="liquidator-appointment-method"
            v-model="localState.appointmentMethod"
            data-testid="liquidator-appointment-method"
            :items="radioOptions"
            :ui="{ fieldset: 'gap-y-2', label: 'text-base' }"
            @update:model-value="onMethodChange"
          />
        </UFormField>
      </ConnectFieldset>
      <ConnectFormFieldWrapper
        v-if="isCourt"
        :label="$t('label.courtOrderNumber')"
        orientation="horizontal"
        details-aria-hidden
        padding-class=""
      >
        <ConnectFormInput
          v-model="localState.courtOrderNumber"
          input-id="liquidator-court-order-number-input"
          data-testid="liquidator-court-order-number"
          name="courtOrderNumber"
          required
          maxlength="20"
          :label="$t('label.courtOrderNumber')"
        />
      </ConnectFormFieldWrapper>
    </div>
  </UForm>
</template>
