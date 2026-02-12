<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

definePageMeta({
  layout: 'connect-auth'
})

useHead({
  title: 'Business Base Layer Examples'
})

const localePath = useLocalePath()

const layoutExamples: DropdownMenuItem[] = [
  {
    label: 'Filing Layout',
    to: localePath('/examples/layouts/filing')
  }
]

const componentExamples: DropdownMenuItem[] = [
  {
    label: 'BusinessAlerts',
    to: localePath('/examples/components/BusinessAlerts')
  },
  {
    label: 'BusinessLedger',
    to: localePath('/examples/components/BusinessLedger')
  },
  {
    label: 'BusinessLedgerWrapper',
    to: localePath('/examples/components/BusinessLedger/Wrapper')
  },
  {
    label: 'ManageOffices',
    children: [
      {
        to: localePath('/examples/components/ManageOffices'),
        label: 'Default'
      },
      {
        label: 'Allowed Actions',
        children: [
          // { // FUTURE: complete once 'add' functionality complete in ManageOffices
          //   label: 'Add',
          //   to: localePath('/examples/components/ManageOffices/allowed-actions/add')
          // },
          {
            label: 'Edits',
            to: localePath('/examples/components/ManageOffices/allowed-actions/edits')
          },
          {
            label: 'Remove',
            to: localePath('/examples/components/ManageOffices/allowed-actions/remove')
          },
          {
            label: 'None',
            to: localePath('/examples/components/ManageOffices/allowed-actions/none')
          }
        ]
      }
    ]
  },
  {
    label: 'ManageParties',
    children: [
      {
        to: localePath('/examples/components/ManageParties'),
        label: 'Default'
      },
      {
        label: 'Allowed Actions',
        children: [
          {
            label: 'Add',
            to: localePath('/examples/components/ManageParties/allowed-actions/add')
          },
          {
            label: 'Remove',
            to: localePath('/examples/components/ManageParties/allowed-actions/remove')
          },
          {
            label: 'Edits',
            to: localePath('/examples/components/ManageParties/allowed-actions/edits')
          },
          {
            label: 'Mixed',
            to: localePath('/examples/components/ManageParties/allowed-actions/mixed')
          }
        ]
      }
    ]
  },
  {
    label: 'ManageShareStructure',
    children: [
      {
        to: localePath('/examples/components/ManageShareStructure'),
        label: 'Default'
      }
    ]
  },
  {
    label: 'ModalStaffPay',
    to: localePath('/examples/components/Modal/StaffPay')
  },
  {
    label: 'FormDocumentDelivery',
    to: localePath('/examples/components/Form/DocumentDelivery')
  },
  {
    label: 'FormDocumentId',
    to: localePath('/examples/components/Form/DocumentId')
  },
  {
    label: 'FormDocumentUpload',
    to: localePath('/examples/components/Form/DocumentUpload')
  },
  {
    label: 'FormDocumentUpload: Invalid',
    to: localePath('/examples/components/Form/DocumentUpload/invalid')
  },
  {
    label: 'FormPreExistingCompanyRevisions',
    to: localePath('/examples/components/Form/PreExistingCompanyProvisions')
  },
  {
    label: 'Table Examples',
    children: [
      {
        label: 'TableBusiness',
        to: localePath('/examples/components/Table/Business')
      },
      {
        label: 'TableParty',
        to: localePath('/examples/components/Table/Party')
      },
      {
        label: 'TableShareStructure',
        to: localePath('/examples/components/Table/ShareStructure')
      }
    ]
  }
]

const serviceExamples: DropdownMenuItem[] = [
  {
    label: 'Business Service',
    to: localePath('/examples/services/business')
  }
]
</script>

<template>
  <div class="my-10 space-y-5">
    <h1>Business Base Layer Examples</h1>
    <div class="flex gap-3">
      <UDropdownMenu
        :items="layoutExamples"
        :content="{ align: 'start' }"
      >
        <UButton
          label="Layout Examples"
          icon="i-lucide-menu"
          color="neutral"
          variant="outline"
        />
      </UDropdownMenu>

      <UDropdownMenu
        :items="componentExamples"
        :content="{ align: 'start' }"
      >
        <UButton
          label="Component Examples"
          icon="i-lucide-menu"
          color="neutral"
          variant="outline"
        />
      </UDropdownMenu>

      <UDropdownMenu
        :items="serviceExamples"
        :content="{ align: 'start' }"
      >
        <UButton
          label="Service Examples"
          icon="i-lucide-menu"
          color="neutral"
          variant="outline"
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
