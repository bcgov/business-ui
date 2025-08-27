<script lang="ts" setup>
import DateInput from '~/components/Form/DateInput.vue'

const model = defineModel<string>()
defineProps<{
  id: string
  name: string
  label: string
  minDate?: string
  maxDate?: string
  hasErrors?: boolean
}>()

const emit = defineEmits(['save', 'cancel'])

const selectedValue = ref(model.value || '')

const saveHandler = () => {
  model.value = selectedValue.value
  emit('save', model.value)
}
const cancelHandler = () => {
  selectedValue.value = ''
  emit('cancel')
}
</script>

<template>
  <div class="pb-[22px]">
    <DateInput
      :id="name + '_id'"
      v-model="selectedValue"
      :label="label"
      :max-date="maxDate"
      :min-date="minDate"
    />
  </div>
  <div class="flex flex-row mt-2 space-x-4 float-end">
    <UButton
      :label="!!hasErrors ? $t('label.done') : $t('label.save')"
      :padded="false"
      class="rounded text-base pt-[11px] pb-[11px]"
      color="primary"
      variant="solid"
      @click="saveHandler"
    />
    <UButton
      :label="$t('label.cancel')"
      :padded="false"
      class="rounded text-base pt-[11px] pb-[11px]"
      variant="outline"
      @click="cancelHandler"
    />
  </div>
</template>

<style scoped>

</style>
