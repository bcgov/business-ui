<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

defineProps<{
  nested?: boolean
}>()

defineEmits<{
  cancel: []
}>()

const addressSchema = getAddressSchema()

const model = defineModel<AddressSchema>({ required: true })

const formRef = useTemplateRef<Form<AddressSchema>>('address-form')

const formErrors = computed<{
  mailing: FormError<string> | undefined
  delivery: FormError<string> | undefined
}>(() => {
  const errors = formRef.value?.getErrors()
  return {
    mailing: errors?.find(e => e.name?.startsWith('mailingAddress')),
    delivery: errors?.find(e => e.name?.startsWith('deliveryAddress'))
  }
})

// reset mailing address if 'sameAsDelivery' is checked and the user makes changes to delivery address
watchDebounced(
  model.value.deliveryAddress,
  () => {
    if (model.value.sameAsDelivery) {
      model.value.mailingAddress = {
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        locationDescription: ''
      }
      model.value.sameAsDelivery = false
    }
  },
  { debounce: 100 }
)

// sync mailing address with delivery address on 'same as' checkbox click
watch(
  () => model.value.sameAsDelivery,
  (v) => {
    if (v) {
      model.value.mailingAddress = { ...model.value.deliveryAddress }
    }
  }
)

// NOTE: Need to expose ref to access form instance in parent
defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="address-form"
    :state="model"
    :schema="addressSchema"
    :nested
    class="flex flex-col gap-6"
  >
    <ConnectFieldset :label="$t('label.deliveryAddress')" :error="formErrors?.delivery">
      <ConnectFormAddress
        id="delivery-address"
        v-model="model.deliveryAddress"
        schema-prefix="deliveryAddress"
        street-help-text="no-po"
        required
        :form-ref="formRef"
      />
    </ConnectFieldset>
    <ConnectFieldset
      :label="$t('label.mailingAddress')"
      :error="formErrors?.mailing"
    >
      <div class="flex flex-col gap-6">
        <UCheckbox
          v-model="model.sameAsDelivery"
          :label="$t('label.sameAsDeliveryAddress')"
        />
        <ConnectFormAddress
          v-if="!model.sameAsDelivery"
          id="mailing-address"
          v-model="model.mailingAddress"
          schema-prefix="mailingAddress"
          street-help-text="allow-po"
          :form-ref="formRef"
        />
      </div>
    </ConnectFieldset>
    <slot v-if="!nested" name="actions">
      <div class="flex gap-6 justify-end">
        <UButton type="submit" :label="$t('label.done')" />
        <UButton
          variant="outline"
          :label="$t('label.cancel')"
          @click="$emit('cancel')"
        />
      </div>
    </slot>
  </UForm>
</template>
