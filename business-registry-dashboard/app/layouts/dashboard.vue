<script setup lang="ts">
const { t } = useI18n()
const accountStore = useConnectAccountStore()
const config = useRuntimeConfig().public

useHead({
  title: accountStore.isStaffOrSbcStaff ? t('page.home.titleStaff') : t('page.home.title')
})

setBreadcrumbs([
  {
    to: `${config.registryHomeURL}dashboard?accountid=${accountStore.currentAccount.id}`,
    label: accountStore.isStaffOrSbcStaff ? t('labels.bcRegStaffDashboard') : t('labels.bcRegDashboard')
  },
  { label: accountStore.isStaffOrSbcStaff ? t('page.home.h1Staff') : t('page.home.h1') }
])
</script>
<template>
  <div class="mx-auto flex flex-col gap-4 px-2 py-8 sm:px-4 sm:py-10">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 md:flex-row md:justify-between">
        <div class="flex flex-col gap-4 md:flex-1">
          <h1 class="text-[32px]">
            {{ accountStore.isStaffOrSbcStaff ? t('page.home.h1Staff') : t('page.home.h1') }}
          </h1>

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
                :to="`${config.nrURL}${accountStore.currentAccount.id.toString()}`"
              />
            </UTooltip>
          </div>
        </ClientOnly>
      </div>
      <HelpTextSection />
    </div>

    <slot /> <!-- This is where the page content will be injected -->
    <UModals />
    <UNotifications />
  </div>
</template>
