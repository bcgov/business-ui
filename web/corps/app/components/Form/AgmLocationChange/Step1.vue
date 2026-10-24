<script setup lang="ts">
const store = useAgmLocationChangeStore()
const businessStore = useBusinessStore()
</script>

<template>
  <UForm
    :state="store.formState"
    :schema="getAgmLocationChangeValidationSchema(businessStore.business?.foundingDate)"
    novalidate
    class="space-y-6 sm:space-y-10"
  >
    <ConnectFieldset
      :label="`1. ${$t('page.agmLocationChange.locationChangeDetail')}`"
      :description="$t('page.agmLocationChange.locationChangeDetailDesc')"
      body-variant="card"
      orientation="vertical"
      data-testid="form-section-location-change-detail"
    >
      <div class="divide-y divide-line-muted">
        <ConnectFormFieldWrapper
          :label="$t('label.agmYear')"
          orientation="horizontal"
          padding-class="xy-default"
          required
        >
          <ConnectFormInput
            v-model="store.formState.year"
            name="year"
            input-id="agm-year-input"
            :label="$t('label.agmYear')"
            :disabled="store.initializing"
          />
        </ConnectFormFieldWrapper>

        <ConnectFormFieldWrapper
          :label="$t('label.reason')"
          orientation="horizontal"
          padding-class="xy-default"
          required
        >
          <ConnectFormTextarea
            v-model="store.formState.reason"
            name="reason"
            input-id="reason-input"
            :label="$t('label.reason')"
            :disabled="store.initializing"
          />
        </ConnectFormFieldWrapper>

        <ConnectFormFieldWrapper
          :label="$t('label.agmLocation')"
          orientation="horizontal"
          padding-class="xy-default"
          required
        >
          <ConnectFormInput
            v-model="store.formState.agmLocation"
            name="agmLocation"
            input-id="agm-location-input"
            :label="$t('label.agmLocation')"
            :disabled="store.initializing"
            :help="$t('text.agmLocationHint')"
          />
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
