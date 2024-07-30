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
    key: 'state',
    label: 'Status'
    // sortable: true
  },
  {
    key: 'legalType',
    label: 'Type'
    // sortable: true
  },
  {
    key: 'identifier',
    label: 'Number'
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
</script>
<template>
  <div class="mx-auto flex flex-col gap-4 px-4 py-10">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 md:flex-row md:justify-between">
        <div class="flex flex-col gap-4 md:flex-1">
          <!-- TODO: update i18n -->
          <SbcPageSectionH1 :heading="$t('page.home.h1')" />

          <!-- TODO: add i18n -->
          <p class="text-bcGovColor-midGray">
            Start B.C. based businesses and keep business records up to date.
          </p>
        </div>

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
    <div class="flex max-w-screen-sm flex-col gap-4">
      <!-- TODO: link search with query -->
      <!-- TODO: add i18n -->
      <UFormGroup
        label="Retrieve an existing business or active Name Request to manage:"
        help="For example: &quot;Joe&#39;s Plumbing Inc.&quot;, &quot;BC1234567&quot;, &quot;FM1234567&quot;"
        class="max-h-fit max-w-fit"
      >
        <UInput
          variant="bcGov"
          placeholder="My business name, incorporation number or registration number"
          :ui="{ base: 'bg-white' }"
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
        :ui="{ fieldset: 'flex gap-4' }"
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
