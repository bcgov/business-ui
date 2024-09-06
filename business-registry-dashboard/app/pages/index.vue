<script setup lang="ts">
const { t } = useI18n()
const accountStore = useConnectAccountStore()
const nrWebUrl = useRuntimeConfig().public.nrURL
const affStore = useAffiliationsStore()

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

const searchType = ref<'reg' | 'namex'>('reg')
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
    <div class="-mt-4 flex max-w-screen-sm flex-col gap-4">
      <UFormGroup
        :label="$t('page.home.busOrNRSearch.label')"
        :help="$t('page.home.busOrNRSearch.help')"
        :ui="{
          label: {
            base: 'block font-normal text-gray-700 dark:text-gray-200'
          },
          help: 'mt-2 text-xs text-gray-600',
        }"
      >
        <AsyncComboBox
          :key="searchType"
          :search-fn="searchType === 'reg' ? regSearch : namexSearch"
          :id-attr="searchType === 'reg' ? 'identifier' : 'nrNum'"
          :value-attr="searchType === 'reg' ? 'name' : 'nrNum'"
          :text="{ placeholder: $t(`search.${searchType}.placeholder`), arialabel: $t(`search.${searchType}.arialabel`)}"
          @select="affStore.handleManageBusinessOrNameRequest(searchType, $event)"
        >
          <template #empty>
            <div class="flex flex-col gap-2 px-4 py-2">
              <span class="font-semibold">{{ $t(`search.${searchType}.empty.title`) }}</span>
              <span>{{ $t(`search.${searchType}.empty.content`) }}</span>
            </div>
          </template>
          <template #item="{ item }">
            <div class="flex items-center justify-between gap-2">
              <div class="max-w-36 flex-1">
                <span>{{ searchType === 'reg' ? item.identifier : item.nrNum }}</span>
              </div>
              <div v-if="searchType === 'reg'" class="flex-1">
                <span>{{ item.name }}</span>
              </div>
              <div v-else class="flex flex-1 flex-col gap-1">
                <span v-for="name in item.names" :key="name">{{ name }}</span>
              </div>
              <div class="text-right">
                <span class="text-sm text-blue-500">{{ $t('words.select') }}</span>
              </div>
            </div>
          </template>
        </AsyncComboBox>
      </UFormGroup>

      <URadioGroup
        v-model="searchType"
        :legend="$t('page.home.busOrNRSearch.opts.legend')"
        :options="[{value: 'reg', label: $t('page.home.busOrNRSearch.opts.existingBus')}, {value: 'namex', label: $t('page.home.busOrNRSearch.opts.nr')}]"
        :ui="{
          fieldset: 'flex gap-4',
          legend: 'sr-only',
        }"
        :ui-radio="{
          label: 'text-base font-medium text-bcGovColor-midGray dark:text-gray-200',
          base: 'size-5',
          container: 'flex items-center h-full',
        }"
      />
    </div>

    <TableAffiliatedEntity />

    <UModals />
    <UNotifications />
  </div>
</template>
