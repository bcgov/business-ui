<script setup lang="ts">
import type { IconProps } from '@nuxt/ui'

const props = defineProps<CourtOrderFileUi & { blob?: Blob }>()

const secondHalfLength = 14

const firstHalfRef = useTemplateRef('first-half')
const { width: spanWidth } = useElementBounding(firstHalfRef)

const isTruncated = computed(() => {
  if (!firstHalfRef.value) {
    return false
  }
  return firstHalfRef.value.scrollWidth > spanWidth.value
})

const firstHalf = computed(() => {
  if (props.name.length <= secondHalfLength) {
    return props.name
  }
  return props.name.slice(0, props.name.length - secondHalfLength)
})

const secondHalf = computed(() => {
  if (props.name.length <= secondHalfLength) {
    return ''
  }
  return props.name.slice(props.name.length - secondHalfLength)
})

const iconProps = computed(() => {
  const isDeleted = props.action === FileAction.DELETED

  const iconMap: Record<CourtOrderFileStatus, IconProps & { class: string }> = {
    [CourtOrderFileStatus.LOADING]: {
      class: 'text-neutral',
      name: 'i-mdi-file-pdf-outline'
    },
    [CourtOrderFileStatus.ERROR]: {
      class: 'text-error',
      name: 'i-mdi-warning'
    },
    [CourtOrderFileStatus.SUCCESS]: {
      class: 'text-success',
      name: 'i-mdi-check-circle'
    },
    [CourtOrderFileStatus.IDLE]: {
      class: isDeleted ? 'text-neutral-toned' : 'text-primary',
      name: 'i-mdi-file-pdf-outline'
    }
  }

  return iconMap[props.status]
})

const isDownloadAllowed = computed(() =>
  Boolean(props.blob)
  && props.status === CourtOrderFileStatus.IDLE
  && props.action === CourtOrderFileAction.NONE
)

function handleDownload() {
  if (props.blob && isDownloadAllowed.value) {
    saveBlob(props.blob, props.name)
  }
}
</script>

<template>
  <div class="flex gap-1 items-start min-w-0">
    <div v-if="status === CourtOrderFileStatus.ERROR && errorMessage" class="flex gap-1 items-start pl-2">
      <UIcon
        class="size-6 shrink-0"
        v-bind="iconProps"
      />
      <span class="text-error wrap-anywhere">
        {{ errorMessage }}
      </span>
    </div>

    <UTooltip
      v-else
      :text="name"
      :disabled="!isTruncated"
    >
      <UButton
        variant="link"
        :as="isDownloadAllowed ? 'button' : 'div'"
        :class="[
          'px-2 py-1 h-min gap-1 text-base min-w-0',
          isDownloadAllowed
            ? ''
            : 'text-neutral pointer-events-none'
        ]"
        @click="handleDownload"
      >
        <template #leading>
          <UIcon
            class="size-6 shrink-0"
            v-bind="iconProps"
          />
        </template>
        <template #default>
          <div class="flex min-w-0 whitespace-nowrap">
            <span v-if="isDownloadAllowed" class="sr-only">{{ $t('label.download') }}</span>
            <span ref="first-half" class="shrink overflow-hidden text-ellipsis">{{ firstHalf }}</span>
            <span v-if="secondHalf">{{ secondHalf }}</span>
          </div>
        </template>
      </UButton>
    </UTooltip>
  </div>
</template>
