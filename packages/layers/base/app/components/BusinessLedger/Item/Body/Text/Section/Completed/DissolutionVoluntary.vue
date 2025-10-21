<script setup lang="ts">
const { t, te } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!

const { business, businessName, isBaseCompany, isFirm } = useBusinessStore()
const companyName = businessName || t('test.thisCompany')
const isEntityFirm = isFirm()

const unknownStr = `[${t('text.unknown')}]`

const entityTitle = computed(() => (
  isBaseCompany()
    ? t('businessConfig.corp.entityTitle')
    : te(`businessConfig.${business?.legalType}.entityTitle`)
      ? t(`businessConfig.${business?.legalType}.entityTitle`)
      : unknownStr
))

const actTitle = computed(() => (
  isBaseCompany()
    ? t('businessConfig.corp.act')
    : te(`businessConfig.${business?.legalType}.act`)
      ? t(`businessConfig.${business?.legalType}.act`)
      : unknownStr
))

const paidSubmittedDate = filing.paymentDate || filing.submittedDate
const paidSubmittedDatePacific = paidSubmittedDate ? toPacificDateTime(new Date(paidSubmittedDate)) : unknownStr

const dissolutionDate = toDate(filing.data?.dissolution?.dissolutionDate || '')
const dissolutionDatePacific = dissolutionDate ? toPacificDateTime(dissolutionDate) : unknownStr

const effectiveDate = filing.effectiveDate ? toPacificDateTime(new Date(filing.effectiveDate)) : unknownStr

const text = t(isEntityFirm ? 'dissolutionCompletedFirm' : 'dissolutionCompletedNonFirm',
  {
    boldStart: '<strong>',
    boldEnd: '</strong>',
    entityTitle,
    name: companyName,
    effectiveDate: effectiveDate,
    submittedDate: paidSubmittedDatePacific,
    dissolutionDate: dissolutionDatePacific,
    actTitle
  })
</script>

<template>
  <!-- TODO: test -->
  <div class="space-y-4">
    <p>
      <strong>{{ $t('label.dissolutionCompleted') }}</strong>
    </p>
    <!-- NOTE: no user inputted values are used below -->
    <!-- eslint-disable-next-line vue/no-v-html  -->
    <p v-html="text" />
    <strong>{{ $t('text.requiredToRetainDissolution') }}</strong>
  </div>
</template>
