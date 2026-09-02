<script setup lang="ts">
import { formatBytes } from '../utils'
import type { ButtonProps } from '@nuxt/ui'

const props = defineProps<CourtOrderFileUi>()

const emit = defineEmits<{
  fileAction: [id: string, action: 'cancel' | 'undo' | 'delete']
}>()

const { $businessApi } = useNuxtApp()
const { t } = useI18n()

const { data } = useQuery({
  key: () => ['documents-client-blob', props.fileKey ?? null],
  query: () => $businessApi<Blob>(`documents/client/${props.fileKey}`, {
    responseType: 'blob' as 'json'
  }),
  enabled: () => !!props.fileKey
})

const fileSize = computed(() => {
  const bytes = data.value?.size
  return bytes ? formatBytes(bytes) : undefined
})

const actionProps = computed(() => {
  if (props.status === CourtOrderFileStatus.LOADING) {
    return {
      label: t('label.cancel'),
      ariaLabel: t('label.cancelUploadOfFilename', { filename: props.name }),
      icon: 'i-mdi-close',
      onClick: () => emit('fileAction', props.id, 'cancel')
    }
  }

  const actionMap: Record<CourtOrderFileAction, ButtonProps & { ariaLabel: string }> = {
    [CourtOrderFileAction.NONE]: {
      label: t('label.delete'),
      ariaLabel: `${t('label.delete')} ${props.name}`,
      icon: 'i-mdi-delete',
      onClick: () => emit('fileAction', props.id, 'delete')
    },
    [CourtOrderFileAction.ADDED]: {
      label: t('label.remove'),
      ariaLabel: `${t('label.remove')} ${props.name}`,
      icon: 'i-mdi-delete',
      onClick: () => emit('fileAction', props.id, 'delete')
    },
    [CourtOrderFileAction.DELETED]: {
      label: t('label.undo'),
      ariaLabel: `${t('label.undo')} ${props.name}`,
      icon: 'i-mdi-undo',
      onClick: () => emit('fileAction', props.id, 'undo')
    }
  }

  return actionMap[props.action]
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <li
    :class="[
      'flex gap-4 min-w-0 py-4 last:pb-0 first:pt-2 @container',
      action === CourtOrderFileAction.DELETED ? 'text-neutral-toned' : ''
    ]"
  >
    <FormCourtOrderPoaFullFileUploadPreview
      v-bind="$props"
      :blob="data"
    />
    <div class="flex flex-col min-w-0 w-full">
      <div class="flex justify-between w-full min-w-0">
        <FormCourtOrderPoaFullFileUploadItemName
          v-bind="$props"
          :blob="data"
          class="-ml-2"
        />
        <UButton
          v-if="status !== CourtOrderFileStatus.ERROR"
          v-bind="actionProps"
          variant="link"
          class="px-2 py-1 h-min gap-1 @max-[350px]:hidden text-base"
        />
      </div>
      <div class="flex flex-col gap-1 ml-7">
        <div v-if="status === CourtOrderFileStatus.LOADING" class="flex flex-col gap-1 text-neutral-toned">
          <span>{{ $t(`label.${(progress ?? 0) >= 95 ? 'processing' : 'uploading'}`) }}...</span>
          <UProgress
            :model-value="progress"
            class="max-w-3xs"
            :ui="{

            }"
          />
          <span v-if="progress" class="ml-5">{{ progress }}%</span>
        </div>
        <span v-else class="-mt-1">{{ fileSize }}</span>
        <UBadge
          v-if="action === CourtOrderFileAction.DELETED"
          class="bg-shade-secondary text-neutral-highlighted font-bold text-xs w-min"
          :label="$t('badge.deleted')"
        />
      </div>
      <UButton
        v-if="status !== CourtOrderFileStatus.ERROR"
        v-bind="actionProps"
        variant="link"
        class="px-2 py-1 h-min gap-1 @min-[350px]:hidden ml-4 mt-auto text-base"
      />
    </div>
  </li>
</template>
