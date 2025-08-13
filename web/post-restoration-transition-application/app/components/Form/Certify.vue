1
<script setup lang="ts">
import { nowAsIsoDate } from '~/utils/uidate'

const certified = defineModel<boolean>()
defineProps<{
  legalName: string | undefined
  isDisabled?: boolean | undefined
}>()

const errorsStore = usePostRestorationErrorsStore()

const { certifyErrors } = storeToRefs(errorsStore)

const hasError = computed(() => {
  const length = certifyErrors?.value?.['certified']?.length || 0
  return length > 0
})

</script>

<template>
  <div class="flex">
    <!-- We don't show a text error even if one exists as it just must be checked-->
    <UFormField>
      <UCheckbox
        v-model="certified"
        name="certification"
        :disabled="isDisabled"
        data-test="certify-section-checkbox"
      >
        <template #label>
          <div class="flex flex-col text-base space-y-2">
            <div>
              <slot name="certifyText">
                <i18n-t
                  keypath="text.certifiesItHasRelevantKnowledgeClient"
                  scope="global"
                  tag="p"
                  class="mt-[-2px]"
                  :class="{ 'text-red-500': hasError }"
                >
                  <template #legalName>
                    <strong>{{ legalName }}</strong>
                  </template>
                </i18n-t>
              </slot>
            </div>
            <div>
              <slot name="certifyDate">
                <span class="font-bold">
                  {{ $t('label.date') }}:
                </span>{{ nowAsIsoDate() }}
              </slot>
            </div>
            <div>
              <slot name="certifyNote">
                <span class="font-bold">
                  {{ $t('label.note') }}:
                </span>{{ $t('text.itIsAnOffenceToMakeFalseStatement') }}
              </slot>
            </div>
          </div>
        </template>
      </UCheckbox>
    </UFormField>
  </div>
</template>
