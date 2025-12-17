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
    label: 'ModalError',
    to: localePath('/examples/components/Modal/Error')
  },
  {
    label: 'ModalStaffPay',
    to: localePath('/examples/components/Modal/StaffPay')
  },
  {
    label: 'FormDocumentId',
    to: localePath('/examples/components/Form/DocumentId')
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
    </div>
  </div>
</template>
