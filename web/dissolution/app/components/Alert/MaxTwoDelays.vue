<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <UAlert
    class="sm:mx-4 sm:max-w-[96%] px-7.5 py-5.5"
    icon="i-mdi-alert"
    color="neutral"
    variant="outline"
    :ui="{
      icon: 'text-warning'
    }"
  >
    <template #description>
      <i18n-t
        tag="p"
        scope="global"
        keypath="text.alertMaxTwoDelays"
      >
        <template #important>
          <strong>{{ t('label.important') }}:</strong>
        </template>
        <template #email>
          <ULink
            class="underline"
            target="_blank"
            href="mailto:BCRegistries@gov.bc.ca"
            raw
          >
            BCRegistries@gov.bc.ca
          </ULink>
        </template>
      </i18n-t>
    </template>
  </UAlert>
</template>
