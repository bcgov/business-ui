<script setup lang="ts">
const store = useAgmLocationChangeStore()
const businessStore = useBusinessStore()

// in decsending order so the most recent year is first
const yearItems = computed(() => {
  const { minYear, maxYear } = getAgmYearRange(businessStore.business?.foundingDate)
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(maxYear - i))
})
</script>

<template>
  <UForm
    :state="store.formState"
    :schema="getAgmLocationChangeValidationSchema(businessStore.business?.foundingDate)"
    novalidate
    class="space-y-6 sm:space-y-10"
  >
    <ConnectPageSection
      :heading="{
        label: $t('page.agmLocationChange.locationChangeDetail'),
        icon: 'i-mdi-domain',
        level: 'h2'
      }"
    >
      <ConnectFieldset
        body-variant="card"
        orientation="vertical"
        class="[&>div]:gap-0"
        data-testid="form-section-location-change-detail"
      >
        <div class="divide-y divide-line-muted">
          <ConnectFormFieldWrapper
            :label="$t('label.agmYear')"
            orientation="horizontal"
            padding-class="xy-default"
            required
          >
            <UFormField
              name="year"
              class="grow flex-1"
            >
              <ConnectSelect
                id="agm-year-input"
                v-model="store.formState.year"
                class="w-full"
                :label="$t('label.generalMeetingYear')"
                :items="yearItems"
                :disabled="store.initializing"
              />
            </UFormField>
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
              :description="$t('text.reasonHint')"
              :disabled="store.initializing"
              :help="`${store.formState.reason?.length || 0} / 2000`"
              :ui="{ help: 'text-right', description: 'text-default' }"
            />
          </ConnectFormFieldWrapper>

          <ConnectFormFieldWrapper
            :label="$t('label.agmLocation')"
            orientation="horizontal"
            padding-class="xy-default"
            required
          >
            <div class="flex flex-col gap-4">
              <p class="text-m">
                {{ $t('text.agmLocationHint') }}
              </p>

              <div class="space-y-2">
                <ConnectFormAddressCountry
                  v-model="store.formState.agmLocation.country"
                  parent-id="agm-location"
                  schema-prefix="agmLocation"
                  :disabled="store.initializing"
                  required
                  @change="store.formState.agmLocation.region = ''"
                />

                <div class="flex flex-col gap-2 sm:gap-4 sm:flex-row">
                  <ConnectFormAddressCity
                    v-model="store.formState.agmLocation.city"
                    parent-id="agm-location"
                    schema-prefix="agmLocation"
                    :disabled="store.initializing"
                    required
                  />

                  <ConnectFormAddressRegion
                    v-model="store.formState.agmLocation.region"
                    parent-id="agm-location"
                    schema-prefix="agmLocation"
                    :country="store.formState.agmLocation.country"
                    :disabled="store.initializing"
                    required
                  />
                </div>
              </div>
            </div>
          </ConnectFormFieldWrapper>
        </div>
      </ConnectFieldset>
    </ConnectPageSection>
  </UForm>
</template>
