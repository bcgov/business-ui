<script setup lang="ts">
const props = defineProps<{
  index: number
}>()

const filingStore = usePostRestorationTransitionApplicationStore()
const { directors, editingDirector, modifiedDirectors } = storeToRefs(filingStore)

const deliveryState = ref({})
const mailingState = ref({})
const sameAsMailing = ref(false)
const emit = defineEmits(['done', 'cancel'])

const clearDeliveryAddress = () => {
  if (sameAsMailing.value) {
    editingDirector.value.deliveryAddress = {
      addressCity: '',
      addressCountry: '',
      addressRegion: '',
      addressType: '',
      deliveryInstructions: '',
      postalCode: '',
      streetAddress: '',
      streetAddressAdditional: ''
    }
    setDeliveryState(false)
  }
}

const convertAddress = (address: Address, toState: boolean) => {
  if (typeof address === 'undefined') {
    return {}
  }
  if (toState) {
    return {
      country: address.addressCountry,
      street: address.streetAddress,
      city: address.addressCity,
      region: address.addressRegion,
      postalCode: address.postalCode,
      province: address.addressRegion
    }
  }
  return {
    addressCountry: address.country,
    streetAddress: address.street,
    addressCity: address.city,
    addressRegion: address.region,
    postalCode: address.postalCode,
    addressType: address.addressType,
    deliveryInstructions: address.deliveryInstructions,
    streetAddressAdditional: address.streetAddressAdditional
  }
}

const setDeliveryState = (updateSameAsMailing = true) => {
  deliveryState.value = convertAddress(editingDirector.value?.deliveryAddress, true)
  if (updateSameAsMailing) {
    sameAsMailing.value = JSON.stringify(deliveryState.value) === JSON.stringify(mailingState.value)
  }
}

const setMailingState = () => {
  mailingState.value = convertAddress(editingDirector.value?.mailingAddress, true)
  sameAsMailing.value = JSON.stringify(deliveryState.value) === JSON.stringify(mailingState.value)
}

setDeliveryState()
setMailingState(true)
watch(editingDirector, setDeliveryState)
watch(editingDirector, () => {
  setMailingState(true)
})

editingDirector.value = directors.value[props.index]
const formRef = ref()

const done = () => {
  editingDirector.value.deliveryAddress = convertAddress(deliveryState.value, false)
  editingDirector.value.mailingAddress = convertAddress(mailingState.value, false)
  if (props.index !== -1) {
    directors.value.splice(props.index, 1, editingDirector.value)
  } else {
    directors.value.push(editingDirector.value)
  }
  if (!modifiedDirectors.value.includes(props.index)) {
    modifiedDirectors.value.push(props.index)
  }
  emit('done')
}

const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <div>
    <p class="font-bold text-lg mb-4">
      {{ $t('label.mailingAddress') }}
    </p>
    <FormAddress
      id="mailing-address"
      v-model="mailingState"
      schema-prefix="mailingAddress."
      :form-ref="formRef"
      not-po-box
      :excluded-fields="['streetName', 'streetNumber', 'unitNumber']"
    />

    <p class="font-bold text-lg mb-4">
      {{ $t('label.deliveryAddress') }}
    </p>
    <UFormField
      name="sameAsMailing"
      :model-value="sameAsMailing"
      class="mb-4"
    >
      <UCheckbox
        id="same-as-mailing"
        v-model="sameAsMailing"
        :label="$t('label.sameAsMailingAddress')"
        :ui="{
          label: 'ml-2 text-base'
        }"
        @update:model-value="clearDeliveryAddress"
      />
    </UFormField>
    <FormAddress
      v-if="!sameAsMailing"
      id="delivery-address"
      v-model="deliveryState"
      schema-prefix="deliveryAddress."
      :form-ref="formRef"
      not-po-box
      :excluded-fields="['streetName', 'streetNumber', 'unitNumber']"
    />

    <div class="flex justify-end space-x-4">
      <UButton
        :label="$t('label.done')"
        color="primary"
        class="rounded"
        @click="done()"
      />
      <UButton
        :label="$t('label.cancel')"
        variant="outline"
        class="rounded"
        @click="cancel()"
      />
    </div>
  </div>
<!-- Below is needed for country select to look proper the tailwind classes don't come through otherwise -->
<!-- <template>
  <UFormField
    :name="schemaPrefix + 'country'"
    :help
    class="grow"
  >
    <template #default="{ error }">
      <USelect
        v-model="model"
        :data-testid="inputId"
        :items="options"
        value-key="alpha_2"
        label-key="name"
        class="w-full"
        :class="error ? 'shadow-bcGovInputError ring-0' : ''"
        :disabled
        :aria-label="$t('label.country')"
        :aria-required="true"
        :ui="{
          base: error
            ? 'shadow-bcGovInputError focus:shadow-bcGovInputError data-[state=open]:shadow-bcGovInputError'
            : '',
          item: 'nth-2:border-b nth-2:border-bcGovGray-200',
          itemTrailingIcon: 'hidden'
        }"
        @change="$emit('change')"
      >
        <template #default="{ modelValue }">
          <div class="relative px-2.5 pb-2 pt-6 w-full">
            <span
              aria-hidden="true"
              :class="[
                !modelValue
                  ? 'top-1/2 -translate-y-1/2'
                  : 'top-1 -translate-y-none text-xs',
                error
                  ? 'text-red-600'
                  : '',
                'absolute left-0 px-2.5 text-sm transition-all',
                'group-data-[state=open]:text-blue-500 group-focus:text-blue-500'
              ]"
            >
              {{ $t('label.country') }}
            </span>
            <div class="h-6">
              <span
                v-if="modelValue"
                class="line-clamp-1 text-left"
              >
                {{ displayedCountryName }}
              </span>
            </div>
          </div>
        </template>
      </USelect>
      <div
        v-if="!help && !error"
        class="h-4 mt-1"
      />
    </template>
  </UFormField>
</template> -->
</template>
