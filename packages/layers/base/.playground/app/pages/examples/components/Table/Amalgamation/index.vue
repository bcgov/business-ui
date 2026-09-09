<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ to: '/', label: 'Examples' }, { label: 'TableAmalgamation' }]
})

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
</script>

<template>
  <UContainer>
    <TableAmalgamation :data />
  </UContainer>
</template>
