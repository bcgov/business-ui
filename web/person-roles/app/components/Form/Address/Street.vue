<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const props = defineProps<{
  id: string
  country?: string
  schemaPrefix: string
  disabled?: boolean
  disableAddressComplete: boolean
  notPoBox?: boolean
}>()

const emit = defineEmits<{
  addressComplete: [value: UiAddress]
}>()

const inputId = props.id + '-street'

const { address: canadaPostAddress, enableAddressComplete } = useCanadaPost()

const addressComplete = (id: string) => {
  if (props.country && props.country.trim() !== '') {
    enableAddressComplete(id, props.country, props.disableAddressComplete)
  }
}

watch(canadaPostAddress, (newAddress) => {
  emit('addressComplete', newAddress)
})
</script>

<template>
  <UFormField
    :name="schemaPrefix + 'street'"
    class="grow"
    :help="notPoBox ? $t('help.addressCannotBePOBox') : ''"
  >
    <template #default="{ error }">
      <ConnectInput
        :id="inputId"
        v-model="model"
        required
        :invalid="!!error"
        :disabled
        :label="$t('label.street')"
        @keypress.once="addressComplete(inputId)"
        @click="addressComplete(inputId)"
      />
    </template>
  </UFormField>
</template>
