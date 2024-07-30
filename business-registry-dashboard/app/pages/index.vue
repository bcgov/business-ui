<script setup lang="ts">
const { t } = useI18n()
const accountStore = useConnectAccountStore()

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

const selected = ref('')

const columns = [
  {
    key: 'legalName',
    label: t('labels.busName')
    // sortable: true
  },
  {
    key: 'identifier',
    label: 'Number'
    // sortable: true
  },
  {
    key: 'legalType',
    label: 'Type'
    // sortable: true
  },
  {
    key: 'state',
    label: 'Status'
    // sortable: true
  },
  {
    key: 'actions',
    label: 'Actions'
  }
]

const config = useRuntimeConfig()
const authApiUrl = config.public.authApiURL

const { data: affiliations } = await useAsyncData('affiliations-table', () => {
  const { $keycloak } = useNuxtApp()
  return $fetch(`${authApiUrl}/orgs/${accountStore.currentAccount.id}/affiliations?new=true`, {
    headers: {
      Authorization: `Bearer ${$keycloak.token}`
    }
  })
}, { server: false, watch: [() => accountStore.currentAccount.id] })
console.log(affiliations.value)

const selectedColumns = ref([])

// const {
//   loadAffiliations,
//   // affiliations,
//   entityCount, clearAllFilters,
//   getHeaders, headers, type, status, updateFilter, typeDescription,
//   isNameRequest, nameRequestType, number, name, canUseNameRequest,
//   isTemporaryBusiness
// } = useAffiliations()

