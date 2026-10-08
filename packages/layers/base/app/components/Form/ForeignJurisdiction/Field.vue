<script setup lang="ts">
const {
  id = 'jurisdiction-menu',
  selectLabel,
  name
} = defineProps<{
  id?: string
  /** floating label for the select (defaults to "Select New Jurisdiction") */
  selectLabel?: string
  /** UFormField name for host-form error resolution */
  name?: string
}>()

const emit = defineEmits<{
  /** fired on every selection - hosts may clear stale form errors */
  change: []
}>()

const { t } = useI18n()

const model = defineModel<{ country: string, region?: string | null } | undefined>()

// combined jurisdiction menu - Canadian provinces/territories (minus BC) + Federal,
// then international countries (US first)
const jurisdictionOpts = getJurisdictionMenuItems()

// normalize jurisdiction to match InputMenuItem
const selectedJurisdiction = computed({
  get(): { label: string, country: string, region: string | null } | undefined {
    if (!model.value?.country) {
      return undefined
    }

    return {
      label: getJurisdictionLabel(model.value),
      country: model.value.country,
      region: model.value.region ?? null
    }
  },
  set(val: { label?: string, country: string, region: string | null } | undefined) {
    model.value = {
      country: val?.country ?? '',
      region: val?.region ?? null
    }
    emit('change')
  }
})

defineOptions({ inheritAttrs: false })
</script>

<template>
  <UFormField :name>
    <ConnectInputMenu
      :id
      v-model="selectedJurisdiction"
      v-bind="$attrs"
      :label="selectLabel ?? t('label.selectNewJurisdiction')"
      :items="jurisdictionOpts"
      open-on-focus
      class="w-full"
      :ui="{
        label: 'font-bold px-4 pb-2 pt-3',
        separator: 'mx-0'
      }"
    />
  </UFormField>
</template>
