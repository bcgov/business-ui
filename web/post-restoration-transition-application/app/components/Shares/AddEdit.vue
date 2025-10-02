<script lang="ts" setup>
import currencySymbolMap from 'currency-symbol-map/map'
import { PageSection } from '~/enum/page_sections'

// NOTE: if isASeries is set then editingSeriesParent must not be -1
const props = defineProps<{
  isSeries?: boolean
  formId: string
  formError?: string | undefined
}>()

const t = useNuxtApp().$i18n.t
const filingStore = usePostRestorationTransitionApplicationStore()
const {
  shareClasses,
  editingShareIndex,
  editingSeriesParent
} = storeToRefs(filingStore)

const errorStore = usePostRestorationErrorsStore()
const {
  shareErrors
} = storeToRefs(errorStore)

const emit = defineEmits(['cancel', 'done', 'force-redraw'])

const SHARES_TEXT = ' Shares'
const hasDeletedSeries = ref(false)

const translationPath = props.isSeries ? 'series' : 'share'

const resetData = () => {
  shareErrors.value = []
  firstParChange.value = true
  firstMaxChange.value = true
  if (editingShareIndex.value !== -1) {
    shareValues.value
      = JSON.parse(
        JSON.stringify(
          shareClasses?.value?.[editingShareIndex.value]
        ))
    shareName.value = shareValues?.value?.name.substring(0, shareValues?.value?.name?.length - SHARES_TEXT.length)
  } else {
    shareValues.value = {
      id: undefined,
      name: '',
      currency: '',
      hasMaximumShares: false,
      hasParValue: false,
      hasRightsOrRestrictions: false,
      maxNumberOfShares: undefined,
      parValue: undefined,
      priority: shareClasses.value.length + 1
    }
    if (props.isSeries && editingSeriesParent.value !== -1) {
      shareValues.value.parentShareIndex = editingSeriesParent.value
      shareValues.value.hasParValue = editingSeriesParent.value.hasParValue || false
      shareValues.value.currency = editingSeriesParent.value.currency || ''
      shareValues.value.parValue = editingSeriesParent.value.parValue || undefined
    } else {
      shareValues.value.series = JSON.parse(JSON.stringify(shareClasses.value[editingShareIndex.value]?.series || []))
    }
    shareName.value = ''
  }

  hasNoMaxShares.value = shareValues.value.hasMaximumShares ? '' : t('label.noMax')
  hasNoParValue.value = shareValues.value.hasParValue ? '' : t('label.noPar')
}

const rightsChangeHandler = (newVal: boolean | indeterminate) => {
  if (shareValues.value.series && shareValues.value.series.length > 0) {
    if (!newVal) {
      useModal().baseModal.open({
        title: t('label.shareSeriesRightsRestrictions'),
        description: t('text.shareSeriesRightsRestrictions'),
        dismissible: false,
        buttons: [
          {
            label: t('btn.cancel'), variant: 'outline', size: 'xl', shouldClose: true, onClick: () => {
              shareValues.value.hasRightsOrRestrictions = true
            }
          },
          {
            label: t('label.removeSeries'), size: 'xl', shouldClose: true, onClick: () => {
              for (let i = 0; i < shareValues.value.series.length; i++) {
                shareValues.value.series[i].removed = true
              }
              // const copy = JSON.parse(JSON.stringify(shareValues.value))
              // Object.assign(shareValues.value, copy)
              hasDeletedSeries.value = true
            }
          }
        ]
      })
    } else if (hasDeletedSeries.value) {
      for (let i = 0; i < shareValues.value.series.length; i++) {
        delete shareValues.value.series[i].removed
      }
      hasDeletedSeries.value = false
    }
  }
}

watch(shareClasses, resetData, { deep: true })

const firstParChange = ref(true)
const firstMaxChange = ref(true)

const shareValues = ref<Share | Series>(
  JSON.parse(
    JSON.stringify(
      shareClasses?.value?.[editingShareIndex.value]
        || {
          id: undefined,
          name: '',
          currency: '',
          hasMaximumShares: false,
          hasParValue: false,
          hasRightsOrRestrictions: false,
          maxNumberOfShares: undefined,
          parValue: undefined,
          priority: shareClasses.value.length + 1
        }
    )
  )
)

if (props.isSeries && editingSeriesParent.value !== -1) {
  shareValues.value.parentShareIndex = editingSeriesParent.value
  shareValues.value.hasParValue = editingSeriesParent.value.hasParValue || false
  shareValues.value.currency = editingSeriesParent.value.currency || ''
  shareValues.value.parValue = editingSeriesParent.value.parValue || undefined
} else {
  shareValues.value.series = JSON.parse(JSON.stringify(shareClasses.value[editingShareIndex.value]?.series || []))
}

