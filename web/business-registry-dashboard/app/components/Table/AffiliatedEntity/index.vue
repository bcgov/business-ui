<script setup lang="ts">
const brdModal = useBrdModals()
const affStore = useAffiliationsStore()
const ldStore = useConnectLaunchdarklyStore()

onMounted(async () => {
  await affStore.loadAffiliations()
})

// Watch for newly added businesses or name requests to highlight them temporarily
watch(
  () => affStore.newlyAddedIdentifier,
  () => {
    const firstResult = affStore.filteredResults?.[0] as any
    const newIdentifier = affStore.newlyAddedIdentifier

    // Skip if no results or no new identifier
    if (!firstResult) { return }

    // If the first result matches the newly added business or name request, highlight it
    if (newIdentifier && (firstResult.businessIdentifier === newIdentifier || firstResult.nrNumber === newIdentifier)) {
      firstResult.class = 'bg-[#E8F5E9]'

      // Remove highlight and clear identifier
      setTimeout(() => {
        affStore.newlyAddedIdentifier = ''
      }, 6000)
    } else {
      // Clear any existing highlight
      firstResult.class = ''
    }
  },
  { immediate: true }
)

// Computed properties for pagination button states
const isPreviousDisabled = computed(() =>
  affStore.affiliations.pagination.page === 1 || affStore.affiliations.loading
)

const isNextDisabled = computed(() =>
  !affStore.affiliations.hasMore || affStore.affiliations.loading
)

/**
 * This function transforms alert details, handling two important cases:
 * 1. For FUTURE_EFFECTIVE alerts: Converts the simple enum value to a complex object with date info
 * 2. Preserves all other alert types unchanged
 * The UI relies on this function to ensure future effective dates are properly formatted.
 * @param details details to map
 * @param row row to map details to
 * @returns mapped details with effective date
 */
