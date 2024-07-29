<script setup lang="ts">

defineProps<{
  appVersion: {
    ui: string
    api: string
  } | undefined
}>()

const links = [
  {
    label: 'SbcFooter.home',
    to: 'https://www.bcregistry.gov.bc.ca',
    target: '_blank'
  },
  {
    label: 'SbcFooter.disclaimer',
    to: 'https://www2.gov.bc.ca/gov/content/home/disclaimer',
    target: '_blank'
  },
  {
    label: 'SbcFooter.privacy',
    to: 'https://www2.gov.bc.ca/gov/content/home/privacy',
    target: '_blank'
  },
  {
    label: 'SbcFooter.ally',
    to: 'https://www2.gov.bc.ca/gov/content/home/accessibility',
    target: '_blank'
  },
  {
    label: 'SbcFooter.copyright',
    to: 'https://www2.gov.bc.ca/gov/content/home/copyright',
    target: '_blank'
  }
]
</script>

<template>
  <footer
    id="sbc-main-footer"
    data-testid="sbc-main-footer"
    class="border-t-2 border-bcGovColor-navDivider bg-bcGovColor-footer p-2 dark:border-t dark:bg-bcGovColor-darkGray"
  >
    <div class="mx-auto flex max-w-[1360px] items-center justify-between">
      <nav :aria-label="$t('SbcFooter.navLabel')" class="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to === '/' ? `/${$i18n.locale}` : link.to"
          :target="link.target"
          class="rounded p-1 text-sm text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {{ $t(link.label) }}
        </NuxtLink>
      </nav>
      <div class="flex flex-col">
        <span class="whitespace-nowrap italic text-bcGovColor-navDivider">{{ $t('SbcFooter.bcApp') }}</span>
        <ClientOnly>
          <div v-if="appVersion" class="flex items-center gap-1">
            <span class="text-xs text-white"> Version: {{ appVersion.ui }}</span>
            <UTooltip>
              <UIcon name="i-mdi-info-outline" class="size-4 shrink-0 text-white" />
              <template #text>
                <div class="flex flex-col">
                  <span> UI: v{{ appVersion.ui }}</span>
                  <span> API: v{{ appVersion.api }}</span>
                </div>
              </template>
            </UTooltip>
          </div>
        </ClientOnly>
      </div>
    </div>
  </footer>
</template>
