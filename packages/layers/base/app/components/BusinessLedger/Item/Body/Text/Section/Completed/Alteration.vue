<script setup lang="ts">
const { t } = useI18n()
const filing = inject<BusinessLedgerItem>('filing')!
const { businessName } = useBusinessStore()

const fromLegalType = getCorpFullDescription(filing.data?.alteration?.fromLegalType as CorpTypeCd)
const toLegalType = getCorpFullDescription(filing.data?.alteration?.toLegalType as CorpTypeCd)

const companyName = businessName || t('test.ThisCompany')
</script>

<template>
  <div class="space-y-4">
    <p>
      <strong>{{ $t('label.alterationComplete') }}</strong>
    </p>
    <!-- TODO: test -->
    <p v-if="fromLegalType !== toLegalType">
      {{ $t('text.alterationWasSuccessfullyAlteredToTypeOn', { name: companyName, fromLegalType, toLegalType }) }}
      <DateTooltip :date="new Date(filing.effectiveDate)" />.
    </p>
  </div>
</template>
