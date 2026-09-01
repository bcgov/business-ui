<script setup lang="ts">
const props = defineProps<CourtOrderFileUi & {
  isRemoved?: boolean
}>()

const { firstHalfRefKey, isTruncated, firstHalf, secondHalf } = useTruncateText(() => props.name)

const { $businessApi } = useNuxtApp()

const { data: blob } = useQuery({
  key: () => ['documents-client-blob', props.fileKey ?? null],
  query: () => $businessApi<Blob>(`documents/client/${props.fileKey}`, {
    responseType: 'blob' as 'json'
  }),
  enabled: () => !!props.fileKey && !props.isRemoved
})

const isDownloadAllowed = computed(() =>
  !props.isRemoved
  && Boolean(blob.value)
  && props.status === CourtOrderFileStatus.IDLE
  && props.action === CourtOrderFileAction.NONE
)

function handleDownload() {
  if (blob.value && isDownloadAllowed.value) {
    saveBlob(blob.value, props.name)
  }
}
</script>

<template>
  <UTooltip
    :text="name"
    :disabled="!isTruncated"
  >
    <UButton
      variant="link"
      :as="isDownloadAllowed ? 'button' : 'div'"
      :class="[
        'p-0 text-base max-w-full',
        isDownloadAllowed
          ? ''
          : 'text-neutral cursor-default hover:text-neutral active:text-neutral'
      ]"
      @click="handleDownload"
    >
      <template #default>
        <div class="flex max-w-full whitespace-nowrap">
          <span v-if="isDownloadAllowed" class="sr-only">{{ $t('label.download') }}</span>
          <span :ref="firstHalfRefKey" class="shrink overflow-hidden text-ellipsis">{{ firstHalf }}</span>
          <span v-if="secondHalf">{{ secondHalf }}</span>
        </div>
      </template>
    </UButton>
  </UTooltip>
</template>
