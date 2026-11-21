<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'

// a delivery address must be a physical location by default - pass noPoBox: false to allow a PO Box (e.g. liquidators)
const props = withDefaults(defineProps<{
  nested?: boolean
  name?: string
} & AddressFormProps>(), {
  noPoBox: true
})

defineEmits<{
  'cancel': []
  'should-validate': []
}>()

const schema = getAddressWithIdSchema({ bcCanadaOnly: props.bcCanadaOnly, noPoBox: props.noPoBox })

const model = defineModel<AddressWithIdSchema>({ required: true })

// with disabled inputs the schema runs through `validate` instead, so their errors can be dropped
const validateEditableFields = (state: unknown) => getEditableAddressErrors(schema, state, props.disabledFields)

const formRef = useTemplateRef<Form<AddressWithIdSchema>>('address-form')
const deliverySectionRef = useTemplateRef<HTMLElement>('delivery-section')

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

function copyMailingToDelivery() {
  const id = model.value.deliveryAddress.id
  model.value.deliveryAddress = { ...model.value.mailingAddress, id }
}

// while 'same as' is checked the delivery address mirrors the mailing address - keep it in sync on mailing edits
// (getter source so a parent replacing the mailing address object is still tracked). The country / region are
// selects, so their rule errors (e.g. delivery must be in BC) are checked on every change; the street is typed,
// so its PO Box check waits for the mailing inputs to lose focus (see onMailingFocusOut)
watch(
  () => model.value.mailingAddress,
  () => {
    if (model.value.sameAs) {
      copyMailingToDelivery()
      validateFilledFields(['country', 'region'])
    }
  },
  { deep: true }
)

function onMailingFocusOut() {
  if (model.value.sameAs) {
    validateFilledFields()
  }
}

// sync mailing address with delivery address on 'same as' checkbox click
watch(
  () => model.value.sameAs,
  (v) => {
    if (v) {
      copyMailingToDelivery()
      // errors raised before the copy (e.g. validateOnOpen) would otherwise keep the fieldset flagged
      formRef.value?.clear(/deliveryAddress/)
      validateFilledFields()
    }
  }
)

// surfaces the rule errors (must be in BC, no PO Box) while 'same as' is checked, instead of waiting for submit.
// Only the fields with a value are validated, so empty required fields are not flagged early. `fields` limits the
// check to those address fields (e.g. ['region'])
function validateFilledFields(fields?: string[]) {
  const filled = getEditableAddressErrors(schema, model.value, props.disabledFields).filter((error) => {
    const [address, field] = error.name.split('.') as ['mailingAddress' | 'deliveryAddress', string]
    return (!fields || fields.includes(field))
      && !!(model.value[address] as Record<string, unknown> | undefined)?.[field]
  })
  const applyErrors = () => {
    if (!formRef.value) {
      return
    }
    // while 'same as' is checked the delivery address is a hidden copy of the mailing address, so its errors are
    // rebuilt from scratch on every check. Otherwise an old one (e.g. 'must be in BC' after the mailing province
    // is back in BC) would linger, read as a delivery-only error and uncheck 'same as'
    const names = new Set(filled.map(error => error.name))
    const others = formRef.value.getErrors()
      .filter(error => !error.name || (!error.name.startsWith('deliveryAddress.') && !names.has(error.name)))
    formRef.value.setErrors([...others, ...filled])
  }
  if (model.value.sameAs && containsDeliveryOnlyError(filled)) {
    // setErrors drops the errors of unmounted inputs - show the delivery inputs first, then set the errors
    copyMailingToDelivery()
    model.value.sameAs = false
    nextTick(() => {
      applyErrors()
      focusFirstDeliveryError()
    })
  } else {
    applyErrors()
  }
}

