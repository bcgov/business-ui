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
      name: "0888620 B.C. LTD.",
      number: "BC0888620",
      legalType: 'BC',
      "mailingAddress": {
          "addressCity": "Victoria",
          "addressCountry": "CA",
          "addressRegion": "BC",
          "addressType": "mailing",
          "deliveryInstructions": "",
          "id": 5521565,
          "postalCode": "V8W 3E6",
          "streetAddress": "200-940 Blanshard St",
          "streetAddressAdditional": ""
        }
    },
    old: {
      id: '13456',
      isEditing: false,
      actions: [],
      name: "0888620 B.C. LTD.",
      number: "BC0888620",
      legalType: 'BC',
      "mailingAddress": {
          "addressCity": "Victoria",
          "addressCountry": "CA",
          "addressRegion": "BC",
          "addressType": "mailing",
          "deliveryInstructions": "",
          "id": 5521565,
          "postalCode": "V8W 3E6",
          "streetAddress": "200-940 Blanshard St",
          "streetAddressAdditional": ""
        }
    }
  },
  {
    new: {
      id: '1324546587463',
      isEditing: false,
      actions: [],
      name: "ALBANIA CORP",
      number: "AL12345",
      jurisdiction: {
          "country": "AL",
          "region": null
        }
    },
    old: {
      id: '1324546587463',
      isEditing: false,
      actions: [],
      name: "ALBANIA CORP",
      number: "AL12345",
      jurisdiction: {
          "country": "AL",
          "region": null
        }
    },
  },
  {
    new: {
      id: '13245464536587463',
      isEditing: false,
      actions: [],
      name: "REALLY LONG COMPANY 12345",
      number: "NB12345",
      jurisdiction: {
          "country": "CA",
          "region": 'NB'
        }
    },
    old: {
      id: '13245464536587463',
      isEditing: false,
      actions: [],
      name: "REALLY LONG COMPANY 12345",
      number: "NB12345",
      jurisdiction: {
          "country": "CA",
          "region": 'NB'
        }
    },
  } ]
</script>

<template>
  <UContainer>
    <TableAmalgamation :data />
  </UContainer>
</template>