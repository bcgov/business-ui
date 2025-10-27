<script setup lang="ts">
const { t, te } = useI18n()

const filing = inject<BusinessLedgerItem>('filing')!

const { business, businessName, isBaseCompany, isFirm } = useBusinessStore()
const companyName = businessName || t('test.thisCompany')
const isEntityFirm = isFirm()

const unknownStr = `[${t('text.unknown')}]`

const entityTitle = isBaseCompany()
  ? t('businessConfig.corp.entityTitle')
  : te(`businessConfig.${business?.legalType}.entityTitle`)
    ? t(`businessConfig.${business?.legalType}.entityTitle`)
    : unknownStr

const actTitle = isBaseCompany()
  ? t('businessConfig.corp.act')
  : te(`businessConfig.${business?.legalType}.act`)
    ? t(`businessConfig.${business?.legalType}.act`)
    : unknownStr

const paidSubmittedDate = filing.paymentDate || filing.submittedDate
const paidSubmittedDatePacific = paidSubmittedDate ? toPacificDateTime(new Date(paidSubmittedDate)) : unknownStr

const dissolutionDate = toDate(filing.data?.dissolution?.dissolutionDate || '')
const dissolutionDatePacific = dissolutionDate ? toPacificDateTime(dissolutionDate) : unknownStr

const effectiveDate = filing.effectiveDate ? toPacificDateTime(new Date(filing.effectiveDate)) : unknownStr
</script>

<template>
  <div class="space-y-4">
    <p>
      <strong>{{ $t('label.dissolutionCompleted') }}</strong>
    </p>
    <p>
      <ConnectI18nHelper
        :translation-path="isEntityFirm ? 'text.dissolutionCompletedFirm' : 'text.dissolutionCompletedNonFirm'"
        :acttitle="actTitle"
        :dissolutiondate="dissolutionDatePacific || unknownStr"
        :effectivedate="effectiveDate || unknownStr"
        :entitytitle="entityTitle"
        :name="companyName"
        :submitteddate="paidSubmittedDatePacific || unknownStr"
      />
    </p>
    <strong>{{ $t('text.requiredToRetainDissolution') }}</strong>
  </div>
</template>
