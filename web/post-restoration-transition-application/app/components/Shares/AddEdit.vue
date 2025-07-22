<script setup lang="ts">
import currencySymbolMap from 'currency-symbol-map/map'
import type * as z from 'zod'

const t = useNuxtApp().$i18n.t
const filingStore = usePostRestorationTransitionApplicationStore()
const {
  shareClasses,
  editingShareIndex
} = storeToRefs(filingStore)

const emit = defineEmits(['cancel', 'done'])
const SHARES_TEXT = ' Shares'

const resetData = () => {
  if (editingShareIndex.value !== -1) {
    shareValues.value
      = JSON.parse(
        JSON.stringify(
          shareClasses?.value?.[editingShareIndex.value]
        ))
    shareName.value = shareValues?.value?.name.substring(0, shareValues?.value?.name?.length - SHARES_TEXT.length)
  } else {
    shareValues.value = {
      id: null,
      name: '',
      currency: '',
      hasMaximumShares: false,
      hasParValue: false,
      hasRightsOrRestrictions: false,
      maxNumberOfShares: null,
      parValue: null,
      priority: shareClasses.value.length + 1,
      series: []
    }
    shareName.value = ''
  }

  hasMaxShares.value = shareValues.value.hasMaximumShares ? '' : 'false'
  hasNoMaxShares.value = shareValues.value.hasMaximumShares ? 'false' : t('label.noMax')
  hasParValue.value = shareValues.value.hasParValue ? '' : 'false'
  hasNoParValue.value = shareValues.value.hasParValue ? 'false' : t('label.noPar')
}

watch(shareClasses, resetData, { deep: true })

const shareValues = ref<Share>(
  JSON.parse(
    JSON.stringify(
      shareClasses?.value?.[editingShareIndex.value]
      || {
          id: null,
          name: '',
          currency: '',
          hasMaximumShares: false,
          hasParValue: false,
          hasRightsOrRestrictions: false,
          maxNumberOfShares: null,
          parValue: null,
          priority: shareClasses.value.length + 1,
          series: []
        }
    )
  )
)

const hasMaxShares = ref<string>(shareValues.value.hasMaximumShares ? '' : 'false')
const hasNoMaxShares = ref<string>(shareValues.value.hasMaximumShares ? 'false' : t('label.noMax'))
const hasParValue = ref<string>(shareValues.value.hasParValue ? '' : 'false')
const hasNoParValue = ref<string>(shareValues.value.hasParValue ? 'false' : t('label.noPar'))
const errors = ref<z.ZodError[]>([])

const shareName = ref<string>(
  shareValues?.value?.name.substring(0,
                                     shareValues?.value?.name?.length - SHARES_TEXT.length)
                                   || ''
)

const clickMaxShares = () => {
  shareValues.value.hasMaximumShares = true
  hasMaxShares.value = ''
  hasNoMaxShares.value = 'false'
}

const clickNoMaxShares = () => {
  shareValues.value.hasMaximumShares = false
  hasMaxShares.value = 'false'
  hasNoMaxShares.value = t('label.noMax')
}

const clickParValue = () => {
  shareValues.value.hasParValue = true
  hasParValue.value = ''
  hasNoParValue.value = 'false'
}

const clickNoParValue = () => {
  shareValues.value.hasParValue = false
  hasParValue.value = 'false'
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

const done = () => {
  if (hasChanges()) {
    shareValues.value.name = shareName.value
    cleanData()
    const validationResults = seriesSchema.safeParse(shareValues.value)
    const names = shareClasses.value.map(share => share.name.toLowerCase())
    if (names.includes((shareName.value + SHARES_TEXT).toLowerCase())) {
      errors.value = []
      errors.value['name'] = 'Share name already exists'
      return
    }
    if (!validationResults.success) {
      errors.value = []
      for (const error of validationResults.error.errors) {
        if (error.path?.length > 0) {
          errors.value[error.path[0]] = error.message
        }
      }
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
    shareValues.value.currency = null
    shareValues.value.parValue = null
  } else {
    const val: number = parseInt(shareValues.value.parValue) || 0
    if (val == shareValues.value.parValue) {
      shareValues.value.parValue = val
    }
  }

  if (shareValues.value.hasMaximumShares === false) {
    shareValues.value.maxNumberOfShares = null
  } else {
    const val: number = parseInt(shareValues.value.maxNumberOfShares) || 0
    if (val == shareValues.value.maxNumberOfShares) {
      shareValues.value.maxNumberOfShares = val
    }
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
        <UFormField :error="errors?.name">
          <UInput
            v-model="shareName"
            :placeholder="$t('label.shareClassName')"
            class="w-full"
          >
            <template #trailing>
              <div class="text-[16px] text-bcGovColor-midGray">
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
            v-model="hasMaxShares"
            :items="['']"
            class="flex-0 mr-3 align-bottom text-base"
            :ui="{
              container: 'text-base h-[56px]'
            }"
            @change="clickMaxShares()"
          />
          <UFormField :error="errors.maxNumberOfShares">
            <UInput
              v-model="shareValues.maxNumberOfShares"
              :placeholder="$t('label.maximumNumberOfShares')"
              type="number"
              class="flex-auto"
            />
          </UFormField>
        </div>
        <div>
          <URadioGroup
            v-model="hasNoMaxShares"
            :items="[$t('label.noMax')]"
            @change="clickNoMaxShares()"
          />
        </div>

        <hr class="border-bcGovGray-300">

        <div class="flex">
          <URadioGroup
            v-model="hasParValue"
            :items="['']"
            class="flex-0 mr-3 align-bottom text-base"
            :ui="{
              container: 'text-base h-[56px]'
            }"
            @change="clickParValue()"
          />
          <div class="flex flex-auto">
            <UFormField :error="errors?.parValue" class="mr-2 w-[50%]">
              <UInput
                v-model="shareValues.parValue"
                :placeholder="$t('label.parValue')"
                type="number"
              />
            </UFormField>
            <UFormField
              :error="errors?.currency"
              class="h-full w-[50%]"
              :ui="{
                root: 'h-11 max-h-11',
                content: 'h-12 max-h-12'
              }"
            >
              <USelect
                v-model="shareValues.currency"
                :placeholder="$t('label.currency')"
                :items="currencies"
                class="h-[56px] w-full"
              />
            </UFormField>
          </div>
        </div>
        <div>
          <URadioGroup
            v-model="hasNoParValue"
            :items="[$t('label.noPar')]"
            @change="clickNoParValue()"
          />
        </div>

        <hr class="border-bcGovGray-300">

        <UCheckbox
          v-model="shareValues.hasRightsOrRestrictions"
          :label="$t('label.hasRightsOrRestrictions')"
        />
      </div>
    </div>
    <div class="flex justify-end space-x-2">
      <UButton
        :label="$t('label.done')"
        color="primary"
        @click="done()"
      />
      <UButton
        :label="$t('label.cancel')"
        variant="outline"
        @click="cancel()"
      />
    </div>
  </div>
</template>
