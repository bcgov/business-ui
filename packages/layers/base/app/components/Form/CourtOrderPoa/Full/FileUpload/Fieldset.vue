<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import { formatBytes, maxFileSize, acceptedFileTypes } from './utils'

const {
  error
} = defineProps<{
  error?: FormError | boolean
}>()

const id = useId()
const legendId = id + '-legend'
const descriptionId = id + '-description'

const { t } = useI18n()

const description = computed(() => {
  return t('text.maxFileSizeAndAcceptedTypesDescription', {
    max: formatBytes(maxFileSize),
    types: acceptedFileTypes.map(type => `.${type.split('/').pop()}`).join(', ')
  })
})
</script>

<template>
  <fieldset
    :aria-labelledby="legendId"
    :class="[
      'padding-xy-default grid grid-cols-1 sm:grid-cols-[25%_minmax(0,1fr)] gap-4 sm:gap-6',
      error ? 'shadow-section-error' : ''
    ]"
  >
    <div class="flex flex-col gap-1">
      <span :id="legendId" class="text-base text-neutral-highlighted font-bold">
        {{ $t('label.documentUploadOpt') }}
      </span>
      <p :id="descriptionId" aria-hidden="true">
        {{ description }}
      </p>
    </div>

    <div>
      <slot :description-id />
    </div>
  </fieldset>
</template>
