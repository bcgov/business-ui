<script setup lang="ts">
import { toApiAddress, toUiAddress } from '~/utils/address'

const props = defineProps<{
  index: number
  formId: string
  editFormError: string | undefined
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

const setDeliveryState = (updateSameAsMailing = true) => {
  deliveryState.value = toUiAddress(editingDirector.value?.deliveryAddress)
  if (updateSameAsMailing) {
    sameAsMailing.value = JSON.stringify(deliveryState.value) === JSON.stringify(mailingState.value)
  }
}

const setMailingState = () => {
  mailingState.value = toUiAddress(editingDirector.value?.mailingAddress)
  sameAsMailing.value = JSON.stringify(deliveryState.value) === JSON.stringify(mailingState.value)
}

watch(editingDirector, setDeliveryState, { immediate: true })
watch(editingDirector, () => {
  setMailingState(true)
}, { immediate: true })

editingDirector.value = directors.value[props.index]
const formRef = ref()

watch (mailingState, (oldVal, newVal) => {
  if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
    return
  }
  if (sameAsMailing.value) {
    sameAsMailing.value = false
  }
}, { deep: true })

const done = () => {
  editingDirector.value.deliveryAddress = toApiAddress(deliveryState.value, false)
  editingDirector.value.mailingAddress = toApiAddress(mailingState.value, false)
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
  <div :id="formId" class="flex space-x-6">
    <div class="flex flex-col pr-4">
      <p class="font-bold text-bgGovColor-midGray">
        {{ editingDirector?.officer?.firstName }} {{ editingDirector?.officer?.lastName }}
      </p>
    </div>
    <div class="flex flex-col pl-4 w-full">
      <p class="font-bold text-md mb-4">
        {{ $t('label.mailingAddress') }}
      </p>
      <ConnectFormAddress
        id="mailing-address"
        v-model="mailingState"
        schema-prefix="mailingAddress."
        :form-ref="formRef"
        not-po-box
        :excluded-fields="['streetName', 'streetNumber', 'unitNumber']"
      />

      <p class="font-bold text-md mb-4">
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
      <ConnectFormAddress
        v-if="!sameAsMailing"
        id="delivery-address"
        v-model="deliveryState"
        schema-prefix="deliveryAddress."
        :form-ref="formRef"
        not-po-box
        :excluded-fields="['streetName', 'streetNumber', 'unitNumber']"
      />

      <div class="flex justify-end space-x-4 items-center">
        <div v-if="editFormError" class="text-outcomes-error text-sm">
          {{ $t(editFormError) }}
        </div>
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
          data-testId="directorChangeAddressCancelBtn"
          @click="cancel()"
        />
      </div>
    </div>
  </div>
</template>
