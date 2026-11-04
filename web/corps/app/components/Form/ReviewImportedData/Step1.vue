<script setup lang="ts">
import { z } from 'zod'

const store = useReviewImportedDataStore()

// the "fill in the missing information" alert per section - shown while the api flags that section, dismissible
const showOfficesAlert = ref(true)
const showDirectorsAlert = ref(true)
const hasMissingOffices = computed(() => Object.keys(store.missingInfo.offices).length > 0)
const hasMissingDirectors = computed(() => Object.keys(store.missingInfo.directors).length > 0)

const tableLabelOverrides = computed(() => ({
  editLabel: $t('label.changeAddress'),
  invalidAddress: $t('label.missingInformation')
}))

// only one office / director sub form is open at a time, so lock the inputs the api did not flag on that record
const officeAddressFormProps = computed<AddressFormProps>(() => {
  const officeType = store.formState.activeOffice?.type
  return {
    noPoBox: true,
    hideSameAs: true,
    disabledFields: officeType ? getLockedAddressFields(store.missingInfo.offices[officeType]) : undefined
  }
})
const directorAddressFormProps = computed<AddressFormProps>(() => {
  const partyId = store.formState.activeDirector?.id
  return {
    noPoBox: true,
    hideSameAs: true,
    disabledFields: partyId ? getLockedAddressFields(store.missingInfo.directors[partyId]) : undefined
  }
})
</script>

<template>
  <UForm
    ref="review-imported-data-step-1"
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onFormSubmitError"
  >
    <ManageOffices
      v-model:active-subject="store.formState.activeOffice"
      data-testid="office-addresses-section"
      :loading="store.initializing"
      :empty-text="$t('label.noOffices')"
      :table-title="$t('label.officeAddresses')"
      subject=""
      :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      :label-overrides="tableLabelOverrides"
      bc-canada-only="delivery"
      hide-remove
      validate-on-open
      :address-form-props="officeAddressFormProps"
    >
      <template #before-table>
        <UAlert
          v-if="hasMissingOffices && showOfficesAlert"
          data-testid="missing-offices-alert"
          class="m-4 w-auto sm:m-6"
          icon="i-mdi-alert"
          color="error"
          variant="subtle"
          close
          @update:open="showOfficesAlert = false"
        >
          <template #description>
            <strong>{{ $t('label.important') }}:</strong> {{ $t('text.reviewImportedDataImportant') }}
          </template>
        </UAlert>
      </template>
    </ManageOffices>

    <ManageParties
      v-model:active-subject="store.formState.activeDirector"
      data-testid="current-directors-section"
      :loading="store.initializing"
      :empty-text="$t('label.noDirectors')"
      :table-title="$t('label.currentDirectors')"
      :subject="$t('label.director')"
      :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates', 'actions']"
      :role-type="RoleTypeUi.DIRECTOR"
      :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      model-name="activeDirector"
      :label-overrides="tableLabelOverrides"
      :party-form-props="{ hideRemove: true, validateOnOpen: true, addressFormProps: directorAddressFormProps }"
    >
      <template #before-table>
        <UAlert
          v-if="hasMissingDirectors && showDirectorsAlert"
          data-testid="missing-directors-alert"
          class="m-4 w-auto sm:m-6"
          icon="i-mdi-alert"
          color="error"
          variant="subtle"
          close
          @update:open="showDirectorsAlert = false"
        >
          <template #description>
            <strong>{{ $t('label.important') }}:</strong> {{ $t('text.reviewImportedDataImportant') }}
          </template>
        </UAlert>
      </template>
    </ManageParties>
  </UForm>
</template>
