<script setup lang="ts">
import { delay, merge } from 'es-toolkit'
import mockAmal from '#test-mocks/business-extended/json/amalgamationApplication/for-correction.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Amalgamation - Correct' }]
})

const { tableState } = useManageAmalgamation()

const schema = getAmalgamationCorrectSchema()

const test = mockAmal.amalgamation.amalgamatingBusinesses
test.map(d => {
  const parsed = schema.parse(d)
  console.log('ORIGINAL: ', d)
  console.log('PARSED: ', parsed)
  console.log('MERGED: ', merge(d, parsed))
})

const activeAmal = ref<ActiveAmalgamationCorrectSchema | undefined>(undefined)
const loading = ref(false)

const data: TableBusinessState<AmalgamationTableRow>[] = [
  {
    new: {
      id: '13456',
      isEditing: false,
      actions: [],
      legalName: '0888620 B.C. LTD.',
      identifier: 'BC0888620',
      legalType: 'BC',
      mailingAddress: {
        addressCity: 'Victoria',
        addressCountry: 'CA',
        addressRegion: 'BC',
        addressType: 'mailing',
        deliveryInstructions: '',
        id: 5521565,
        postalCode: 'V8W 3E6',
        streetAddress: '200-940 Blanshard St',
        streetAddressAdditional: ''
      },
      role: 'amalgamating'
    },
    old: {
      id: '13456',
      isEditing: false,
      actions: [],
      legalName: '0888620 B.C. LTD.',
      identifier: 'BC0888620',
      legalType: 'BC',
      mailingAddress: {
        addressCity: 'Victoria',
        addressCountry: 'CA',
        addressRegion: 'BC',
        addressType: 'mailing',
        deliveryInstructions: '',
        id: 5521565,
        postalCode: 'V8W 3E6',
        streetAddress: '200-940 Blanshard St',
        streetAddressAdditional: ''
      },
      role: 'amalgamating'
    }
  },
  {
    new: {
      id: '1324546587463',
      isEditing: false,
      actions: [],
      legalName: 'ALBANIA CORP',
      identifier: 'AL12345',
      foreignJurisdiction: {
        country: 'AL',
        region: null
      },
      role: 'amalgamating'
    },
    old: {
      id: '1324546587463',
      isEditing: false,
      actions: [],
      legalName: 'ALBANIA CORP',
      identifier: 'AL12345',
      foreignJurisdiction: {
        country: 'AL',
        region: null
      },
      role: 'amalgamating'
    }
  },
  {
    new: {
      id: '13245464536587463',
      isEditing: false,
      actions: [],
      legalName: 'REALLY LONG COMPANY 12345',
      identifier: 'NB12345',
      foreignJurisdiction: {
        country: 'CA',
        region: 'NB'
      },
      role: 'amalgamating'
    },
    old: {
      id: '13245464536587463',
      isEditing: false,
      actions: [],
      legalName: 'REALLY LONG COMPANY 12345',
      identifier: 'NB12345',
      foreignJurisdiction: {
        country: 'CA',
        region: 'NB'
      },
      role: 'amalgamating'
    }
  }]

onMounted(async () => {
  try {
    loading.value = true
    await delay(1500)
    tableState.value = data // formatCourtOrdersSection(mockCourtOrders.courtOrders as unknown as CourtOrderResponse[])
  } catch {
    // should never happen
    console.error('Error initializing mock data')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Amalgamation - Correct' }"
      ui-body="p-10"
    >
      <ManageAmalgamation
        v-model:active-amal="activeAmal"
        variant="correct"
        :loading
      />
    </ConnectPageSection>
  </UContainer>
</template>
