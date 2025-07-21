<script setup lang="ts">
import DateInput from '~/components/Form/DateInput.vue'

const model = defineModel<string>()
defineProps<{
  id: string
  name: string
  label: string
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
  <DateInput
    :id="name + '_id'"
    v-model="selectedValue"
    :label="label"
  />
  <div class="flex flex-row mt-2 space-x-4 float-end">
    <UButton
      :label="$t('label.save')"
      :padded="false"
      variant="solid"
      color="primary"
      class="rounded text-base pt-[11px] pb-[11px]"
      @click="saveHandler"
    />
    <UButton
      :label="$t('label.cancel')"
      :padded="false"
      variant="outline"
      class="rounded text-base pt-[11px] pb-[11px]"
      @click="cancelHandler"
    />
  </div>
</template>

<style scoped>

</style>
