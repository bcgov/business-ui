<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const {
  maxlength = '1000',
  country,
  id
} = defineProps<{
  id: string
  country?: string
  schemaPrefix: string
  disabled?: boolean
  required?: boolean
  maxlength?: string
  help?: string
}>()

const regions = computed(() => {
  switch (country) {
  case 'US':
    return countrySubdivisions.us
  case 'CA':
    return countrySubdivisions.ca
  default:
    return []
  }
})

const displayedRegionName = computed(() => {
  if (model.value) {
    const found = regions.value.find(r => r.code === model.value)?.name
    return found ?? ''
  }
  return ''
})

const inputId = id + '-region'
</script>

<template>
  <UFormField
    :name="schemaPrefix + 'region'"
    class="grow flex-1"
  >
    <template #default="{ error }">
      <USelect
        v-if="country === 'US' || country === 'CA'"
        :id="inputId"
        v-model="model"
        :items="regions"
        :aria-label="country === 'CA' ? $t('label.province') : $t('label.state')"
        value-key="code"
        label-key="name"
        :aria-required="true"
        :disabled
        class="w-full grow ring-0"
        :ui="{
          base: error
            ? 'shadow-bcGovInputError focus:shadow-bcGovInputError data-[state=open]:shadow-bcGovInputError'
            : ''
        }"
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
              {{ country === 'CA' ? $t('label.province') : $t('label.state') }}
            </span>
            <div class="h-6">
              <span
                v-if="modelValue"
                class="line-clamp-1 text-left"
              >
                {{ displayedRegionName }}
              </span>
            </div>
          </div>
        </template>
      </USelect>
      <ConnectInput
        v-else
        :id="inputId"
        v-model="model"
        required
        :invalid="!!error"
        :disabled
        :label="$t('label.regionOpt')"
        :maxlength
      />
      <div
        v-if="!help && !error"
        class="h-4 mt-1"
      />
    </template>
  </UFormField>
</template>
