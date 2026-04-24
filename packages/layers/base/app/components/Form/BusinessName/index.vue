<script setup lang="ts">
import { h } from 'vue'
import type { FormErrorEvent } from '@nuxt/ui'
import { FormBusinessNameEdit, FormNameRequestNumber, ConnectI18nHelper } from '#components'
import { RESET_CONTENT } from 'http-status-codes';

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

onMounted(() => console.log('business name form: ', stateKey))

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
watch(alerts, (v) => console.log('form alerts: ', v))

const numberedName = `${businessIdentifier} B.C. ${getNumberedDesignation(businessType)}`

const activeCorrectNameOption = ref<CorrectNameOption | undefined>(undefined)
const editNameFormRef = useTemplateRef('edit-name-form')
const nrNumFormRef = useTemplateRef('nr-num-form')

const nameChangeOptions = computed<BusinessNameChangeOption[]>(() => [
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
        value: CorrectNameOption.CORRECT_NEW_NR
      }]
      : []
  )
])

function renderOption(item: BusinessNameChangeOption) {
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

function onChangeToNumberedChange() {
  const checked = model.value.changeToNumbered
  if (checked) {
    model.value.legalName = numberedName
  }
}

function onActiveAccordianChange(v: string | string[] | undefined) {
  if (v === undefined) {
    activeCorrectNameOption.value = undefined
    return
  }

  // track which name change option to validate on done click
  if (v) {
    const index = parseInt(v as string) // we know this is a string, can only be string[] if accordian prop `type` = 'multiple'
    const selectedOption = nameChangeOptions.value[index]

    if (selectedOption) {
      activeCorrectNameOption.value = selectedOption.changeOption
    }
  }

  // reset model each time accordian is changed
  model.value.legalName = ''
  model.value.nrNumber = ''
  model.value.changeToNumbered = false

  // set legal name to original name when opening `Edit the company name option`
  nextTick(() => {
    if (activeCorrectNameOption.value === CorrectNameOption.CORRECT_NAME) {
      model.value.legalName = initialCompanyName
    }
  })
}

// NB: this functionality is copying what exists currently
// design audit will need to be done to determine any UX or validation changes
async function onDone() {
  try {
    const option = activeCorrectNameOption.value
    // FUTURE: add in AML CorrectNameOption values (CORRECT_AML_ADOPT, CORRECT_AML_NUMBERED)
    if (
      option === undefined
      || (option === CorrectNameOption.CORRECT_NAME_TO_NUMBER && !model.value.changeToNumbered)
    ) {
      // do nothing if no option was selected
      // or last option was changeToNumbered and checkbox is unchecked
      return
    } else if (option === CorrectNameOption.CORRECT_NAME) {
      await editNameFormRef.value?.formRef?.validate()
    } else { // CorrectNameOption.CORRECT_NEW_NR
      await nrNumFormRef.value?.formRef?.validate()
    }

    emit('done')
  } catch (e) {
    onFormSubmitError(e as FormErrorEvent)
  }
}

// init active option and conditionally set legalName if only 1 name change option available
onMounted(() => {
  if (nameChangeOptions.value.length === 1) {
    const option = nameChangeOptions.value[0]?.changeOption
    activeCorrectNameOption.value = option
    if (option === CorrectNameOption.CORRECT_NAME) {
      model.value.legalName = initialCompanyName
    }
  }
})

const value = ref(CorrectNameOption.CORRECT_NAME)

UPDATE HOW DATA IS SET RESET
ENSURE THERES A DEFAULT RADIO OPTION
UPDATE NAME REQUEST MODEL CHANGE OPTION AND ATTACH V MODEL
UPDATE DRAFT STATE INIT
FIX TS ERRORS
ADD I18N TRANSLATIONS
WRITE TESTS
ENSURE SET SUB FORM ALERT CHECK WORKS
ADD DATA TO TASK GUARD WATCHERS
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
        v-model="value"
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
      >
        <template #description="{ item }">
          <KeepAlive>
            <component v-if="value === item.value" :is="renderOption(item)" />
          </KeepAlive>
        </template>
      </URadioGroup>
    </template>

    <div v-else-if="nameChangeOptions[0]" class="pb-6 pt-2 px-3 space-y-4">
      <div class="font-bold text-neutral-highlighted">
        {{ nameChangeOptions[0].label }}
      </div>
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
