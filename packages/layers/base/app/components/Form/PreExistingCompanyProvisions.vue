<script setup lang="ts">
defineProps<{
  order?: string | number
}>()

const rtc = useRuntimeConfig().public
</script>

<template>
  <section class="space-y-4">
    <h2>
      {{ order ? `${order}. ${$t('label.preExistingCompanyProvisions')}` : $t('label.preExistingCompanyProvisions') }}
    </h2>

    <div class="rounded p-6 bg-white space-y-1">
      <h3>{{ $t('label.preExistingCompanyProvisionsApplyToCompany') }}</h3>
      <div class="space-y-4">
        <p>{{ $t('text.preExistingCompanyProvisionsDescription') }}</p>
        <i18n-t
          keypath="text.moreInfoReadTheLink"
          tag="p"
          scope="global"
        >
          <template #link>
            <UButton
              :to="rtc.preExistingCompanyProvisions"
              target="external"
              variant="link"
              class="underline italic text-primary p-0 text-base gap-1"
              trailing-icon="i-mdi-open-in-new"
            >
              {{ $t('act.businessCorpPreExistingCompanyProvisions') }}
            </UButton>
          </template>
        </i18n-t>
      </div>
    </div>
  </section>
</template>
