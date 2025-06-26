<script setup lang="ts">
import { StatusCodes } from 'http-status-codes'

const { t } = useI18n()
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const rtc = useRuntimeConfig().public
const accountStore = useConnectAccountStore()

const props = defineProps<{
  status?: number
}>()

const errorMessages: Record<number, { title: string, description: string }> = {
  [StatusCodes.NOT_FOUND]: {
    title: t('error.getOfficerInfo.notFound.title'),
    description: t('error.getOfficerInfo.notFound.description')
  },
  [StatusCodes.BAD_REQUEST]: {
    title: t('error.getOfficerInfo.notFound.title'),
    description: t('error.getOfficerInfo.notFound.description')
  },
  [StatusCodes.FORBIDDEN]: {
    title: t('error.getOfficerInfo.unauthorized.title'),
    description: t('error.getOfficerInfo.unauthorized.description')
  },
  [StatusCodes.UNAUTHORIZED]: {
    title: t('error.getOfficerInfo.unauthorized.title'),
    description: t('error.getOfficerInfo.unauthorized.description')
  },
  [StatusCodes.INTERNAL_SERVER_ERROR]: {
    title: t('error.getOfficerInfo.internal.title'),
    description: t('error.getOfficerInfo.internal.description')
  }
}

const title = props.status
  ? errorMessages[props.status]?.title || t('error.getOfficerInfo.unknown.title')
  : t('error.getOfficerInfo.unknown.title')

const description = props.status
  ? errorMessages[props.status]?.description || t('error.getOfficerInfo.unknown.description')
  : t('error.getOfficerInfo.unknown.description')
</script>

<template>
  <UModal
    id="officer-init-error-modal"
    overlay
    :title
    :description
    :dismissible="false"
  >
    <template #content>
      <div class="p-10 flex flex-col items-center text-center gap-6">
        <UIcon
          class="text-red-600 shrink-0 size-10"
          name="i-mdi-alert-circle-outline"
        />
        <div
          role="alert"
          class="flex flex-col gap-6"
        >
          <h2 class="text-2xl font-semibold text-bcGovColor-darkGray">
            {{ title }}
          </h2>
          <p>{{ description }}</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <UButton
            :label="$t('btn.goToBRD')"
            :block="isSmallScreen"
            size="xl"
            :to="`${rtc.brdUrl}account/${accountStore.currentAccount.id}`"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
