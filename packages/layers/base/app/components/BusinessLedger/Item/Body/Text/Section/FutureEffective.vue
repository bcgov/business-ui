<script setup lang="ts">
const { t } = useI18n()
const filing = inject<BusinessLedgerItem>('filing')!
const { isFutureEffective, isFilingType } = useBusinessLedger(filing)
const { businessName } = useBusinessStore()

const subtitle = computed(() => {
  if (isFutureEffective) {
    return isFilingType(FilingType.CHANGE_OF_ADDRESS)
      ? t('label.filedAndPending')
      : t('label.futureEffectiveDate')
  }
  // future effective and pending
  switch (filing.name) {
    case FilingType.INCORPORATION_APPLICATION:
      return t('label.incorporationPending')
    case FilingType.ALTERATION:
      return t('label.alterationPending')
    case FilingType.CONTINUATION_IN:
      return t('label.continuationPending')
    default:
      if (isFilingType(undefined, FilingSubType.DISSOLUTION_VOLUNTARY)) {
        return t('label.voluntaryDisolutionPending')
      }
      return t('label.filingPending')
  }
})

const filingLabel = computed(() => {
  switch (filing.name) {
    case FilingType.ALTERATION:
      return t('text.alteration')
    case FilingType.CHANGE_OF_ADDRESS:
      return t('text.addressChange')
    case FilingType.AMALGAMATION_APPLICATION:
      return t('text.amalgamation')
    case FilingType.CONTINUATION_IN:
      return t('text.continuation')
    case FilingType.INCORPORATION_APPLICATION:
      return t('text.incorporation')
    default:
      if (filing.filingSubType === FilingSubType.DISSOLUTION_VOLUNTARY) {
        return t('text.dissolution')
      }
      return t('text.filing')
  }
})

const effectiveDateTime = computed(() =>
  filing.effectiveDate ? toPacificDateTime(new Date(filing.effectiveDate)) : '[unknown]'
)

const subtitleText = computed(() => {
  return isFutureEffective
    ? t(
      'text.filingWillTakeEffectOnDate',
      { boldStart: '<strong>', boldEnd: '</strong>', filing: filingLabel.value, date: effectiveDateTime.value })
    : t(
      'text.filingDateWillBeDate',
      {
        boldStart: '<strong>',
        boldEnd: '</strong>',
        date: effectiveDateTime.value,
        filing: filingLabel.value,
        name: businessName || t('text.thisCompany')
      })
})

const withdrawalText = t('text.noLongerWishToFileWithdraw', { filing: filingLabel.value })
const withdrawalText1 = withdrawalText.split('LINK')[0]
const withdrawalText2 = withdrawalText.split('LINK')[1]
const noticeOfWithdrawalFormURL = useRuntimeConfig().public.noticeOfWithdrawalFormUrl
</script>

<template>
  <div class="space-y-4">
    <p>
      <strong>{{ subtitle }}</strong>
    </p>
    <!-- NOTE: no user inputted values are used below -->
    <!-- eslint-disable-next-line vue/no-v-html  -->
    <p v-html="subtitleText" />
    <p v-if="isFutureEffective">
      {{ withdrawalText1 }}
      <UButton
        class="underline p-0 text-base"
        :label="$t('label.noticeOfWithdrawalForm')"
        :href="noticeOfWithdrawalFormURL"
        target="_blank"
        trailing-icon="i-mdi-open-in-new"
        variant="link"
      /> {{ withdrawalText2 }}
    </p>
    <p v-else>
      {{ $t('text.itMayTake1hourToProcessFiling') }}
    </p>
  </div>
</template>
