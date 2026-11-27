<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  middleware: ['connect-auth']
})

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const rtc = useRuntimeConfig().public

const businessId = route.params.businessId as string

useHead({ title: t('page.entityError.title') })
useDashboardBreadcrumbs()
</script>

<template>
  <!-- FUTURE: bootstrap wording, invalid name request variant and contact info -->
  <div data-testid="entity-error" class="py-6 space-y-6 sm:py-10">
    <h1>{{ $t('page.entityError.h1') }}</h1>
    <p>{{ $t('page.entityError.desc') }}</p>
    <ul class="list-disc list-outside ml-6 space-y-1">
      <li>{{ $t('page.entityError.reason.notAuthorized') }}</li>
      <li>{{ $t('page.entityError.reason.sessionTimedOut') }}</li>
      <li>{{ $t('page.entityError.reason.invalidIdentifier') }}</li>
    </ul>
    <p>{{ $t('page.entityError.retryOrExit') }}</p>
    <div class="flex gap-4">
      <UButton
        data-testid="entity-error-exit-btn"
        external
        :label="$t('label.exit')"
        :to="`${rtc.registryHomeUrl}dashboard`"
        variant="outline"
      />
      <UButton
        data-testid="entity-error-retry-btn"
        :label="$t('label.retry')"
        :to="localePath(`/${businessId}`)"
      />
    </div>
  </div>
</template>
