<script setup lang="ts">
import { h } from 'vue'
import type { FormErrorEvent, RadioGroupItem, RadioGroupValue } from '@nuxt/ui'
import { FormBusinessNameEdit, FormNameRequestNumber, ConnectI18nHelper } from '#components'

const {
  businessIdentifier,
  businessType,
  initialCompanyName,
  correctNameOptions,
  filingName,
  nrAllowedActionTypes,
  name,
  stateKey = 'business-name'
} = defineProps<{
  businessIdentifier: string
  businessType: CorpTypeCd
  initialCompanyName: string
  correctNameOptions: CorrectNameOption[]
  filingName: string
  nrAllowedActionTypes: NrRequestActionCode[]
  name?: string
  stateKey?: string
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const model = defineModel<NameRequestSchema>({ required: true })

const schema = getNameRequestSchema()

const { t } = useI18n()
const formTarget = 'company-name-form'
const { alerts, attachAlerts } = useFilingAlerts(stateKey)
const { targetId, messageId } = attachAlerts(formTarget, model)

const numberedName = `${businessIdentifier} B.C. ${getNumberedDesignation(businessType)}`

const editNameFormRef = useTemplateRef('edit-name-form')
const nrNumFormRef = useTemplateRef('nr-num-form')

const nameChangeOptions = computed(() => [
  // FUTURE: add in AML CorrectNameOption values (CORRECT_AML_ADOPT, CORRECT_AML_NUMBERED)
  ...(
    correctNameOptions.includes(CorrectNameOption.CORRECT_NAME)
      ? [{ 
        label: t('label.companyName'),
        description: 'Correct typographical errors in the existing company name.',
        value: CorrectNameOption.CORRECT_NAME
      }]
      : []
  ),
  ...(
    correctNameOptions.includes(CorrectNameOption.CORRECT_NAME_TO_NUMBER)
      ? [{
        label: t('label.incorporationNumber'),
        value: CorrectNameOption.CORRECT_NAME_TO_NUMBER
      }]
      : []
  ),
  ...(
    correctNameOptions.includes(CorrectNameOption.CORRECT_NEW_NR)
      ? [{
        label: t('label.newNameRequestNumber'),
        altLabel: t('label.useNewNrNumber'), // used when this is the only option, not an aria label
        value: CorrectNameOption.CORRECT_NEW_NR
      }]
      : []
  )
])

function renderOption(item: RadioGroupItem & { value?: RadioGroupValue | CorrectNameOption }) {
  switch (item.value) {
    case CorrectNameOption.CORRECT_NAME:
      return h(
        FormBusinessNameEdit,
        {
          'modelValue': model.value,
          'ref': 'edit-name-form',
          'onUpdate:modelValue': v => model.value = v
        }
      )
    case CorrectNameOption.CORRECT_NAME_TO_NUMBER:
      return h(
        ConnectI18nHelper,
        {
          as: 'p',
          translationPath: 'label.useTheCorporationNumberAsTheName',
          corpnum: businessIdentifier,
          class: 'text-neutral'
        }
      )
    default: // CorrectNameOption.CORRECT_NEW_NR
      return h(
        FormNameRequestNumber,
        {
          'modelValue': model.value,
          'ref': 'nr-num-form',
          businessType,
          filingName,
          nrAllowedActionTypes,
          'onUpdate:modelValue': v => model.value = v
        }
      )
  }
}

function onOptionChange(value: string | undefined) {
  const option = value as CorrectNameOption | undefined

  // reset model each time accordian is changed
  model.value.legalName = ''
  model.value.nrNumber = ''
  model.value.changeToNumbered = false

  nextTick(() => {
    // add/update cases as necessary
    switch (option) {
      case CorrectNameOption.CORRECT_NAME:
        model.value.legalName = initialCompanyName
        break
      case CorrectNameOption.CORRECT_NAME_TO_NUMBER:
        model.value.legalName = numberedName
        break
      default:
        break
    }
  })
}

async function onDone() {
  try {  
    await editNameFormRef.value?.formRef?.validate()
    await nrNumFormRef.value?.formRef?.validate()

    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

// init active option and conditionally set legalName if only 1 name change option available
onMounted(() => {
  const option = nameChangeOptions.value[0]?.value
  model.value.changeOption = option
  if (option === CorrectNameOption.CORRECT_NAME) {
    model.value.legalName = initialCompanyName
  }
})

// TODO
// UPDATE HOW DATA IS SET RESET - done
// ENSURE THERES A DEFAULT RADIO OPTION - done 
// UPDATE NAME REQUEST MODEL CHANGE OPTION AND ATTACH V MODEL - done
// UPDATE DRAFT STATE INIT - done
// ENSURE NR OPTION POPULATES CORRECTLY - done
// FIX TS ERRORS - done
// ENSURE SET SUB FORM ALERT CHECK WORKS - done
// ADD DATA TO TASK GUARD WATCHERS - done
// READONLY SECTION FOR REVIEW PAGE - done
// UPDATE CONTACT POIONT IN PAYLOAD
// UPDATE COMPLETING PARTY IN PAYLOAD
// ADD I18N TRANSLATIONS
// WRITE TESTS
</script>

<template>
  <UForm
    :data-testid="formTarget"
    :schema
    :name
    nested
    :state="(model as any)"
    @keydown.enter.prevent.stop="onDone"
    class="space-y-6"
  >
    <template v-if="nameChangeOptions.length > 1">
      <p>
        {{ $t('text.selectWayToCorrectName') }}
      </p>
      <URadioGroup
        v-model="model.changeOption"
        :items="nameChangeOptions"
        variant="card"
        :ui="{
          fieldset: 'gap-y-4',
          label: 'text-base group-has-[button[data-active]]:font-bold',
          description: 'text-base group-not-has-[button[data-active]]:hidden mt-2',
          item: 'group not-has-data-active:bg-shade',
          container: 'mt-0.5',
          base: 'ring-neutral ring-2'
        }"
        @update:model-value="onOptionChange"
      >
        <template #description="{ item }">
          <KeepAlive>
            <component v-if="model.changeOption === item.value" :is="renderOption(item)" />
          </KeepAlive>
        </template>
      </URadioGroup>
    </template>

    <div v-else-if="nameChangeOptions[0]" class="pb-6 pt-2 px-3 space-y-4">
      <p>{{ nameChangeOptions[0].altLabel }}</p>
      <component :is="renderOption(nameChangeOptions[0])" />
    </div>

    <div class="flex flex-col sm:flex-row gap-2 sm:gap-6 justify-end items-center">
      <FormAlertMessage
        :id="messageId"
        :message="alerts[formTarget]"
      />
      <UButton
        variant="outline"
        :label="t('label.cancel')"
        class="w-full sm:w-min justify-center"
        @click="$emit('cancel')"
      />
      <UButton
        :data-alert-focus-target="targetId"
        :aria-describedby="messageId"
        :label="t('label.done')"
        class="w-full sm:w-min justify-center"
        @click="onDone"
      />
    </div>
  </UForm>
</template>
