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
const nrWebUrl = config.public.nrURL

const selectedColumns = ref([])

const {
  affiliations
  // clearAllFilters,
  // getHeaders, headers,
  // updateFilter,
} = useAffiliations()

const busTypes = ['BC Sole Proprietorship', 'Name Request', 'Incorporation Application', 'Registration']
const selectedTypes = ref([])

const busStates = ['Active', 'Expired', 'Draft']
const selectedStates = ref([])
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
      </div>

      <HelpTextSection />
    </div>
    <div class="-mt-4 flex max-w-screen-sm flex-col gap-4">
      <!-- TODO: link search with query -->
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
        <UInput
          variant="bcGovLg"
          :placeholder="$t('page.home.busOrNRSearch.placeholder')"
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
      <URadioGroup
        v-model="selected"
        :legend="$t('page.home.busOrNRSearch.opts.legend')"
        :options="[{value: 'opt1', label: $t('page.home.busOrNRSearch.opts.existingBus')}, {value: 'opt2', label: $t('page.home.busOrNRSearch.opts.nr')}]"
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

    <SbcPageSectionCard :heading="$t('labels.myList', { count: affiliations.count })">
      <!-- columns to show dropdown -->
      <template #header-right>
        <!-- TODO: map dropdown items to come from table columns -->
        <USelectMenu
          v-slot="{ open }"
          v-model="selectedColumns"
          :options="columns"
          multiple
          :ui="{ trigger: 'flex items-center w-full h-[42px]' }"
        >
          <UButton
            color="white"
            class="flex-1 justify-between text-gray-700"
            :aria-label="$t('btn.colsToShow.aria', { count: selectedColumns.length })"
          >
            <span>{{ $t('btn.colsToShow.label') }}</span>

            <UIcon name="i-mdi-caret-down" class="size-5 text-gray-700 transition-transform" :class="[open && 'rotate-180']" />
          </UButton>
        </USelectMenu>
      </template>

      <!-- affiliations table -->
      <!-- TODO: add affiliations to rows -->
      <UTable
        :columns
        :rows="affiliations.results"
        :ui="{
          th: {
            padding: 'px-0 py-3.5'
          },
        }"
      >
        <!-- start table header slots -->
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
                  v-show="true"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark-20-solid"
                  :padded="false"
                  @click="() => console.log('clear name input clicked')"
                />
              </template>
            </UInput>
          </TableColumnHeader>
        </template>

        <!-- business number header -->
        <template #identifier-header>
          <TableColumnHeader
            :label="$t('labels.number')"
            :clear-button="{ show: false }"
          >
            <UInput
              variant="bcGovSm"
              :placeholder="$t('labels.number')"
            >
              <template #trailing>
                <UButton
                  v-show="true"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark-20-solid"
                  :padded="false"
                  @click="() => console.log('clear number input clicked')"
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
            :clear-button="{
              show: selectedStates.length > 0,
              tooltip: $t('btn.filterBusStates.clear.tooltip'),
              aria: $t('btn.filterBusStates.clear.aria')
            }"
            @clear="selectedStates = []"
          >
            <USelectMenu
              v-slot="{ open }"
              v-model="selectedStates"
              :options="busStates"
              multiple
              :ui="{ trigger: 'flex items-center w-full h-[42px]' }"
            >
              <UButton
                variant="select_menu_trigger"
                class="flex-1 justify-between text-gray-700"
                :aria-label="$t('btn.filterBusStates.aria', { count: selectedStates.length })"
              >
                {{ selectedStates.length > 0 ? $t('btn.filterBusStates.selected', { count: selectedStates.length }) : $t('btn.filterBusStates.placeholder') }}

                <UIcon name="i-mdi-caret-down" class="size-5 text-gray-700 transition-transform" :class="[open && 'rotate-180']" />
              </UButton>
            </USelectMenu>
          </TableColumnHeader>
        </template>

        <!-- actions header -->
        <template #actions-header>
          <TableColumnHeader
            :label="$t('labels.actions')"
            :clear-button="{ show: false }"
          >
            <div class="h-[42px]" />
          </TableColumnHeader>
        </template>
        <!-- end table header slots -->

        <!-- start table cell slots -->
        <!-- business name table cell -->
        <template #legalName-data="{ row }">
          <span>
            <b
              v-if="isNameRequest(row)"
              class="text-gray-900"
            >
              <b
                v-for="(nrName, i) in row.nameRequest.names"
                :key="`nrName: ${i}`"
                class="table pb-1"
              >
                <UIcon
                  v-if="isRejectedName(nrName)"
                  class="table-cell size-4 pr-1 align-top text-red-500"
                  name="i-mdi-close"
                />
                <UIcon
                  v-if="isApprovedName(nrName)"
                  color="green"
                  class="table-cell size-4 pr-1 align-top text-green-500"
                  name="i-mdi-check"
                />
                <div class="table-cell pl-2 align-top font-semibold">{{ nrName.name }}</div>
              </b>
            </b>
            <b
              v-else
              class="font-semibold text-gray-900"
            >
              {{ name(row) }}
            </b>
          </span>

          <!-- TODO: add affiliation invitation status -->
          <!-- <span
            id="affiliationInvitesStatus"
            class="align-top"
          >
            <UIcon
              class="mt-1 pr-1"
              :class="getAffiliationInvitationStatus(row.affiliationInvites) === AffiliationInvitationStatus.Expired
                ? 'text-red-500' : 'text-blue-500'"
              :name="getAffiliationInvitationStatus(row.affiliationInvites) === AffiliationInvitationStatus.Expired
                ? 'i-mdi-alert' : 'i-mdi-account-cog'"
            />
            <p class="mb-0 text-xs">
              <span v-html="getRequestForAuthorizationStatusText(row.affiliationInvites)" />
            </p>
          </span> -->
        </template>

        <!-- business identifier table cell -->
        <template #identifier-data="{ row }">
          <span>{{ number(row) }}</span>
        </template>

        <!-- business legal type table cell  -->
        <template #legalType-data="{ row }">
          <div class="inline-block font-semibold text-gray-900">
            {{ affiliationType(row) }}
          </div>
          <!-- Need to keep the NR type separate or else the table filter treats each distinctly. See PR 2389 -->
          <div
            v-if="isNameRequest(row)"
            class="ml-1 inline-block font-semibold text-gray-900"
          >
            {{ nameRequestType(row) }}
          </div>
          <div>{{ typeDescription(row) }}</div>
        </template>

        <!-- business status table cell -->
        <template #state-data="{ row }">
          <span class="inline-flex gap-1">
            {{ affiliationStatus(row) }}
            <!-- TODO: add aria describedby to text with tooltip info -->
            <TableAffiliatedEntityStatusDetails
              v-if="getDetails(row).length > 0"
              icon="i-mdi-alert"
              :details="getDetails(row)"
            />
            <TableAffiliatedEntityStatusDetails
              v-if="isProcessing(affiliationStatus(row))"
              icon="i-mdi-information-outline"
              :details="[EntityAlertTypes.PROCESSING]"
            />
          </span>
        </template>

        <!-- actions table cell -->
        <!-- TODO: add events to actions component -->
        <template #actions-data="{ row, index }">
          <TableAffiliatedEntityAction
            :item="row"
            :index="index"
          />
          <!-- <AffiliationAction
            :item="row"
            :index="index"
            @unknown-error="$emit('unknown-error', $event)"
            @remove-affiliation-invitation="$emit('remove-affiliation-invitation', $event)"
            @remove-business="$emit('remove-business', $event)"
            @business-unavailable-error="$emit('business-unavailable-error', $event)"
            @resend-affiliation-invitation="$emit('resend-affiliation-invitation', $event)"
            @show-manage-business-dialog="$emit('show-manage-business-dialog', $event)"
          /> -->
        </template>
        <!-- end table cell slots -->
      </UTable>
    </SbcPageSectionCard>
  </div>
</template>
