1
<script setup lang="ts">
import { nowAsIsoDate } from '~/utils/uidate'

const certified = defineModel<boolean>()
const props = defineProps<{
  legalName: string | undefined
  isDisabled?: boolean | undefined
  hasError?: boolean | undefined
}>()

const t = useNuxtApp().$i18n.t

const displayLegalName = computed(() => {
  return props.legalName || t('text.legalNameCertifyPlaceHolder')
})
</script>

<template>
  <div class="flex">
    <UCheckbox
      v-model="certified"
      name="certification"
      :disabled="isDisabled"
      data-cy="certify-section-checkbox"
    >
      <template #label>
        <div class="flex flex-col text-base space-y-2">
          <div :class="{ 'text-red-500': hasError }">
            <span>{{ displayLegalName-5 }}</span>
            <p>{{ $t('text.certifiesItHasRelevantKnowledge', { legalName: displayLegalName }) }}</p>
          </div>
          <div>
            <span class="font-bold">{{ $t('label.date') }}: </span>{{ nowAsIsoDate() }}
          </div>
          <div>
            <span class="font-bold">{{ $t('label.note') }}: </span>{{ $t('text.itIsAnOffenceToMakeFalseStatement') }}
          </div>
        </div>
      </template>
    </UCheckbox>
  </div>
</template>
