<script setup lang="ts">
const props = defineProps<CourtOrderFileUi & {
  blob?: Blob
}>()

const objectUrl = useObjectUrl(() => props.blob)

const srcUrl = computed(() => objectUrl.value ? `${objectUrl.value}#toolbar=0&navpanes=0&page=1&view=FitH` : undefined)
const showPlaceholder = computed(() => ![
  CourtOrderFileStatus.SUCCESS,
  CourtOrderFileStatus.IDLE
].includes(props.status) || !srcUrl.value)
</script>

<template>
  <div
    v-if="showPlaceholder"
    class="pdf-placeholder shrink-0 rounded-lg grid place-content-center border border-line-muted bg-white relative"
    aria-hidden="true"
  >
    <UIcon
      name="i-mdi-image-outline"
      class="size-7 text-[#D4D4D4]"
    />
    <div
      v-if="action === CourtOrderFileAction.DELETED"
      class="absolute inset-0 bg-white/50 pointer-events-none"
    />
  </div>
  <div
    v-else
    class="pdf-frame shrink-0 rounded border border-line-muted overflow-hidden relative"
    aria-hidden="true"
  >
    <iframe
      :src="srcUrl"
      type="application/pdf"
      class="pdf-frame__iframe"
      loading="lazy"
      tabindex="-1"
    />
    <div
      v-if="action === CourtOrderFileAction.DELETED"
      class="absolute inset-0 bg-white/50 pointer-events-none"
    />
  </div>
</template>

<style scoped>
.pdf-placeholder,
.pdf-frame {
  width: 80px;
  height: 104px;
}

.pdf-frame__iframe {
  width: 100%;
  overflow: hidden;
  transform: translateY(1px) scale(1.02);
  transform-origin: center;
  pointer-events: none;
}
</style>
