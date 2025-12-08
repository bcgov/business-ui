<script setup lang="ts">
const emit = defineEmits<{
  refresh: []
}>()
import { StatusCodes } from 'http-status-codes'
const config = useRuntimeConfig().public
const showContactInfo = ref(false)

async function handleRefresh() {
  try {
    emit('refresh')
  } catch (error) {
    if (error instanceof Error && error.response?.status === StatusCodes.UNAUTHORIZED) {
      const registryUrl = config.registryHomeUrl
      const redirectUrl = encodeURIComponent(window.location.href)
      window.location.href = `${registryUrl}/login?redirect=${redirectUrl}`
      return
    }
    emit('refresh')
  }
}

function toggleContactInfo () {
  if (showContactInfo.value) { return } // There is no way for the user to hide the contact info once it is shown
  showContactInfo.value = !showContactInfo.value
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <UIcon
      name="i-mdi-alert"
      class="size-6 text-bcGovColor-caution"
    />
    <h2 class="py-1 text-lg font-semibold text-bcGovColor-midGray">
      {{ $t('error.listNotFound.title') }}
    </h2>
    <p class="text-center text-sm text-bcGovColor-midGray">
      {{ $t('error.listNotFound.description') }}
    </p>
    <UButton
      :label="$t('btn.refreshTable')"
      variant="outline"
      class="mt-4 px-4"
      :ui="{ base: 'rounded' }"
      @click="handleRefresh"
    />

    <hr class="my-4 w-full border-t border-bcGovGray-300">

    <div class="flex w-full flex-col items-center text-sm">
      <div class="flex items-center gap-1 text-bcGovColor-midGray">
        <span>{{ $t('error.listNotFound.stillNotWorking') }}</span>
        <button
          type="button"
          class="flex items-center text-blue-500 underline"
          @click="toggleContactInfo"
        >
          {{ $t('error.listNotFound.contactBCRegistries') }}
        </button>
      </div>

      <div v-if="showContactInfo" class="mt-4 flex w-full flex-col gap-1 pl-6 text-bcGovColor-midGray">
        <div class="flex items-center gap-2">
          <UIcon name="i-mdi-phone" class="size-4 text-bcGovColor-nonClickable" />
          <span>{{ $t('contactInfo.bcRegGeneral.tollFree.title') }}</span>
          <a :href="`tel:${$t('contactInfo.bcRegGeneral.tollFree.value')}`" class="text-blue-500 underline">
            {{ $t('contactInfo.bcRegGeneral.tollFree.value') }}
          </a>
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-mdi-phone" class="size-4 text-bcGovColor-nonClickable" />
          <span>{{ $t('contactInfo.bcRegGeneral.victoriaOffice.title') }}</span>
          <a :href="`tel:${$t('contactInfo.bcRegGeneral.victoriaOffice.value')}`" class="text-blue-500 underline">
            {{ $t('contactInfo.bcRegGeneral.victoriaOffice.value') }}
          </a>
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-mdi-email" class="size-4 text-bcGovColor-nonClickable" />
          <span>{{ $t('contactInfo.bcRegGeneral.email.title') }}</span>
          <a href="mailto:BCRegistries@gov.bc.ca" class="text-blue-500 underline">BCRegistries@gov.bc.ca</a>
        </div>
      </div>
    </div>
  </div>
</template>