const mapDetailsWithEffectiveDate = (details: any[], row: any) => {
  return details.map(detail =>
    detail === EntityAlertTypes.FUTURE_EFFECTIVE
      ? { type: EntityAlertTypes.FUTURE_EFFECTIVE, data: { effectiveDate: row.effectiveDate } }
      : detail
  )
}
</script>
<template>
  <SbcPageSectionCard>
    <template #header-left>
      <h2 class="text-base font-normal">
        <template v-if="ldStore.ldInitialized">
          <ConnectI18nHelper v-if="!affStore.enablePagination" translation-path="labels.myList" :count="affStore.affiliations.count" />
          <ConnectI18nHelper v-else translation-path="labels.myListWithPagination" />
        </template>
      </h2>
    </template>
    <!-- columns to show dropdown -->
    <template #header-right>
      <USelectMenu
        v-model="affStore.selectedColumns"
        :options="affStore.optionalColumns"
        option-attribute="label"
        multiple
        selected-icon="hidden"
        @change="affStore.setColumns"
      >
        <template #default="{ open }">
          <UButton
            color="white"
            class="h-[42px] w-[192px] flex-1 justify-between text-gray-700"
            :aria-label="$t('btn.colsToShow.aria', { count: affStore.selectedColumns.length })"
          >
            <span>{{ $t('btn.colsToShow.label') }}</span>
            <UIcon
              name="i-mdi-caret-down"
              class="size-5 text-gray-700 transition-transform"
              :class="[open && 'rotate-180']"
            />
          </UButton>
        </template>

        <template #option="{ option, selected }">
          <div class="flex cursor-pointer items-center gap-2 pb-1">
            <UCheckbox
              :model-value="selected"
              :aria-label="$t('btn.colsToShow.checkbox.aria', { column: option.label })"
              class="pointer-events-none"
            />
            <span class="pt-1">{{ option.label }}</span>
          </div>
        </template>
      </USelectMenu>
    </template>
    <!-- affiliations table -->
    <UTable
      :columns="affStore.visibleColumns"
      :rows="affStore.filteredResults"
      :loading="affStore.affiliations.loading"
      :ui="{
        wrapper: 'relative overflow-x-auto h-[512px]',
        thead: 'sticky top-0 bg-white z-10',
        th: {
          padding: 'px-0 py-0'
        },
        td: {
          base: `
            /* Default text handling */
            whitespace-normal
            align-top

            /* Standard column width constraints */
            w-48
            min-w-[192px]
            max-w-[192px]

            /* Wider first column for business names */
            [&:first-child]:min-w-[250px]
            [&:first-child]:max-w-[250px]

            /* Wider third column for type */
            [&:nth-child(3)]:min-w-[230px]
            [&:nth-child(3)]:max-w-[230px]
          `,
          padding: 'px-4 py-4',
          color: 'text-bcGovColor-midGray',
          font: '',
          size: 'text-sm',
        }
      }"
    >
      <!-- Empty state template (Table is empty) -->
      <template #empty-state>
        <div class="flex flex-col items-center justify-center gap-4 py-14">
          <UIcon
            v-if="!affStore.affiliations.error"
            name="i-heroicons-circle-stack-20-solid"
            class="size-6 text-gray-400"
          />
          <div class="flex flex-col items-center">
            <TableAffiliatedEntityAffiliationLoadingError
              v-if="affStore.affiliations.error"
              @refresh="affStore.loadAffiliations()"
            />
            <p v-else-if="affStore.affiliations.results.length === 0" class="text-center text-sm text-bcGovColor-darkGray">
              {{ $t('labels.noAffiliationRecords.line1') }}
              <br>
              {{ $t('labels.noAffiliationRecords.line2') }}
            </p>
            <p v-else class="text-sm text-bcGovColor-darkGray">
              {{ $t('labels.noAffiliationRecordsFiltered') }}
            </p>
          </div>
        </div>
      </template>
      <!-- start table header slots -->
      <!-- business name header -->
      <template #legalName-header>
        <TableColumnHeader
          :label="$t('labels.busName')"
          :clear-button="{
            show: affStore.affiliations.filters.businessName !== '',
            tooltip: $t('table.affiliation.filter.busName.clear.tooltip'),
            aria: $t('table.affiliation.filter.busName.clear.aria'),
            hideTooltip: true
          }"
          @clear="affStore.affiliations.filters.businessName = ''"
        >
          <UInput
            v-model="affStore.affiliations.filters.businessName"
            variant="bcGovSm"
            :placeholder="$t('table.affiliation.filter.busName.placeholder')"
            :aria-label="$t('table.affiliation.filter.busName.aria')"
            @keydown.enter.prevent="affStore.loadAffiliations"
          />
        </TableColumnHeader>
      </template>

      <!-- business number header -->
      <template #identifier-header>
        <TableColumnHeader
          :label="$t('labels.number')"
          :clear-button="{
            show: affStore.affiliations.filters.businessNumber !== '',
            tooltip: $t('table.affiliation.filter.busNumber.clear.tooltip'),
            aria: $t('table.affiliation.filter.busNumber.clear.aria'),
            hideTooltip: true
          }"
          @clear="affStore.affiliations.filters.businessNumber = ''"
        >
          <UInput
            v-model="affStore.affiliations.filters.businessNumber"
            variant="bcGovSm"
            :placeholder="$t('table.affiliation.filter.busNumber.placeholder')"
            :aria-label="$t('table.affiliation.filter.busNumber.aria')"
            @keydown.enter.prevent="affStore.loadAffiliations"
          />
        </TableColumnHeader>
      </template>

      <!-- business type header -->
      <template #legalType-header>
        <TableColumnHeader
          :label="$t('labels.type')"
          :clear-button="{
            show: affStore.affiliations.filters.type.length > 0,
            tooltip: $t('table.affiliation.filter.legalType.clear.tooltip'),
            aria: $t('table.affiliation.filter.legalType.clear.aria'),
            hideTooltip: true
          }"
          @clear="affStore.affiliations.filters.type = []"
        >
          <MultiSelectTypeAhead
            v-model="affStore.affiliations.filters.type"
            :options="affStore.typeOptions"
            :section-break-before="affStore.typeOptionsSectionBreakBefore"
            :placeholder="$t('table.affiliation.filter.legalType.placeholder')"
            :disabled="affStore.affiliations.loading"
            :label="$t('table.affiliation.filter.legalType.aria', {
              filter: affStore.affiliations.filters.type.length
                ? (affStore.affiliations.filters.type.length > 1
                  ? $t('words.Multiple')
                  : affStore.affiliations.filters.type[0])
                : $t('words.none')
            })"
          />
        </TableColumnHeader>
      </template>

      <!-- business state header -->
      <template #state-header>
        <TableColumnHeader
          :label="$t('labels.status')"
          :clear-button="{
            show: affStore.affiliations.filters.status.length > 0,
            tooltip: $t('table.affiliation.filter.busStates.clear.tooltip'),
            aria: $t('table.affiliation.filter.busStates.clear.aria'),
            hideTooltip: true
          }"
          @clear="affStore.affiliations.filters.status = []"
        >
          <MultiSelectTypeAhead
            v-model="affStore.affiliations.filters.status"
            :options="affStore.statusOptions"
            :section-break-before="affStore.statusOptionsSectionBreakBefore"
            :placeholder="$t('table.affiliation.filter.busStates.placeholder')"
            :disabled="affStore.affiliations.loading"
            :label="$t('table.affiliation.filter.busStates.aria', {
              filter: affStore.affiliations.filters.status.length
                ? (affStore.affiliations.filters.status.length > 1
                  ? $t('words.Multiple')
                  : affStore.affiliations.filters.status[0])
                : $t('words.none')
            })"
          />
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
              v-if="affStore.hasFilters"
              variant="outline"
              :label="$t('btn.clearFilters')"
              icon="i-mdi-close"
              :block="true"
              trailing
              @click="affStore.resetFilters"
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
          >
            <div
              v-for="(nrName, i) in row.nameRequest.names"
              :key="`nrName: ${i}`"
              class="table pb-1"
            >
              <UIcon
                v-if="isRejectedName(nrName)"
                class="mr-1 size-4 align-middle text-red-500"
                name="i-mdi-close"
                aria-hidden="true"
              />
              <UIcon
                v-if="isApprovedName(nrName)"
                class="mr-1 size-4 align-middle text-green-500"
                name="i-mdi-check"
                aria-hidden="true"
              />
              <div
                class="table-cell align-top font-semibold"
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
            class="font-semibold"
          >
            {{ affiliationName(row) }}
          </strong>
        </span>

        <div
          v-if="row.affiliationInvites"
          id="affiliationInvitesStatus"
          class="flex flex-col"
        >
          <span class="flex items-center align-middle">
            <UIcon
              class="mr-1 size-5 self-start"
              :class="getAffiliationInvitationStatus(row.affiliationInvites) === AffiliationInvitationStatus.Expired
                ? 'text-red-500' : 'text-blue-500'"
              :name="getAffiliationInvitationStatus(row.affiliationInvites) === AffiliationInvitationStatus.Expired
                ? 'i-mdi-alert' : 'i-mdi-account-cog'"
            />
            <p class="mb-0 text-xs">
              <!-- eslint-disable vue/no-v-html -->
              <span v-html="getRequestForAuthorizationStatusText(row.affiliationInvites)" />
            </p>
          </span>
        </div>
      </template>

      <!-- business identifier table cell -->
      <template #identifier-data="{ row }">
        <span>{{ number(row) }}</span>
      </template>

      <!-- business legal type table cell  -->
      <template #legalType-data="{ row }">
        <div class="inline-block font-semibold">
          {{ affiliationType(row) }}
        </div>
        <!-- Need to keep the NR type separate or else the table filter treats each distinctly. See PR 2389 -->
        <div
          v-if="isNameRequest(row)"
          class="ml-1 inline-block font-semibold"
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
            :details="mapDetailsWithEffectiveDate(getDetails(row), row)"
          />
          <TableAffiliatedEntityStatusDetails
            v-if="isProcessing(affiliationStatus(row))"
            icon="i-mdi-information-outline"
            :details="[EntityAlertTypes.PROCESSING]"
          />
        </span>
      </template>

      <!-- actions table cell -->
      <template #actions-data="{ row, index }">
        <TableAffiliatedEntityAction
          :item="row"
          :index="index"
          :affiliations="affStore.affiliations.results"
          @unknown-error="brdModal.openBusinessAddError()"
          @name-request-action-error="brdModal.nameRequestActionError()"
          @business-unavailable-error="brdModal.openBusinessUnavailableError"
          @remove-business="brdModal.openBusinessRemovalConfirmation"
          @resend-affiliation-invitation="affStore.resendAffiliationInvitation(row)"
          @show-manage-business-dialog="brdModal.openManageBusiness"
        />
      </template>
      <!-- end table cell slots -->
    </UTable>

    <!-- Pagination controls - only show when enabled and there are results, disable when loading -->
    <div v-if="affStore.enablePagination && affStore.affiliations.totalResults > 0">
      <!-- Divider to separate table from pagination controls -->
      <hr class="w-full border-t border-bcGovGray-300">

      <div class="flex flex-col items-center justify-between px-3 py-5 sm:flex-row">
        <div class="flex items-center">
          <span class="mr-2 text-sm text-bcGovColor-midGray">{{ $t('pagination.itemsPerPage') }}</span>
          <USelectMenu
            v-model="affStore.affiliations.pagination.limit"
            :options="affStore.paginationLimitOptions"
            option-attribute="label"
            value-attribute="value"
            :disabled="affStore.affiliations.loading"
            :ui="{ base: 'h-[42px]', trigger: 'flex items-center h-[42px]' }"
          />
        </div>

        <div class="flex items-center">
          <span class="mr-4 text-sm text-bcGovColor-midGray">
            {{ $t('pagination.page', { page: affStore.affiliations.pagination.page }) }}
          </span>
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-chevron-left-20-solid"
              :disabled="isPreviousDisabled"
              :variant="isPreviousDisabled ? 'soft' : 'outline'"
              :class="isPreviousDisabled ? 'text-gray-400' : ''"
              size="sm"
              @click="affStore.goToPreviousPage()"
            />
            <UButton
              icon="i-heroicons-chevron-right-20-solid"
              :disabled="isNextDisabled"
              :variant="isNextDisabled ? 'soft' : 'outline'"
              :class="isNextDisabled ? 'text-gray-400' : ''"
              size="sm"
              @click="affStore.goToNextPage()"
            />
          </div>
        </div>
      </div>
    </div>
  </SbcPageSectionCard>
</template>
