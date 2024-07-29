<script setup lang="ts">
const { t } = useI18n()

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
    key: 'recipients',
    label: 'Type'
    // sortable: true
  },
  {
    key: 'sentDate',
    label: 'Status'
    // sortable: true
  },
  {
    key: 'actions',
    label: 'Actions'
  }
]
</script>
<template>
  <div class="mx-auto flex flex-col gap-4 px-4 py-10">
    <!-- TODO: update i18n -->
    <SbcPageSectionH1 :heading="$t('page.home.h1')" />

    <!-- TODO: add i18n -->
    <p class="text-bcGovColor-midGray">
      Start B.C. based businesses and keep business records up to date.
    </p>

    <!-- TODO: add help text dropdown, use content? -->
    <!-- TODO: add i18n -->
    <UButton
      label="Help with Starting and Managing a Business"
      variant="link"
      icon="i-mdi-help-circle-outline"
      :ui="{ icon: { size: { sm: 'size-6' } } }"
    />

    <!-- TODO: link search with query -->
    <!-- TODO: add i18n -->
    <UFormGroup label="Retrieve an existing business or active Name Request to manage:">
      <UInput
        variant="bcGov"
        placeholder="My business name, incorporation number or registration number"
        :ui="{ base: 'bg-white' }"
        icon="i-mdi-magnify"
        trailing
      />
    </UFormGroup>

    <!-- TODO: link with search query -->
    <!-- TODO: update legend and make sr only -->
    <!-- TODO: add i18n options -->
    <URadioGroup
      v-model="selected"
      legend="Choose something"
      :options="[{value: 'opt1', label: 'Existing business'}, {value: 'opt2', label: 'Name Request'}]"
      :ui="{ fieldset: 'flex gap-4' }"
      :ui-radio="{
        label: 'text-base font-medium text-bcGovColor-midGray dark:text-gray-200',
        base: 'size-5',
        container: 'flex items-center h-full',
      }"
    />

    <SbcPageSectionCard heading="My List">
      <UTable :columns />
    </SbcPageSectionCard>
  </div>
</template>
