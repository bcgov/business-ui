<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import { handleFormErrorEvent } from '~/utils/form/handleFormErrorEvent'
import { UCheckbox, UForm } from '#components'
const { t } = useI18n()
const localePath = useLocalePath()
const keycloak = useKeycloak()
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()
const feeStore = usePayFeesStore()
const alertStore = useAlertStore()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.annualReport.title')
})

definePageMeta({
  middleware: ['filing-paid', 'require-account']
})

// options for radio buttons
const options = [
  {
    label: t('page.annualReport.form.agmStatus.opt1', { year: busStore.currentBusiness.nextARYear }),
    value: 'option-1'
  },
  {
    label: t('page.annualReport.form.agmStatus.opt2', { year: busStore.currentBusiness.nextARYear }),
    value: 'option-2'
  },
  {
    label: t('page.annualReport.form.agmStatus.opt3', { year: busStore.currentBusiness.nextARYear }),
    value: 'option-3'
  }
]

const arFormRef = ref<InstanceType<typeof UForm> | null>(null)
const checkboxRef = ref<InstanceType<typeof UCheckbox> | null>(null)
const selectedRadio = ref<string | null>(null)

// form state
const arData = reactive<{ agmDate: Date | null, voteDate: Date | null, officeAndDirectorsConfirmed: boolean}>({
  agmDate: null,
  voteDate: null,
  officeAndDirectorsConfirmed: false
})

// validate form based on the selected radio value
const validate = (state: { agmDate: string | null, voteDate: string | null, officeAndDirectorsConfirmed: boolean }): FormError[] => {
  arFormRef.value?.clear() // reset form errors
  const errors: FormError[] = []

  switch (selectedRadio.value) {
    case null: // add general error if no radio selected
      errors.push({ path: 'radioGroup', message: t('page.annualReport.form.agmStatus.error') })
      break

    case 'option-1': // add agm date field error if selected option-1
      if (!state.agmDate) {
        errors.push({ path: 'agmDate', message: t('page.annualReport.form.agmDate.error') })
      }
      break

    case 'option-2': // no error for option-2
      break

    case 'option-3': // add vote date field error if selected option-3
      if (!state.voteDate) {
        errors.push({ path: 'voteDate', message: t('page.annualReport.form.voteDate.error') })
      }
      break

    default:
      break
  }

  return errors
}

// separate checkbox validation method, cant include in validate prop on UForm
function handleCertifyCheckboxValidation () {
  let isChecked = true
  if (!arData.officeAndDirectorsConfirmed) { // push checkbox error to form ref
    arFormRef.value?.setErrors([{ path: 'officeAndDirectorsConfirmed', message: t('page.annualReport.form.certify.error') }])
    isChecked = false
  }
  if (arFormRef.value?.errors.length === 1) { // move focus to checkbox if its the only form error
    const element = document.getElementById(checkboxRef.value?.inputId)
    element?.focus()
    element?.scrollIntoView()
  }
  return isChecked
}

// handle submitting filing and directing to pay screen
async function submitAnnualReport (event: FormSubmitEvent<any>) {
  arFormRef.value?.clear() // reset form errors
  try {
    arStore.loading = true
    if (!handleCertifyCheckboxValidation()) { // validate certification checkbox is checked
      return
    }
    // set data based off radio option
    const arFiling: ArFormData = {
      agmDate: selectedRadio.value === 'option-1' ? datetimeStringToDateString(event.data.agmDate) : null,
      votedForNoAGM: selectedRadio.value === 'option-3',
      unanimousResolutionDate: selectedRadio.value === 'option-3' ? datetimeStringToDateString(event.data.voteDate) : null
    }

    // submit filing
    const { paymentToken, filingId, payStatus } = await arStore.submitAnnualReportFiling(arFiling)
    if (payStatus === 'PAID') { // redirect to final page if payStatus comes back as paid (PAD accounts)
      return navigateTo(localePath(`/submitted?filing_id=${filingId}`))
    } else {
      // redirect to pay with the returned token and filing id
      await handlePaymentRedirect(paymentToken, filingId)
    }
  } catch {
  } finally {
    arStore.loading = false
  }
}

// clear form errors anytime data changes
watch(
  () => arData,
  (newVal) => {
    if (newVal) {
      arFormRef.value?.clear()
    }
  }, { deep: true }
)

