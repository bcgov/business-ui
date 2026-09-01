<script setup lang="ts">
import type { IconProps } from '@nuxt/ui'

const {
  name,
  action,
  status,
  blob
} = defineProps<CourtOrderFileUi & { blob?: Blob }>()

const { firstHalfRefKey, isTruncated, firstHalf, secondHalf } = useTruncateText(() => name)

const iconProps = computed(() => {
  const isDeleted = action === CourtOrderFileAction.DELETED

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

  return iconMap[status]
})

const isDownloadAllowed = computed(() =>
  Boolean(blob)
  && status === CourtOrderFileStatus.IDLE
  && action === CourtOrderFileAction.NONE
)

function handleDownload() {
  if (blob && isDownloadAllowed.value) {
    saveBlob(blob, name)
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
            : 'text-neutral cursor-default hover:text-neutral active:text-neutral'
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
            <span :ref="firstHalfRefKey" class="shrink overflow-hidden text-ellipsis">{{ firstHalf }}</span>
            <span v-if="secondHalf">{{ secondHalf }}</span>
          </div>
        </template>
      </UButton>
    </UTooltip>
  </div>
</template>
