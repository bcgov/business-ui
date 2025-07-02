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
  <FormFieldInput
    v-model="model"
    :input-id="inputId"
    :name="schemaPrefix + 'street'"
    :help="notPoBox ? $t('help.addressCannotBePOBox') : $t('help.addressCanBePOBox')"
    :label="$t('label.street')"
    required
    :disabled
    @keypress.once="addressComplete(inputId)"
    @click="addressComplete(inputId)"
  />
</template>
