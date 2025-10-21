<script setup lang="ts">
const { t } = useI18n()
const contact: ConnectContactItem[] = [
  { type: 'phone', title: t('contactInfo.tollFree.title'), value: t('contactInfo.tollFree.value') },
  { type: 'phone', title: t('contactInfo.victoriaOffice.title'), value: t('contactInfo.victoriaOffice.value') },
  { type: 'email', title: t('contactInfo.email.title'), value: t('contactInfo.email.value') }
]
</script>

<template>
  <div class="space-y-4">
    <div>
      <p>
        <strong>
          {{ $t('label.bcRegistriesContactInformation') }}
        </strong>
      </p>
      <p>
        {{ $t('contactInfo.hours.value') }}
      </p>
    </div>
    <ConnectContactDisplay :contact />
  </div>
</template>
