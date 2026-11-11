<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

const props = defineProps<{
  nested?: boolean
  name?: string
} & AddressFormProps>()

defineEmits<{
  'cancel': []
  'should-validate': []
}>()

const schema = getAddressWithIdSchema({ bcCanadaOnly: props.bcCanadaOnly, noPoBox: props.noPoBox })

const model = defineModel<AddressWithIdSchema>({ required: true })

// with disabled inputs the schema runs through `validate` instead, so their errors can be dropped
const validateEditableFields = (state: unknown) => getEditableAddressErrors(schema, state, props.disabledFields)

const formRef = useTemplateRef<Form<AddressWithIdSchema>>('address-form')

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

// reset delivery address if 'sameAs' is checked and the user makes changes to mailing address
watchDebounced(
  model.value.mailingAddress,
  () => {
    if (model.value.sameAs) {
      model.value.deliveryAddress = {
        id: model.value.deliveryAddress.id,
        street: '',
        streetAdditional: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
        locationDescription: ''
      }
      model.value.sameAs = false
    }
  },
  { debounce: 100 }
)

// sync mailing address with delivery address on 'same as' checkbox click
watch(
  () => model.value.sameAs,
  (v) => {
    if (v) {
      const id = model.value.deliveryAddress.id
      model.value.deliveryAddress = { ...model.value.mailingAddress, id }
    }
    // clear the delivery errors either way: on check, errors raised before the copy (e.g. validateOnOpen)
    // would otherwise keep the fieldset flagged with nothing left to fix
    formRef.value?.clear(/deliveryAddress/)
  }
)

onMounted(() => {
  if (props.validateOnOpen) {
    // silent: populate the field errors without throwing
    formRef.value?.validate({ silent: true })
  }
})

// NOTE: Need to expose ref to access form instance in parent
defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="address-form"
    :state="model"
    :schema="disabledFields ? undefined : schema"
    :validate="disabledFields ? validateEditableFields : undefined"
    :nested
    :name
    novalidate
    class="flex flex-col"
    :class="{ 'read-only-fields': disabledFields }"
  >
    <ConnectFieldset
      :label="$t('label.mailingAddress')"
      :error="formErrors?.mailing"
      padding-class="xy-default"
    >
      <ConnectFormAddress
        id="mailing-address"
        v-model="model.mailingAddress"
        schema-prefix="mailingAddress"
        :disabled-fields="disabledFields?.mailingAddress"
        @should-validate="formRef?.clear(/^mailingAddress.*/)"
      />
    </ConnectFieldset>
    <USeparator class="padding-x-default" />
    <!-- the 'same as' checkbox leads the delivery section - the delivery inputs only show while it is unchecked -->
    <ConnectFieldset
      :label="$t('label.deliveryAddress')"
      :error="formErrors?.delivery"
      padding-class="xy-default"
    >
      <div class="flex flex-col gap-6">
        <UCheckbox
          v-if="!hideSameAs"
          v-model="model.sameAs"
          :label="$t('label.deliveryAddressSameAsMailing')"
        />
        <ConnectFormAddress
          v-if="hideSameAs || !model.sameAs"
          id="delivery-address"
          v-model="model.deliveryAddress"
          schema-prefix="deliveryAddress"
          street-help-text="no-po"
          required
          :disabled-fields="disabledFields?.deliveryAddress"
          @should-validate="formRef?.clear(/^deliveryAddress.*/)"
        />
      </div>
    </ConnectFieldset>
    <slot v-if="!nested" name="actions">
      <div class="flex gap-6 justify-end padding-xy-default">
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

<style scoped>
/* read only inputs are a flat grey box, without the input underline (UXA) */
.read-only-fields :deep(:is(input, [role='combobox']):disabled) {
  box-shadow: none;
  border-radius: 0.25rem;
  opacity: 1;
}
</style>
