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

const searchType = ref('reg')

const {
  affiliations,
  visibleColumns,
  optionalColumns,
  selectedColumns,
  setColumns,
  filteredResults,
  typeOptions,
  statusOptions,
  hasFilters,
  resetFilters,
  handleManageBusinessOrNameRequest
} = useAffiliations()
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
          @select="handleManageBusinessOrNameRequest(searchType, $event)"
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

      <!-- TODO: link with search query -->
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

    <SbcPageSectionCard :heading="$t('labels.myList', { count: affiliations.count })">
      <!-- columns to show dropdown -->
      <template #header-right>
        <!-- TODO: map dropdown items to come from table columns -->
        <USelectMenu
          v-slot="{ open }"
          v-model="selectedColumns"
          :options="optionalColumns"
          multiple
          :ui="{ trigger: 'flex items-center w-full h-[42px]' }"
          @change="setColumns"
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
      <ClientOnly>
        <!-- affiliations table -->
        <UTable
          :columns="visibleColumns"
          :rows="filteredResults"
          :loading="affiliations.loading"
          :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: $t('labels.noAffiliationRecords') }"
          :ui="{
            wrapper: 'relative overflow-x-auto h-[512px]',
            thead: 'sticky top-0 bg-white z-10',
            th: {
              padding: 'px-0 py-0'
            }
          }"
        >
          <!-- start table header slots -->
          <!-- business name header -->
          <template #legalName-header>
            <TableColumnHeader
              :label="$t('labels.busName')"
              :clear-button="{
                show: affiliations.filters.businessName !== '',
                tooltip: $t('table.affiliation.filter.busName.clear.tooltip'),
                aria: $t('table.affiliation.filter.busName.clear.aria')
              }"
              @clear="affiliations.filters.businessName = ''"
            >
              <UInput
                v-model="affiliations.filters.businessName"
                variant="bcGovSm"
                :placeholder="$t('table.affiliation.filter.busName.placeholder')"
                :aria-label="$t('table.affiliation.filter.busName.aria')"
              />
            </TableColumnHeader>
          </template>

          <!-- business number header -->
          <template #identifier-header>
            <TableColumnHeader
              :label="$t('labels.number')"
              :clear-button="{
                show: affiliations.filters.businessNumber !== '',
                tooltip: $t('table.affiliation.filter.busNumber.clear.tooltip'),
                aria: $t('table.affiliation.filter.busNumber.clear.aria')
              }"
              @clear="affiliations.filters.businessNumber = ''"
            >
              <UInput
                v-model="affiliations.filters.businessNumber"
                variant="bcGovSm"
                :placeholder="$t('table.affiliation.filter.busNumber.placeholder')"
                :aria-label="$t('table.affiliation.filter.busNumber.aria')"
              />
            </TableColumnHeader>
          </template>

          <!-- business type header -->
          <template #legalType-header>
            <TableColumnHeader
              :label="$t('labels.type')"
              :clear-button="{
                show: affiliations.filters.type !== '',
                tooltip: $t('table.affiliation.filter.legalType.clear.tooltip'),
                aria: $t('table.affiliation.filter.legalType.clear.aria')
              }"
              @clear="affiliations.filters.type = ''"
            >
              <USelectMenu
                v-slot="{ open }"
                v-model="affiliations.filters.type"
                :options="typeOptions"
                :ui="{ trigger: 'flex items-center w-full h-[42px]' }"
              >
                <UButton
                  variant="select_menu_trigger"
                  class="flex-1 justify-between text-gray-700"
                  :aria-label="$t('table.affiliation.filter.legalType.aria', { filter: affiliations.filters.type || $t('words.none') })"
                >
                  {{ affiliations.filters.type !== '' ? affiliations.filters.type : $t('table.affiliation.filter.legalType.placeholder') }}

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
                show: affiliations.filters.status !== '',
                tooltip: $t('table.affiliation.filter.busStates.clear.tooltip'),
                aria: $t('table.affiliation.filter.busStates.clear.aria')
              }"
              @clear="affiliations.filters.status = ''"
            >
              <USelectMenu
                v-slot="{ open }"
                v-model="affiliations.filters.status"
                :options="statusOptions"
                :ui="{ trigger: 'flex items-center w-full h-[42px]' }"
              >
                <UButton
                  variant="select_menu_trigger"
                  class="flex-1 justify-between text-gray-700"
                  :aria-label="$t('table.affiliation.filter.busStates.aria', { filter: affiliations.filters.status || $t('words.none') })"
                >
                  {{ affiliations.filters.status !== '' ? affiliations.filters.status : $t('table.affiliation.filter.busStates.placeholder') }}

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
              <div class="flex h-[42px] items-center">
                <UButton
                  variant="outline"
                  :label="$t('btn.clearFilters')"
                  icon="i-mdi-close"
                  trailing
                  :disabled="!hasFilters"
                  @click="resetFilters"
                />
              </div>
            </TableColumnHeader>
          </template>
          <!-- end table header slots -->

          <!-- start table cell slots -->
          <!-- business name table cell -->
          <template #legalName-data="{ row }">
            <span>
              <strong
                v-if="isNameRequest(row)"
                class="text-gray-900"
              >
                <div
                  v-for="(nrName, i) in row.nameRequest.names"
                  :key="`nrName: ${i}`"
                  class="table pb-1"
                >
                  <UIcon
                    v-if="isRejectedName(nrName)"
                    class="table-cell size-4 pr-1 align-top text-red-500"
                    name="i-mdi-close"
                    aria-hidden="true"
                  />
                  <UIcon
                    v-if="isApprovedName(nrName)"
                    class="table-cell size-4 pr-1 align-top text-green-500"
                    name="i-mdi-check"
                    aria-hidden="true"
                  />
                  <div
                    class="table-cell pl-2 align-top font-semibold"
                    aria-hidden="true"
                  >
                    {{ nrName.name }}
                  </div>
                  <span v-if="isApprovedName(nrName)" class="sr-only">{{ $t('table.affiliation.cell.name.approved', { name: nrName.name }) }}</span>
                  <span v-else-if="isRejectedName(nrName)" class="sr-only">{{ $t('table.affiliation.cell.name.rejected', { name: nrName.name }) }}</span>
                  <span v-else class="sr-only">{{ nrName.name }}</span>
                </div>
              </strong>
              <strong
                v-else
                class="font-semibold text-gray-900"
              >
                {{ affiliationName(row) }}
              </strong>
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
              :affiliations="affiliations.results"
              @unknown-error="() => console.log('unknown error emitted')"
              @business-unavailable-error="() => console.log('business unavailable error emitted')"
              @remove-affiliation-invitation="() => console.log('remove-affiliation-invitation emitted')"
              @remove-business="() => console.log('remove-business emitted')"
              @resend-affiliation-invitation="() => console.log('resend-affiliation-invitation emitted')"
              @show-manage-business-dialog="() => console.log('show-manage-business-dialog emitted')"
            />
          </template>
        <!-- end table cell slots -->
        </UTable>
      </ClientOnly>
    </SbcPageSectionCard>

    <UModals />
    <UNotifications />
  </div>
</template>