// reset form state any time the radio option changes
watch(selectedRadio, (newVal) => {
  arFormRef.value?.clear('radioGroup') // clear radio group error if exists
  if (newVal) {
    arData.agmDate = null
    arData.voteDate = null
    arData.officeAndDirectorsConfirmed = false
  }
})

// init page state in setup lifecycle
if (import.meta.client) {
  try {
    // load fees for fee widget, might move into earlier setup
    feeStore.addPayFees('BCANN')

    // try to prefill form if a filing exists
    if (Object.keys(arStore.arFiling).length !== 0) {
      // add payment error message if pay status exists and doesnt equal paid
      if (arStore.arFiling.filing.header.status && arStore.arFiling.filing.header.status !== 'PAID') {
        alertStore.addAlert({
          severity: 'error',
          category: AlertCategory.PAYMENT_ERROR
        })
      }

      // set radio option and prefill date inputs
      const votedForNoAGM = arStore.arFiling.filing.annualReport.votedForNoAGM
      const agmDate = arStore.arFiling.filing.annualReport.annualGeneralMeetingDate
      const voteDate = arStore.arFiling.filing.annualReport.unanimousResolutionDate
      if (votedForNoAGM) {
        selectedRadio.value = 'option-3'
        await nextTick() // wait for dom update so input exists before setting date
        arData.voteDate = voteDate !== null ? dateStringToDate(voteDate) : null
      } else if (!votedForNoAGM && !agmDate) {
        selectedRadio.value = 'option-2'
      } else if (agmDate) {
        selectedRadio.value = 'option-1'
        await nextTick() // wait for dom update so input exists before setting date
        arData.agmDate = dateStringToDate(agmDate)
      }
    }
  } catch { // silently handle errors
  } finally {
    pageLoading.value = false
  }
}
</script>
<template>
  <ClientOnly>
    <div v-show="!pageLoading" class="relative mx-auto flex w-full max-w-[1360px] flex-col gap-4 text-left sm:gap-4 md:flex-row md:gap-6">
      <div class="flex w-full flex-col gap-6">
        <SbcPageSectionH1 :heading="$t('page.annualReport.h1', { year: busStore.currentBusiness.nextARYear})" />

        <SbcAlert
          :show-on-category="[
            AlertCategory.INTERNAL_SERVER_ERROR,
            AlertCategory.PAYMENT_ERROR,
            AlertCategory.AR_SUBMIT_ERROR,
            AlertCategory.FEE_INFO
          ]"
        />

        <SbcPageSectionCard
          :heading="$t('page.annualReport.h2', { name: busStore.currentBusiness.legalName })"
        >
          <SbcBusinessInfo
            break-value="lg"
            :items="[
              { label: $t('labels.busName'), value: busStore.currentBusiness.legalName },
              { label: $t('labels.corpNum'), value: busStore.businessNano.identifier },
              { label: $t('labels.arDate'), value: busStore.nextArDate },
            ]"
          />

          <UDivider class="mb-4 mt-8" />

          <UForm
            ref="arFormRef"
            :state="arData"
            :validate="validate"
            :validate-on="['submit']"
            autocomplete="off"
            class="space-y-6"
            @submit="submitAnnualReport"
            @error="handleFormErrorEvent"
          >
            <UFormGroup name="radioGroup">
              <!-- label for visual -->
              <template #label>
                <span>{{ $t('page.annualReport.form.agmStatus.question', { year: busStore.currentBusiness.nextARYear }) }}
                  <SbcTooltip id="agm-status-tooltip" :text="$t('page.annualReport.form.agmStatus.tooltip')" />
                </span>
              </template>
              <fieldset>
                <!-- legend for accessibility -->
                <legend class="sr-only">
                  {{ $t('page.annualReport.form.agmStatus.question', { year: busStore.currentBusiness.nextARYear }) }}
                </legend>
                <!-- use radio instead of radio group, allows aria-describedby property -->
                <div class="space-y-1">
                  <URadio
                    v-for="option in options"
                    :key="option.value"
                    v-model="selectedRadio"
                    v-bind="option"
                    aria-describedby="agm-status-tooltip"
                    :ui="{ label: 'text-base font-medium text-bcGovColor-midGray dark:text-gray-200', wrapper: 'relative flex items-center' }"
                  />
                </div>
              </fieldset>
            </UFormGroup>

            <!-- AGM Date -->
            <UFormGroup
              v-if="selectedRadio && selectedRadio === 'option-1'"
              name="agmDate"
              class="mt-4"
              :help="$t('page.annualReport.form.agmDate.format')"
              :ui="{ help: 'text-bcGovColor-midGray' }"
            >
              <SbcDatePicker
                id="date-select-agm"
                v-model="arData.agmDate"
                :max-date="new Date()"
                :placeholder="$t('page.annualReport.form.agmDate.placeholder')"
                :arialabel="$t('page.annualReport.form.agmDate.label')"
                :input-variant="handleFormInputVariant('agmDate', arFormRef?.errors)"
                @blur="arFormRef?.validate('agmDate', { silent: true } )"
              />
            </UFormGroup>

            <!-- did not hold agm warning -->
            <UAlert
              v-else-if="selectedRadio && selectedRadio === 'option-2'"
              icon="i-mdi-warning"
              variant="subtle"
              color="red"
              :ui="{ description: 'mt-1 text-sm leading-4 opacity-90 text-bcGovColor-midGray', variant: { subtle: 'ring-2' }, rounded: 'rounded-none' }"
            >
              <template #description>
                <div class="flex flex-col gap-1">
                  <SbcI18nBold translation-path="page.annualReport.form.complianceWarning.main" />
                  <i18n-t keypath="page.annualReport.form.complianceWarning.link" tag="span" scope="global">
                    <template #link>
                      <a class="text-sm text-bcGovBlue-500 underline" target="_blank" href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02057_06#section182">
                        {{ $t('links.busCorpAct.sect182') }}
                      </a>
                      <span class="ml-1 inline-flex pb-1 align-middle">
                        <UIcon name="i-mdi-open-in-new" class="size-4 shrink-0 text-bcGovBlue-500" />
                      </span>
                    </template>
                  </i18n-t>
                </div>
              </template>
            </UAlert>

            <!-- Unanimous vote date -->
            <UFormGroup
              v-else-if="selectedRadio && selectedRadio === 'option-3'"
              name="voteDate"
              class="mt-4"
              :help="$t('page.annualReport.form.voteDate.format')"
              :ui="{ help: 'text-bcGovColor-midGray' }"
            >
              <SbcDatePicker
                id="date-select-vote"
                v-model="arData.voteDate"
                :max-date="new Date()"
                :placeholder="$t('page.annualReport.form.voteDate.placeholder')"
                :arialabel="$t('page.annualReport.form.voteDate.label')"
                :input-variant="handleFormInputVariant('voteDate', arFormRef?.errors)"
                @blur="arFormRef?.validate('voteDate', { silent: true } )"
              />
            </UFormGroup>
          </UForm>
        </SbcPageSectionCard>

        <h2 class="text-lg font-semibold text-bcGovColor-darkGray">
          {{ $t('page.annualReport.reviewAndConfirm.main') }}
          <SbcTooltip :text="$t('page.annualReport.reviewAndConfirm.help')" />
        </h2>

        <SbcPageSectionCard
          :heading="$t('words.addresses')"
          heading-icon="i-mdi-map-marker"
          heading-level="h3"
        >
          <SbcTableAddress :offices="busStore.fullDetails.offices" />
        </SbcPageSectionCard>

        <SbcPageSectionCard
          :heading="$t('words.directors')"
          heading-icon="i-mdi-account-multiple-plus"
          heading-level="h3"
        >
          <SbcTableDirectors :directors="busStore.fullDetails.parties" />
        </SbcPageSectionCard>

        <SbcPageSectionCard
          :heading="$t('words.confirm')"
          heading-icon="i-mdi-text-box-check"
          heading-level="h3"
        >
          <UFormGroup
            :ui="{
              help: 'mt-2 text-red-500',
            }"
            :help="arFormRef?.errors.some((error: FormError) => error.path === 'officeAndDirectorsConfirmed') ? $t('page.annualReport.form.certify.error') : ''"
          >
            <UCheckbox
              ref="checkboxRef"
              v-model="arData.officeAndDirectorsConfirmed"
            >
              <template #label>
                <SbcI18nBold translation-path="page.annualReport.form.certify.question" :name="parseSpecialChars(keycloak.kcUser.value.fullName, 'USER').toLocaleUpperCase($i18n.locale)" />
              </template>
            </UCheckbox>
          </UFormGroup>
        </SbcPageSectionCard>
      </div>
      <SbcFeeWidget
        class="md:sticky md:top-10 md:mt-1 md:self-start"
        :fees="feeStore.fees"
        :is-loading="arStore.loading"
        @submit="arFormRef?.submit()"
      />
    </div>
  </ClientOnly>
</template>
