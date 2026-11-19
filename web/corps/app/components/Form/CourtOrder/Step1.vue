<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const store = useCourtOrderStore()
const businessStore = useBusinessStore()
const route = useRoute()
const { setAlertText: setBtnCtrlAlert } = useConnectButtonControl()

const filingId = route.params.filingId as string // the pre-created court order draft filing ID

function onError(event: FormErrorEvent) {
  onFormSubmitError(event)
  setBtnCtrlAlert(t('validation.pleaseCompleteRequiredInfo'), 'right', 1)
}
</script>

<template>
  <UForm
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onError"
  >
    <FormCourtOrderPoaFullFiling
      v-model="store.formState.courtOrder"
      data-testid="form-section-court-order"
      name="courtOrder"
      :disabled="store.initializing"
      :identifier="businessStore.businessIdentifier"
      :entity-type="businessStore.business?.legalType as CorpTypeCd"
      :filing-id="filingId"
    />
  </UForm>
</template>
