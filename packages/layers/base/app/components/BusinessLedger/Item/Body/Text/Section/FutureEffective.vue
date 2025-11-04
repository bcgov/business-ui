<script setup lang="ts">
import type { MessageFunction, VueMessageType } from 'vue-i18n'

const { t, tm, rt } = useI18n()
const filing = inject<BusinessLedgerItem>('filing')!
const { isFutureEffective, isFilingType } = useBusinessLedgerFiling(filing)
const { businessName } = useBusinessStore()

const getSubtitle = () => {
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
}
const subtitle = getSubtitle()

const getFilingLabel = () => {
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
}
const filingLabel = getFilingLabel()

const effectiveDateTime = filing.effectiveDate
  ? toPacificDateTime(new Date(filing.effectiveDate))
  : `[${t('text.unknown')}]`

const withdrawalTextTranslations = tm('text.noLongerWishToFileWithdraw') as MessageFunction<VueMessageType>[]
const withdrawalText1 = rt(withdrawalTextTranslations[0]!, { filing: filingLabel })
const withdrawalText2 = rt(withdrawalTextTranslations[1]!)
const noticeOfWithdrawalFormURL = useRuntimeConfig().public.noticeOfWithdrawalFormUrl
</script>

<template>
  <div class="space-y-4 *:space-y-4">
    <p>
      <strong>{{ subtitle }}</strong>
    </p>
    <div v-if="isFutureEffective">
      <p>
        <ConnectI18nHelper
          translation-path="text.filingWillTakeEffectOnDate"
          :date="effectiveDateTime"
          :filing="filingLabel"
        />
      </p>
      <p>
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
    </div>
    <div v-else>
      <ConnectI18nHelper
        translation-path="text.filingDateWillBeDate"
        :date="effectiveDateTime"
        :filing="filingLabel"
        :name="businessName || $t('text.thisCompany')"
      />
      <p>
        {{ $t('text.itMayTake1hourToProcessFiling') }}
      </p>
    </div>
  </div>
</template>
