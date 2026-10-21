<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const store = useReviewImportedDataStore()

const missingOffices = computed(() => describeMissingOffices(store.missingInfo, t))
const missingDirectors = computed(() => describeMissingDirectors(store.missingInfo, store.directors, t))
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
    <div class="space-y-4" data-testid="office-addresses-section">
      <UAlert
        v-if="missingOffices.length"
        data-testid="missing-offices-alert"
        icon="i-mdi-alert"
        color="warning"
        variant="subtle"
        :title="$t('text.missingInfo.title')"
      >
        <template #description>
          <ul class="list-disc pl-5">
            <li v-for="(line, index) in missingOffices" :key="index">
              {{ line }}
            </li>
          </ul>
        </template>
      </UAlert>

      <ManageOffices
        v-model:active-office="store.formState.activeOffice"
        :loading="store.initializing"
        :empty-text="$t('label.noOffices')"
        :section-title="`1. ${$t('label.officeAddresses')}`"
        :section-description="$t('text.reviewImportedDataOffices')"
        :table-title="$t('label.offices')"
        subject=""
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        :label-overrides="{ editLabel: $t('label.changeAddress') }"
        bc-canada-only="delivery"
        hide-remove
      />
    </div>

    <div class="space-y-4" data-testid="current-directors-section">
      <UAlert
        v-if="missingDirectors.length"
        data-testid="missing-directors-alert"
        icon="i-mdi-alert"
        color="warning"
        variant="subtle"
        :title="$t('text.missingInfo.title')"
      >
        <template #description>
          <ul class="list-disc pl-5">
            <li v-for="(line, index) in missingDirectors" :key="index">
              {{ line }}
            </li>
          </ul>
        </template>
      </UAlert>

      <ManageParties
        v-model:active-party="store.formState.activeDirector"
        :loading="store.initializing"
        :empty-text="$t('label.noDirectors')"
        :section-title="`2. ${$t('label.currentDirectors')}`"
        :section-description="$t('text.reviewImportedDataDirectors')"
        :table-title="$t('label.directors')"
        :subject="$t('label.director')"
        :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates', 'actions']"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        model-name="activeDirector"
        :label-overrides="{ editLabel: $t('label.changeAddress') }"
        :party-form-props="{ hideRemove: true }"
      />
    </div>
  </UForm>
</template>
