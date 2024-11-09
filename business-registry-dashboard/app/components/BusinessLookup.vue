<script setup lang="ts">
const affStore = useAffiliationsStore()

const searchType = ref<'reg' | 'namex'>('reg')
</script>
<template>
  <div class="flex max-w-screen-sm flex-col gap-4">
    <UFormGroup
      :label="$t('page.home.busOrNRSearch.label')"
      :help="$t('page.home.busOrNRSearch.help')"
      :ui="{
        label: {
          base: 'block font-normal text-gray-700 dark:text-gray-200'
        },
        help: 'mt-2 ml-4 text-xs text-bcGovColor-midGray',
      }"
    >
      <AsyncComboBox
        :key="searchType"
        :search-fn="searchType === 'reg' ? regSearch : namexSearch"
        :id-attr="searchType === 'reg' ? 'identifier' : 'nrNum'"
        :value-attr="searchType === 'reg' ? 'name' : 'nrNum'"
        :text="{ placeholder: $t(`search.${searchType}.placeholder`), arialabel: $t(`search.${searchType}.arialabel`)}"
        :disabled-config="{
          items: affStore.affiliations.results,
          comparisonAttrs: ['nrNum', 'businessIdentifier', 'identifier', 'nrNumber']
        }"
        @select="affStore.handleManageBusinessOrNameRequest(searchType, $event)"
      >
        <template #empty>
          <div class="flex flex-col gap-2 px-4 py-2">
            <span class="font-semibold text-bcGovColor-midGray">{{ $t(`search.${searchType}.empty.title`) }}</span>
            <span class="text-[#405057]">{{ $t(`search.${searchType}.empty.content`) }}</span>
          </div>
        </template>
        <template #item="{ item }">
          <div
            class="flex items-start justify-between gap-2"
            :class="[
              item.disabled ? 'text-[#2E7D32]' : 'text-bcGovColor-midGray',
              !item.disabled && 'hover:text-bcGovColor-activeBlue'
            ]"
          >
            <div class="max-w-36 flex-1 pt-[2px]">
              <span>{{ searchType === 'reg' ? item.identifier : item.nrNum }}</span>
            </div>
            <div v-if="searchType === 'reg'" class="flex-1">
              <span>{{ item.name }}</span>
            </div>
            <div v-else class="flex flex-1 flex-col gap-1">
              <span v-for="name in item.names" :key="name">{{ name }}</span>
            </div>
            <div v-if="!item.disabled" class="flex-1 pt-[2px] text-right">
              <span class="text-sm text-blue-500">{{ $t('words.select') }}</span>
            </div>
            <div v-else class="flex items-center justify-end pt-[2px] text-right text-sm text-green-600">
              <UIcon name="i-mdi-check" class="mr-1 size-5" />
              <span>{{ $t('words.Added') }}</span>
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
</template>
