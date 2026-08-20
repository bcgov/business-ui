<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  accounts: AuthorizedAccount[]
  loading: boolean
  error: boolean
}>()

const columns = [
  { key: 'name', label: t('table.authorizedAccounts.columns.accountName') },
  { key: 'dateAdded', label: t('table.authorizedAccounts.columns.dateAdded') }
]

/** Two premium accounts can share a name and differ only by branch, so the branch is part of the label. */
function accountLabel (account: AuthorizedAccount) {
  return account.branchName ? `${account.name} - ${account.branchName}` : account.name
}
</script>

<template>
  <SbcPageSectionCard>
    <template #header-left>
      <h2 class="text-base font-bold">
        {{ $t('table.authorizedAccounts.title', { count: props.accounts.length }) }}
      </h2>
    </template>

    <UTable
      :columns="columns"
      :rows="props.accounts"
      :loading="props.loading"
      :ui="{
        th: { padding: 'px-4 py-5' },
        td: { base: 'whitespace-normal align-top', padding: 'px-4 py-4' }
      }"
    >
      <template #name-data="{ row }">
        <div class="flex items-start gap-2">
          <UIcon
            :name="row.isBusinessAccount ? 'i-mdi-domain' : 'i-mdi-account-outline'"
            class="mt-0.5 size-5 shrink-0 text-gray-700"
            aria-hidden="true"
          />
          <span class="font-normal text-bcGovColor-midGray">{{ accountLabel(row) }}</span>
        </div>
      </template>

      <template #dateAdded-data="{ row }">
        <span class="text-bcGovColor-midGray">{{ datetimeStringToDateString(row.dateAdded) }}</span>
      </template>

      <template #empty-state>
        <div class="flex flex-col items-center justify-center gap-3 px-4 py-6">
          <span class="text-center text-gray-700">
            {{ props.error ? $t('table.authorizedAccounts.error') : $t('table.authorizedAccounts.empty') }}
          </span>
        </div>
      </template>
    </UTable>
  </SbcPageSectionCard>
</template>
