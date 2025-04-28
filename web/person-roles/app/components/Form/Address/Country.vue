<script setup lang="ts">
import { iscCountriesListSortedByName as countries } from '~/utils/isoCountriesList'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  id: string
  schemaPrefix: string
  disabled?: boolean
}>()

defineEmits<{
  change: []
}>()

const inputId = props.id + '-country'

const displayedCountryName = computed(() => {
  if (model.value) {
    const found = countries.find(c => c.alpha_2 === model.value)?.name
    return found ?? ''
  }
  return ''
})

const options = [
  countries.find(c => c.alpha_2 === 'CA'),
  countries.find(c => c.alpha_2 === 'US'),
  ...countries
]
</script>

<template>
  <UFormField
    :name="schemaPrefix + 'country'"
    class="grow"
  >
    <template #default="{ error }">
      <USelect
        v-model="model"
        :data-testid="inputId"
        :items="options"
        :selected-icon="' '"
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
          item: 'nth-2:border-b nth-2:border-bcGovGray-200'
        }"
        @change="$emit('change')"
      >
        <template #default="{ modelValue }">
          <div class="relative px-2.5 pb-2 pt-6 w-full">
            <span
              aria-hidden="true"
              class="absolute left-0 px-2.5 text-sm transition-all"
              :class="[
                !modelValue
                  ? 'top-1/2 -translate-y-1/2'
                  : 'top-1 -translate-y-none text-xs',
                error
                  ? 'text-red-600'
                  : ''
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
    </template>
  </UFormField>
</template>