// a delivery error the mailing address does not share (same field, same message) - e.g. a PO Box street,
// which only the delivery address forbids
function getDeliveryOnlyErrors<T extends { name?: string, message: string }>(errors: T[]) {
  const mailing = new Set(errors
    .filter(e => e.name?.startsWith('mailingAddress.'))
    .map(e => `${e.name!.slice('mailingAddress.'.length)}|${e.message}`))
  return errors.filter(e => e.name?.startsWith('deliveryAddress.')
    && !mailing.has(`${e.name.slice('deliveryAddress.'.length)}|${e.message}`))
}

function containsDeliveryOnlyError(errors: { name?: string, message: string }[]) {
  return getDeliveryOnlyErrors(errors).length > 0
}

// the mailing address cannot be used as the delivery address (e.g. it is a PO Box) - checks the delivery rules
// against the mailing address. Only the filled mailing fields count, so an unfinished mailing address
// (e.g. no province yet) does not block 'same as'
const sameAsUnavailable = computed(() => {
  const mailingAddress = model.value.mailingAddress as Record<string, unknown>
  const state = {
    ...model.value,
    sameAs: true,
    deliveryAddress: { ...model.value.mailingAddress, id: model.value.deliveryAddress.id }
  }
  const errors = getEditableAddressErrors(schema, state, props.disabledFields)
  return getDeliveryOnlyErrors(errors)
    .some(e => !!mailingAddress[e.name.slice('deliveryAddress.'.length)])
})

// after 'same as' is unchecked automatically, take the user to the delivery error they need to fix: scroll the
// first invalid delivery input into view and focus it. Waits a tick for the delivery inputs to render with the errors
async function focusFirstDeliveryError() {
  await nextTick()
  const input = deliverySectionRef.value?.querySelector<HTMLElement>('[aria-invalid="true"]')
  if (input) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    input.focus({ preventScroll: true })
  }
}

// covers submit, where the form sets every error itself
const hasDeliveryOnlyError = computed(() => containsDeliveryOnlyError(formRef.value?.getErrors() ?? []))

// the delivery inputs are hidden while 'same as' is checked - on a delivery-only error uncheck it so the delivery
// inputs show, prefilled with the mailing address, with the error. Errors both addresses share stay on the mailing
// inputs with 'same as' left checked, since fixing the mailing address fixes both
watch(
  hasDeliveryOnlyError,
  (deliveryOnly) => {
    if (deliveryOnly && model.value.sameAs) {
      copyMailingToDelivery()
      model.value.sameAs = false
      focusFirstDeliveryError()
    }
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
      <div @focusout="onMailingFocusOut">
        <ConnectFormAddress
          id="mailing-address"
          v-model="model.mailingAddress"
          schema-prefix="mailingAddress"
          :disabled-fields="disabledFields?.mailingAddress"
          @should-validate="formRef?.clear(/^mailingAddress.*/)"
        />
      </div>
    </ConnectFieldset>
    <USeparator class="padding-x-default" />
    <!-- the 'same as' checkbox leads the delivery section - the delivery inputs only show while it is unchecked -->
    <ConnectFieldset
      :label="$t('label.deliveryAddress')"
      :error="formErrors?.delivery"
      padding-class="xy-default"
    >
      <div ref="delivery-section" class="flex flex-col gap-6">
        <!-- greyed out while the mailing address cannot be the delivery address - never while checked, so it can
          still be unchecked (a checked box with a delivery-only error unchecks itself) -->
        <UCheckbox
          v-if="!hideSameAs"
          v-model="model.sameAs"
          :label="$t('label.deliveryAddressSameAsMailing')"
          :disabled="!model.sameAs && sameAsUnavailable"
        />
        <ConnectFormAddress
          v-if="hideSameAs || !model.sameAs"
          id="delivery-address"
          v-model="model.deliveryAddress"
          schema-prefix="deliveryAddress"
          :street-help-text="noPoBox ? 'no-po' : 'none'"
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
.read-only-fields :deep(:is(input, textarea, [role='combobox']):disabled) {
  box-shadow: none;
  /* the select trigger keeps box-shadow via the layered `ring-0!`, so clear the underline through its variable */
  --tw-shadow: 0 0 #0000;
  border-radius: 0.25rem;
  opacity: 1;
}
</style>
