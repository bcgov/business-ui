<script lang="ts" setup>
import DateInput from '~/components/Form/DateInput.vue'
import { isDateBetween } from '~/utils/uidate'

const t = useNuxtApp().$i18n.t
const { openEditFormError } = storeToRefs(usePostRestorationErrorsStore())

const model = defineModel<string | undefined>()
const props = defineProps<{
  id: string
  name: string
  label: string
  minDate?: string
  maxDate?: string
  hasErrors?: boolean
  readonly?: boolean
}>()

const emit = defineEmits(['save', 'cancel'])

const selectedValue = ref(model.value || undefined)

const saveHandler = () => {
  if (!selectedValue.value || !isDateBetween(selectedValue.value, props.minDate, props.maxDate)) {
    saveError.value = t('errors.notAValidInput')
    return
  } else {
    saveError.value = ''
  }
  model.value = selectedValue.value
  emit('save', model.value)
}
const cancelHandler = () => {
  selectedValue.value = undefined
  emit('cancel')
}

const saveError = ref('')
</script>

<template>
  <div :id="id" class="pb-[22px]">
    <UFormField
      :error="saveError"
    >
      <DateInput
        :id="name + '_id'"
        v-model="selectedValue"
        :data-testid="id"
        :readonly
        :label="label"
        :max-date="maxDate"
        :min-date="minDate"
        @change="saveError = ''"
      />
    </UFormField>
  </div>
  <div class="flex flex-row mt-2 space-x-4 float-end mb-2 items-center">
    <div v-if="openEditFormError" class="text-outcomes-error text-sm">
      {{ $t(openEditFormError) }}
    </div>
    <UButton
      :label="!!hasErrors ? $t('label.done') : $t('label.save')"
      :data-testid="id + '_save'"
      :padded="false"
      class="rounded text-base pt-[11px] pb-[11px]"
      color="primary"
      variant="solid"
      @click.stop="saveHandler"
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