const hasNoMaxShares = ref<string>(shareValues.value.hasMaximumShares ? '' : t('label.noMax'))
const hasNoParValue = ref<string>(shareValues.value.hasParValue ? '' : t('label.noPar'))

const shareName = ref<string>(
  shareValues?.value?.name.substring(0,
                                     shareValues?.value?.name?.length - SHARES_TEXT.length)
  || ''
)

const maxSharesFocusInHandler = () => {
  shareValues.value.hasMaximumShares = true
  if (firstMaxChange.value) {
    shareValues.value.maxNumberOfShares = undefined
  }
  firstMaxChange.value = false
  hasNoMaxShares.value = ''
}

const maxSharesChangeHandler = () => {
  clearErrors('maxNumberOfShares')
  maxSharesFocusInHandler()
}

const noMaxSharesFocusInHandler = () => {
  clearErrors('maxNumberOfShares')
  shareValues.value.hasMaximumShares = false
  firstMaxChange.value = false
  hasNoMaxShares.value = t('label.noMax') }

const noMaxSharesChangeHandler = () => {
  clearErrors('maxNumberOfShares')
  noMaxSharesFocusInHandler()
}

const parValueFocusInHandler = () => {
  shareValues.value.hasParValue = true
  if (firstParChange.value) {
    shareValues.value.parValue = undefined
    shareValues.value.currency = undefined
  }
  firstParChange.value = false
  hasNoParValue.value = ''
}

const parValueChangeHandler = () => {
  clearErrors('parValue')
  clearErrors('currency')
  parValueFocusInHandler()
}

const noParValueChangeHandler = () => {
  clearErrors('parValue')
  clearErrors('currency')
  shareValues.value.hasParValue = false
  firstParChange.value = false
  hasNoParValue.value = t('label.noPar')
}

const currencies = ref(Object.keys(currencySymbolMap))

const hasChanges = () => {
  const working = JSON.parse(JSON.stringify(shareValues.value))
  working.name = shareName.value + SHARES_TEXT
  return JSON.stringify(working) !== JSON.stringify(shareClasses.value[editingShareIndex.value])
}

const cancel = () => {
  // TODO: stop cancel when saving
  if (hasChanges()) {
    emit('cancel')
  } else {
    resetData()
    emit('cancel')
  }
}

const clearErrors = (errorField: string) => {
  if (shareErrors.value[getErrorIndex()]?.[errorField]?.[0]) {
    shareErrors.value[getErrorIndex()][errorField] = []
  }
}

const getError = (errorField: string) => {
  return shareErrors.value[getErrorIndex()]?.[errorField]?.[0]
}

const getErrorIndex = () => {
  return editingShareIndex.value !== -1 ? editingShareIndex.value : shareClasses.value.length
}

const getWorkingShareClasses = () => {
  const rv = [...shareClasses.value]
  if (editingShareIndex.value !== -1) {
    rv[editingShareIndex.value] = shareValues.value
  } else {
    rv.push(shareValues.value)
  }

  return rv
}

const done = () => {
  if (hasChanges()) {
    shareValues.value.name = shareName.value
    cleanData()
    errorStore.verifyShareClasses(getWorkingShareClasses())

    const otherShareClasses = shareClasses.value.filter((_, index) => index !== editingShareIndex.value)
    const names = otherShareClasses.map(share => share.name.toLowerCase())
    if (names.includes((shareName.value + SHARES_TEXT).toLowerCase())) {
      if (!shareErrors.value[getErrorIndex()]) {
        shareErrors.value[getErrorIndex()] = {}
      }
      shareErrors.value[getErrorIndex()]['name'] = [t('errors.shareNameExists')]
      return
    }

    if (shareErrors.value.length > 0 && Object.keys(shareErrors.value[getErrorIndex()]).length > 0) {
      return
    }
    shareValues.value.name = shareName.value + SHARES_TEXT
    if (editingShareIndex.value !== -1) {
      shareClasses.value[editingShareIndex.value] = shareValues.value
    } else if (props.isSeries && editingSeriesParent.value !== -1) {
      shareClasses.value[editingSeriesParent.value].series.push(shareValues.value)
    } else {
      shareClasses.value.push(shareValues.value)
    }
    resetData()
    emit('done')
  } else {
    // no changes to save
    emit('cancel')
  }
}