const busTypes = ['BC Sole Proprietorship', 'Name Request', 'Incorporation Application', 'Registration']
const selectedTypes = ref([])
</script>
<template>
  <div class="mx-auto flex flex-col gap-4 px-2 py-8 sm:px-4 sm:py-10">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 md:flex-row md:justify-between">
        <div class="flex flex-col gap-4 md:flex-1">
          <!-- TODO: update i18n -->
          <SbcPageSectionH1 :heading="$t('page.home.h1')" />

          <!-- TODO: add i18n -->
          <p class="text-gray-700">
            Start B.C. based businesses and keep business records up to date.
          </p>
        </div>

        <!-- TODO: add i18n -->
        <div class="flex-none">
          <UTooltip
            text="Go to Name Request to get started with a named or numbered business."
            :popper="{ arrow: true }"
          >
            <UButton
              label="Get Started with a B.C. Based Business"
              variant="outline"
              icon="i-mdi-domain"
              size="bcGov"
              class="w-full"
            />
          </UTooltip>
        </div>
      </div>
      <!-- TODO: add help text dropdown, use content? -->
      <!-- TODO: add i18n -->
      <UButton
        label="Help with Starting and Managing a Business"
        variant="link"
        icon="i-mdi-help-circle-outline"
        class="max-w-fit"
        :ui="{ icon: { size: { sm: 'size-6' } } }"
      />
    </div>
    <div class="-mt-4 flex max-w-screen-sm flex-col gap-4">
      <!-- TODO: link search with query -->
      <!-- TODO: add i18n -->
      <UFormGroup
        label="Retrieve an existing business or active Name Request to manage:"
        help="For example: &quot;Joe&#39;s Plumbing Inc.&quot;, &quot;BC1234567&quot;, &quot;FM1234567&quot;"
        :ui="{
          label: {
            base: 'block font-normal text-gray-700 dark:text-gray-200'
          },
          help: 'mt-2 text-xs text-gray-600',
        }"
      >
        <UInput
          variant="bcGovLg"
          placeholder="My business name, incorporation number or registration number"
          :ui="{
            base: 'bg-white',
            placeholder: 'placeholder-gray-400 placeholder:text-base',
            icon: {
              base: 'text-gray-600',
              size: { sm: 'size-6' }
            }
          }"
          icon="i-mdi-magnify"
          trailing
        />
      </UFormGroup>

      <!-- TODO: link with search query -->
      <!-- TODO: update legend and make sr only -->
      <!-- TODO: add i18n options -->
      <URadioGroup
        v-model="selected"
        legend="Choose something"
        :options="[{value: 'opt1', label: 'Existing business'}, {value: 'opt2', label: 'Name Request'}]"
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

    <SbcPageSectionCard heading="My List">
      <template #header-right>
        <!-- TODO: map dropdown items to come from table columns -->
        <USelectMenu
          v-model="selectedColumns"
          :options="columns"
          multiple
        />
      </template>

      <!-- affiliations table -->
      <UTable :columns :rows="affiliations?.entities ?? []">
        <!-- table header slots -->
        <!-- business name header -->
        <template #legalName-header>
          <TableColumnHeader
            :label="$t('labels.busName')"
            :clear-button="{
              show: false
            }"
          >
            <UInput
              variant="bcGovSm"
              :placeholder="$t('labels.name')"
            >
              <template #trailing>
                <UButton
                  v-show="q !== ''"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark-20-solid"
                  :padded="false"
                  @click="q = ''"
                />
              </template>
            </UInput>
          </TableColumnHeader>
        </template>

        <!-- business number header -->
        <template #identifier-header>
          <TableColumnHeader
            :label="$t('labels.number')"
            :clear-button="false"
          >
            <UInput
              variant="bcGovSm"
              :placeholder="$t('labels.number')"
            >
              <template #trailing>
                <UButton
                  v-show="q !== ''"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark-20-solid"
                  :padded="false"
                  @click="q = ''"
                />
              </template>
            </UInput>
          </TableColumnHeader>
        </template>

        <!-- business type header -->
        <template #legalType-header>
          <TableColumnHeader
            :label="$t('labels.type')"
            :clear-button="{
              show: selectedTypes.length > 0,
              tooltip: $t('btn.filterLegalType.clear.tooltip'),
              aria: $t('btn.filterLegalType.clear.aria')
            }"
            @clear="selectedTypes = []"
          >
            <USelectMenu
              v-slot="{ open }"
              v-model="selectedTypes"
              :options="busTypes"
              multiple
              :ui="{ trigger: 'flex items-center w-full h-[42px]' }"
            >
              <UButton
                variant="select_menu_trigger"
                class="flex-1 justify-between text-gray-700"
                :aria-label="$t('btn.filterLegalType.aria', { count: selectedTypes.length })"
              >
                {{ selectedTypes.length > 0 ? $t('btn.filterLegalType.selected', { count: selectedTypes.length }) : $t('btn.filterLegalType.placeholder') }}

                <UIcon name="i-mdi-caret-down" class="size-5 text-gray-700 transition-transform" :class="[open && 'rotate-180']" />
              </UButton>
            </USelectMenu>
          </TableColumnHeader>
        </template>

        <!-- business state header -->
        <template #state-header>
          <TableColumnHeader
            :label="$t('labels.status')"
            :clear-button="false"
          >
            <UInput
              variant="bcGovSm"
              :placeholder="$t('labels.name')"
            >
              <template #trailing>
                <UButton
                  v-show="q !== ''"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark-20-solid"
                  :padded="false"
                  @click="q = ''"
                />
              </template>
            </UInput>
          </TableColumnHeader>
        </template>

        <!-- business name column -->
        <template #name-data="{ row }">
          <span class="text-bcGovColor-darkGray">{{ row.name }}</span>
        </template>

        <!-- business type column -->
        <template #legalType-data="{ row }">
          {{ row.legalType }}
        <!-- <div class="gray-9 font-weight-bold d-inline-block">
            {{ type(item) }}
          </div> -->
        <!-- Need to keep the NR type separate or else the table filter treats each distinctly. See PR 2389 -->
        <!-- <div
            v-if="isNameRequest(item)"
            class="gray-9 font-weight-bold d-inline-block ml-1"
          >
            {{ nameRequestType(item) }}
          </div>
          <div>{{ typeDescription(item) }}</div> -->
        </template>
      </UTable>
    </SbcPageSectionCard>
  </div>
</template>
