<script setup lang="ts">
const { t } = useI18n()
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const rtc = useRuntimeConfig().public
const accountStore = useConnectAccountStore()

const title = t('modal.filingNotAllowed.title')
const description = t('modal.filingNotAllowed.description')
</script>

<template>
  <UModal
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
          <h2
            id="session-expired-dialog-title"
            class="text-2xl font-semibold text-bcGovColor-darkGray"
          >
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