const cleanData = () => {
  if (shareValues.value.hasParValue === false) {
    shareValues.value.currency = undefined
    shareValues.value.parValue = undefined
  }

  if (shareValues.value.hasMaximumShares === false) {
    shareValues.value.maxNumberOfShares = undefined
  }
}
</script>

<template>
  <ConnectFormSection
    :title="$t('label.officeAddresses')"
    class="pb-6"
  >
    <template #title>
      <p :class="formError ? 'text-red-600' : ''" class="mb-2 sm:mb-0 sm:font-bold">
        {{ editingShareIndex === -1 ? $t('label.add') : $t('label.edit') }}
        {{ $t(`label.${translationPath}`) }}
      </p>
    </template>

    <div :id="formId" class="inline-block flex-auto space-y-6 w-full">
      <UFormField :error="$te(getError('name')) ? $t(getError('name')) : getError('name')">
        <!--          @blur="revalidateIfHasErrors('name')" -->
        <UInput
          v-model="shareName"
          :placeholder="$t(`label.${translationPath}Name`)"
          class="w-full text-center [&>input]:text-left [&>input]:p-[18px]"

          @keydown="clearErrors('name')"
        >
          <template #trailing>
            <div class="text-base text-bcGovColor-midGray">
              {{ $t('label.shares') }}
            </div>
          </template>
        </UInput>
      </UFormField>
      <div class="text-sm text-gray-500 -mt-6 ml-4">
        {{ $t(`text.helperText.${translationPath}Name`) }}
      </div>

      <hr class="border-bcGovGray-300">

      <div class="flex grow">
        <URadioGroup
          v-model="hasNoMaxShares"
          data-testid="maxShares-radio"
          :items="['']"
          class="flex-0 mr-3 align-bottom text-base"
          :ui="{
            container: 'text-base h-[56px]'
          }"
          @change="maxSharesChangeHandler()"
        />
        <UFormField
          :error="
            $te(getError('maxNumberOfShares'))
              ? $t(getError('maxNumberOfShares'))
              : getError('maxNumberOfShares')"
          class="w-full"
        >
          <UInputNumber
            v-model="shareValues.maxNumberOfShares"
            :placeholder="$t(`label.${translationPath}MaximumNumberOf`)"
            :disable-wheel-change="true"
            :ui="{
              base: 'w-full rounded-md border-0 placeholder:text-dimmed'
                + ' disabled:cursor-not-allowed disabled:opacity-75 transition-colors'
                + ' px-2.5 pb-2 pt-6 text-base gap-1.5 ring-0 ring-transparent peer rounded-t-sm'
                + ' rounded-b-none bg-bcGovGray-100 shadow-bcGovInput focus:ring-0 focus:outline-none'
                + ' focus:shadow-bcGovInputFocus text-bcGovGray-900 focus-visible:ring-0 text-left'
            }"
            class="w-full text-center [&>input]:text-left [&>input]:p-[18px]"
            @keydown="clearErrors('maxNumberOfShares')"
            @focusin="maxSharesFocusInHandler()"
          >
            <template #decrement>
              <span />
            </template>
            <template #increment>
              <span />
            </template>
          </UInputNumber>
        </UFormField>
      </div>
      <URadioGroup
        v-model="hasNoMaxShares"
        data-testid="noMaxShares-radio"
        :items="[$t('label.noMax')]"
        :ui="{
          label: 'text-base'
        }"
        @change="noMaxSharesChangeHandler()"
      />

      <hr class="border-bcGovGray-300">

      <div v-if="!isSeries">
        <div class="flex">
          <URadioGroup
            v-model="hasNoParValue"
            data-testid="parValue-radio"
            :items="['']"
            class="flex-0 mr-3 align-bottom text-base"
            :ui="{
              container: 'text-base h-[56px]'
            }"
            @change="parValueChangeHandler()"
          />
          <div class="flex gap-4 w-full">
            <UFormField
              :error="
                $te(getError('parValue'))
                  ? $t(getError('parValue'))
                  : getError('parValue')"
              class="mr-4 w-[30%]"
            >
              <UInputNumber
                v-model="shareValues.parValue"
                :placeholder="$t('label.parValue')"
                :disable-wheel-change="true"
                :ui="{
                  base: 'w-full rounded-md border-0 placeholder:text-dimmed'
                    + ' disabled:cursor-not-allowed disabled:opacity-75 transition-colors'
                    + ' px-2.5 pb-2 pt-6 text-base gap-1.5 ring-0 ring-transparent peer rounded-t-sm'
                    + ' rounded-b-none bg-bcGovGray-100 shadow-bcGovInput focus:ring-0 focus:outline-none'
                    + ' focus:shadow-bcGovInputFocus text-bcGovGray-900 focus-visible:ring-0 text-left'
                }"
                class="w-full text-center [&>input]:text-left [&>input]:p-[18px]"
                @focusin="parValueFocusInHandler()"
                @keydown="clearErrors('parValue')"
              >
                <!--                  @update:model-value="revalidateIfHasErrors('parValue')" -->
                <template #decrement>
                  <span />
                </template>
                <template #increment>
                  <span />
                </template>
              </UInputNumber>
            </UFormField>
            <UFormField
              :error="$te(getError('currency')) ? $t(getError('currency')) : getError('currency')"
              class="h-full flex-1 w-full"
            >
              <USelect
                v-model="shareValues.currency"
                data-testid="currency-select"
                :placeholder="$t('label.currency')"
                :items="currencies"
                class="p-[18px] w-full pl-2"
                @focus="parValueFocusInHandler()"
                @change="clearErrors('currency')"
              />
            </UFormField>
          </div>
        </div>
        <div class="mt-6">
          <URadioGroup
            v-model="hasNoParValue"
            data-testid="noParValue-radio"
            :items="[$t('label.noPar')]"
            :ui="{
              label: 'text-base'
            }"
            @change="noParValueChangeHandler()"
          />
        </div>
      </div>
      <div v-else>
        <!-- is a series -->
        <div v-if="shareClasses?.[editingSeriesParent]?.hasParValue !== false" class="flex gap-4 w-full">
          <UFormField class="mr-4 w-[30%]">
            <UInput
              :value="shareClasses?.[editingSeriesParent]?.parValue"
              :readonly="true"
              :disable-wheel-change="true"
              :disabled="true"
              variant="ghost"
              :ui="{
                base: 'w-full rounded-md border-0 border-b-1 border-dashed placeholder:text-dimmed'
                  + ' disabled:cursor-not-allowed disabled:opacity-75 transition-colors'
                  + ' px-2.5 pb-2 pt-6 text-base gap-1.5 ring-0 ring-transparent peer rounded-t-sm'
                  + ' rounded-b-none bg-bcGovGray-100 shadow-bcGovInput focus:ring-0 focus:outline-none'
                  + ' focus:shadow-bcGovInputFocus text-bcGovGray-900 focus-visible:ring-0 text-left'
              }"
              class="w-full text-center [&>input]:text-left [&>input]:p-[18px]"
            />
          </UFormField>
          <UFormField class="h-full flex-1 w-full">
            <UInput
              :value="shareClasses?.[editingSeriesParent]?.currency"
              :readonly="true"
              :disabled="true"
              variant="ghost"
              :ui="{
                base: 'w-full rounded-md border-0 border-b-1 border-dashed placeholder:text-dimmed'
                  + ' disabled:cursor-not-allowed disabled:opacity-75 transition-colors'
                  + ' px-2.5 pb-2 pt-6 text-base gap-1.5 ring-0 ring-transparent peer rounded-t-sm'
                  + ' rounded-b-none bg-bcGovGray-100 shadow-bcGovInput focus:ring-0 focus:outline-none'
                  + ' focus:shadow-bcGovInputFocus text-bcGovGray-900 focus-visible:ring-0 text-left'
              }"
              class="w-full text-center [&>input]:text-left [&>input]:p-[18px]"
            />
          </UFormField>
        </div>
        {{ shareClasses?.[editingSeriesParent]?.hasParValue === false ? $t('label.noPar') : '' }}
      </div>

      <hr class="border-bcGovGray-300">

      <UCheckbox
        v-model="shareValues.hasRightsOrRestrictions"
        :label="$t('label.hasRightsOrRestrictions')"
        :ui=" {
          base: 'mt-1',
          label: 'pl-2'
        }"
        @update:model-value="rightsChangeHandler"
      />
      <div class="flex justify-end space-x-4 pl-2 items-center">
        <div
          v-if="formError && filingStore.sectionHasOpenForm(PageSection.SHARES)"
          class="text-outcomes-error text-sm"
        >
          {{ $t(formError) }}
        </div>
        <UButton
          :label="$t('label.done')"
          color="primary"
          class="rounded"
          data-testid="addEditSharesDone"
          @click="done()"
        />
        <UButton
          :label="$t('label.cancel')"
          variant="outline"
          class="rounded"
          data-testid="addEditSharesCancel"
          @click="cancel()"
        />
      </div>
    </div>
  </ConnectFormSection>
</template>
