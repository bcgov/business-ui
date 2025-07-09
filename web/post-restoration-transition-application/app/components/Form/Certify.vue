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
</script>

<template>
  <div class="flex">
    <UCheckbox
      v-model="certified"
      name="certification"
      :disabled="isDisabled"
      data-test="certify-section-checkbox"
    >
      <template #label>
        <div class="flex flex-col text-base space-y-2">
          <div :class="{ 'text-red-500': hasError }">
            <slot name="certifyText">
              <i18n-t
                keypath="text.certifiesItHasRelevantKnowledgeClient"
                tag="p"
                class="mt-[-2px]"
              >
                <template #legalName>
                  <strong>{{ legalName }}</strong>
                </template>
              </i18n-t>
            </slot>
          </div>
          <div>
            <slot name="certifyDate">
              <span class="font-bold">{{ $t('label.date') }}: </span>{{ nowAsIsoDate() }}
            </slot>
          </div>
          <div>
            <slot name="certifyNote">
              <span class="font-bold">{{ $t('label.note') }}: </span>{{ $t('text.itIsAnOffenceToMakeFalseStatement') }}
            </slot>
          </div>
        </div>
      </template>
    </UCheckbox>
  </div>
</template>
