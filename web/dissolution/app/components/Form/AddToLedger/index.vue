<script setup lang="ts">
import { z } from 'zod'

defineProps<{
  name?: string
  order?: string | number
}>()

const { t } = useI18n()

const model = defineModel<boolean>({ required: true })
</script>

<template>
  <UForm
    :schema="z.any()"
    nested
    :name
  >
    <ConnectFieldset
      :label="order ? `${order}. ${t('label.addToLedgerOpt')}` : t('label.addToLedgerOpt')"
      :description="t('text.addToLedgerDescription')"
      body-variant="card"
    >
      <ConnectFormFieldWrapper
        :label="t('label.addToLedger')"
        orientation="horizontal"
      >
        <UFormField name="addToLedger">
          <UCheckbox
            v-model="model"
            :label="t('text.yesCreateLedgerItemForDissolution')"
            :ui="{ label: 'text-base' }"
          />
        </UFormField>
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </UForm>
</template>
