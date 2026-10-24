<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const store = useAgmLocationChangeStore()
const businessStore = useBusinessStore()

const entityType = computed(() =>
  getCorpFullDescription(businessStore.business?.legalType, businessStore.business?.legalType)
)

const reviewRows = computed(() => [
  { label: t('label.agmYear'), value: store.formState.year },
  { label: t('label.reason'), value: store.formState.reason },
  { label: t('label.agmLocation'), value: store.formState.agmLocation }
])
</script>

<template>
  <UForm
    :state="store.formState"
    :schema="z.any()"
    novalidate
    class="space-y-6 sm:space-y-10"
  >
    <ConnectPageSection
      data-testid="review-location-change-detail"
      :heading="{ label: $t('page.agmLocationChange.locationChangeDetail'), icon: 'i-mdi-domain' }"
    >
      <dl class="divide-y divide-line-muted">
        <div
          v-for="row in reviewRows"
          :key="row.label"
          class="padding-xy-default flex flex-col gap-2 sm:flex-row sm:gap-6"
        >
          <dt class="font-bold text-neutral-highlighted sm:w-48 sm:shrink-0">
            {{ row.label }}
          </dt>
          <dd class="whitespace-pre-line break-words">
            {{ row.value }}
          </dd>
        </div>
      </dl>
    </ConnectPageSection>

    <FormFolio
      v-if="store.formState.folio"
      v-model="store.formState.folio"
      data-testid="folio-section"
      name="folio"
      :default-folio="businessStore.businessFolio"
    />

    <FormCertify
      v-if="!store.isStaff"
      v-model="(store.formState as any).certify"
      data-testid="form-section-certify"
      name="certify"
      :entity-type="entityType"
    />
    <FormConfirmAuthorization
      v-if="store.isStaff && store.formState.authorization"
      v-model="(store.formState as any).authorization"
      :entity-type="entityType"
      data-testid="form-section-authorization"
      name="authorization"
    />
  </UForm>
</template>
