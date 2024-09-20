<script setup lang="ts">
const { t } = useI18n()
const accountStore = useConnectAccountStore()
const nrWebUrl = useRuntimeConfig().public.nrURL

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})
</script>
<template>
  <div class="mx-auto flex flex-col gap-4 px-2 py-8 sm:px-4 sm:py-10">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 md:flex-row md:justify-between">
        <div class="flex flex-col gap-4 md:flex-1">
          <SbcPageSectionH1 :heading="$t('page.home.h1')" />

          <p class="text-gray-700">
            {{ $t('page.home.intro') }}
          </p>
        </div>
        <ClientOnly>
          <div v-if="accountStore.currentAccount.id" class="flex-none">
            <UTooltip
              :text="$t('btn.busGetStarted.tooltip')"
              :popper="{ arrow: true }"
            >
              <UButton
                :label="$t('btn.busGetStarted.label')"
                variant="outline"
                icon="i-mdi-domain"
                size="bcGov"
                class="w-full"
                :to="`${nrWebUrl}${accountStore.currentAccount.id.toString()}`"
              />
            </UTooltip>
          </div>
        </ClientOnly>
      </div>

      <HelpTextSection />
    </div>
    <BusinessLookup class="-mt-4" />

    <TableAffiliatedEntity />

    <UModals />
    <UNotifications />
  </div>
</template>
