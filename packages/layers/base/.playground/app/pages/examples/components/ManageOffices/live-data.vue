<script setup lang="ts">
// Get businesses with at least 2 different Offices
// SELECT
//   b.id AS business_id,
//   b.identifier,
//   COUNT(DISTINCT o.office_type) AS office_type_count,
//   ARRAY_AGG(DISTINCT o.office_type) AS office_types
// FROM
//   businesses b
// JOIN
//   offices o ON b.id = o.business_id
// GROUP BY
//   b.id,
//   b.identifier
// HAVING
//   COUNT(DISTINCT o.office_type) > 1
// ORDER BY
//   office_type_count DESC
// LIMIT 10;

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Offices (Live Data)' }]
})

const query = useBusinessQuery()
const { tableState } = useManageOffices()
const identifier = ref('')
const allOfficeTypes = Object.values(OfficeType)

const {
  data,
  asyncStatus,
  error
} = query.addresses(identifier, {
  enabled: () => identifier.value.length === 9,
  staleTime: 5 * 60000
})

const businessesOfficeTypes = computed(() => Object.keys(data.value ?? {}))
const allowAddOfficeType = computed(() => allOfficeTypes.filter(t => !businessesOfficeTypes.value.includes(t))[0])

watch(data, (v) => {
  if (v) {
    tableState.value = formatOfficesSection(v)
  }
})

const activeOffice = ref<ActiveOfficeSchema | undefined>(undefined)
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Offices - Default' }"
      ui-body="p-10"
    >
      <div class="flex flex-col gap-4">
        <div v-if="!$connectAuth.authenticated" class="text-error font-bold">
          You must be authenticated to use this example.
        </div>
        <ConnectInput
          v-else
          id="business-identifier"
          v-model="identifier"
          label="Search by Business Identifier"
        />
        <ManageOffices
          v-model:active-office="activeOffice"
          :loading="asyncStatus === 'loading'"
          :subject="$t(`officeType.${allowAddOfficeType}`)"
          table-title="Offices"
          :allow-add-office-type
          :empty-text="error
            ? `Business ${identifier} could not be found`
            : 'No Offices added yet.'
          "
        />
      </div>
    </ConnectPageSection>
  </UContainer>
</template>
