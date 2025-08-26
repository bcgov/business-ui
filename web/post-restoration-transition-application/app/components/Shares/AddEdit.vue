<script lang="ts" setup>
import currencySymbolMap from 'currency-symbol-map/map'

const t = useNuxtApp().$i18n.t
const filingStore = usePostRestorationTransitionApplicationStore()
const {
  shareClasses,
  editingShareIndex
} = storeToRefs(filingStore)

const errorStore = usePostRestorationErrorsStore()
const {
  shareErrors
} = storeToRefs(errorStore)

const emit = defineEmits(['cancel', 'done'])
const SHARES_TEXT = ' Shares'

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
      priority: shareClasses.value.length + 1,
      series: []
    }
    shareName.value = ''
  }

  hasNoMaxShares.value = shareValues.value.hasMaximumShares ? '' : t('label.noMax')
  hasNoParValue.value = shareValues.value.hasParValue ? '' : t('label.noPar')
}

watch(shareClasses, resetData, { deep: true })

const firstParChange = ref(true)
const firstMaxChange = ref(true)

const shareValues = ref<Share>(
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
          priority: shareClasses.value.length + 1,
          series: []
        }
    )
  )
)

const hasNoMaxShares = ref<string>(shareValues.value.hasMaximumShares ? '' : t('label.noMax'))
const hasNoParValue = ref<string>(shareValues.value.hasParValue ? '' : t('label.noPar'))

const shareName = ref<string>(
  shareValues?.value?.name.substring(0,
                                     shareValues?.value?.name?.length - SHARES_TEXT.length)
  || ''
)

const maxSharesChangeHandler = () => {
  shareValues.value.hasMaximumShares = true
  if (firstMaxChange.value) {
    shareValues.value.maxNumberOfShares = undefined
  }
  firstMaxChange.value = false
  hasNoMaxShares.value = ''
}

const noMaxSharesChangeHandler = () => {
  shareValues.value.hasMaximumShares = false
  firstMaxChange.value = false
  hasNoMaxShares.value = t('label.noMax') }

const parValueChangeHandler = () => {
  shareValues.value.hasParValue = true
  if (firstParChange.value) {
    shareValues.value.parValue = undefined
    shareValues.value.currency = undefined
  }
  firstParChange.value = false
  hasNoParValue.value = ''
}

const noParValueChangeHandler = () => {
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

const revalidateIfHasErrors = (errorField: string) => {
  if (shareErrors.value[getErrorIndex()]?.[errorField]?.[0]) {
    shareValues.value.name = shareName.value
    cleanData()
    errorStore.verifyShareClasses(getWorkingShareClasses())
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

    if (Object.keys(shareErrors.value[getErrorIndex()]).length > 0) {
      return
    }
    shareValues.value.name = shareName.value + SHARES_TEXT
    if (editingShareIndex.value !== -1) {
      shareClasses.value[editingShareIndex.value] = shareValues.value
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
  <div>
    <div class="flex">
      <div class="font-bold inline-flex text-sm flex-1">
        {{ editingShareIndex === -1 ? $t('label.add') : $t('label.edit') }}
        {{ $t('label.shareClass') }}
      </div>

      <div class="inline-block ml-6 flex-auto space-y-6">
        <UFormField :error="$te(getError('name')) ? $t(getError('name')) : getError('name')">
          <UInput
            v-model="shareName"
            :placeholder="$t('label.shareClassName')"
            class="w-full text-center [&>input]:text-left [&>input]:p-[18px]"
            @blur="revalidateIfHasErrors('name')"
          >
            <template #trailing>
              <div class="text-base text-bcGovColor-midGray">
                {{ $t('label.shares') }}
              </div>
            </template>
          </UInput>
        </UFormField>
        <div class="text-sm text-gray-500 -mt-6 ml-4">
          {{ $t('text.helperText.shareClassName') }}
        </div>

        <hr class="border-bcGovGray-300">

        <div class="flex">
          <URadioGroup
            v-model="hasNoMaxShares"
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
              :placeholder="$t('label.maximumNumberOfShares')"
              :disable-wheel-change="true"
              :ui="{
                base: 'w-full rounded-md border-0 placeholder:text-dimmed'
                  + ' disabled:cursor-not-allowed disabled:opacity-75 transition-colors'
                  + ' px-2.5 pb-2 pt-6 text-base gap-1.5 ring-0 ring-transparent peer rounded-t-sm'
                  + ' rounded-b-none bg-bcGovGray-100 shadow-bcGovInput focus:ring-0 focus:outline-none'
                  + ' focus:shadow-bcGovInputFocus text-bcGovGray-900 focus-visible:ring-0 text-left'
              }"
              class="w-full text-center [&>input]:text-left [&>input]:p-[18px]"
              @update:model-value="revalidateIfHasErrors('maxNumberOfShares')"
              @focusin="maxSharesChangeHandler()"
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
          :items="[$t('label.noMax')]"
          :ui="{
            label: 'text-base'
          }"
          @change="noMaxSharesChangeHandler()"
        />

        <hr class="border-bcGovGray-300">

        <div class="flex">
          <URadioGroup
            v-model="hasNoParValue"
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
                @focusin="parValueChangeHandler()"
                @update:model-value="revalidateIfHasErrors('parValue')"
              >
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
                :placeholder="$t('label.currency')"
                :items="currencies"
                class="p-[18px] w-full pl-2"
                @focus="parValueChangeHandler()"
                @update:model-value="revalidateIfHasErrors('currency')"
              />
            </UFormField>
          </div>
        </div>
        <div>
          <URadioGroup
            v-model="hasNoParValue"
            :items="[$t('label.noPar')]"
            :ui="{
              label: 'text-base'
            }"
            @change="noParValueChangeHandler()"
          />
        </div>

        <hr class="border-bcGovGray-300">

        <UCheckbox
          v-model="shareValues.hasRightsOrRestrictions"
          :label="$t('label.hasRightsOrRestrictions')"
        />
        <div class="flex justify-end space-x-4">
          <UButton
            :label="$t('label.done')"
            color="primary"
            class="rounded"
            @click="done()"
          />
          <UButton
            :label="$t('label.cancel')"
            variant="outline"
            class="rounded"
            @click="cancel()"
          />
        </div>
      </div>
    </div>
  </div>
</template>
