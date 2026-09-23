<script setup lang="ts">
const props = defineProps<{
  contact?: ContactPoint
  loading?: boolean
}>()

const { t } = useI18n()

const formattedContactInfo = computed(() => {
  const emptyText = `(${t('label.notEntered')})`

  if (!props.contact) {
    return { phone: emptyText, email: emptyText }
  }

  const { phone, extension, phoneExtension, email } = props.contact

  const ext = extension ?? phoneExtension
  const phoneLabel = phone
    ? (ext ? `${phone} Ext: ${ext}` : phone)
    : emptyText

  return {
    phone: phoneLabel,
    email: email ?? emptyText
  }
})
</script>

<template>
  <div class="flex gap-2 sm:gap-6 flex-col sm:flex-row py-4 sm:py-5 padding-x-default">
    <span class="text-neutral-highlighted font-bold w-full sm:basis-1/4">
      {{ $t('label.registeredOfficeContactInformation') }}
    </span>

    <div class="grid grid-cols-2 gap-4 sm:gap-6 flex-1">
      <div class="flex flex-col gap-1">
        <span class="text-sm font-bold text-neutral-highlighted">{{ $t('label.emailAddress') }}</span>
        <USkeleton v-if="loading" class="h-6 w-3/4 sm:w-1/2" />
        <span v-else>{{ formattedContactInfo.email || $t('label.notEntered') }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-sm font-bold text-neutral-highlighted">{{ $t('label.phoneNumber') }}</span>
        <USkeleton v-if="loading" class="h-6 w-3/4 sm:w-1/2" />
        <span v-else>{{ formattedContactInfo.phone }}</span>
      </div>
    </div>
  </div>
</template>
