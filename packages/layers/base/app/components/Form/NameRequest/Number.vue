<script setup lang="ts">
import type { Form, InputProps } from '@nuxt/ui'

const {
  businessIdentifier = '',
  businessType,
  nrAllowedActionTypes,
  filingName,
  name,
  nrAllowedBusinessTypes
} = defineProps<{
  businessType: CorpTypeCd
  filingName: string
  nrAllowedActionTypes: NrRequestActionCode[]
  businessIdentifier?: string
  name?: string
  nrAllowedBusinessTypes?: CorpTypeCd[]
}>()

const model = defineModel<NameRequestSchema>({ required: true })

const { t } = useNuxtApp().$i18n
const service = useBusinessService()

const formRef = useTemplateRef<Form<NameRequestSchema>>('nr-number-form')

const validationError = ref('')
// We only care about nrNum for the form field (other fields are still used, but not in this form schema)
const schema = getNameRequestSchema()
  .pick({ nrNumber: true })
  .superRefine((_state, ctx) => {
    if (validationError.value) {
      ctx.addIssue({
        code: 'custom',
        path: ['nrNumber'],
        message: validationError.value
      })
    }
  })

const isLoading = ref(false)

/* Return the allowed nr action descriptions as a string separated by commas */
const getAllowedNrActionDescs = () => {
  return nrAllowedActionTypes
    .map(val => t(`nameRequestAction.${val}`))
    .reduce((prev, cur) => prev ? `${prev}, ${cur}` : cur)
}

/* Return an error message if the name request is invalid. */
const getNrErrorMsg = (nameRequest: NameRequest) => {
  const state = getNrState(nameRequest)
  // verify nr state
  switch (state) {
    case NameRequestState.EXPIRED:
    case NameRequestState.CONSUMED:
    case NameRequestState.NEED_CONSENT:
    case NameRequestState.NOT_APPROVED:
      return t(`validation.nrNumber.errorState.${state}`)

    default:
      if (![NameRequestState.APPROVED, NameRequestState.CONDITIONAL].includes(state)) {
        // Should never happen
        return t(`validation.nrNumber.errorState.${NameRequestState.INVALID}`)
      }
  }
  // verify nr action code
  if (!nrAllowedActionTypes.includes(nameRequest.request_action_cd)) {
    return t(
      `validation.nrNumber.errorState.${NameRequestState.INVALID_ACTION_TYPE}`,
      {
        expectedNrActionTypes: getAllowedNrActionDescs(),
        nrActionType: t(`nameRequestAction.${nameRequest.request_action_cd}`, 0),
        filingName
      }
    )
  }
  // verify nr entity type
  if (
    (!nrAllowedBusinessTypes && businessType !== nameRequest.legalType)
    || (nrAllowedBusinessTypes && !nrAllowedBusinessTypes?.includes(nameRequest.legalType))
  ) {
    return nameRequest.request_action_cd === NrRequestActionCode.CONVERSION
      ? t(
        `validation.nrNumber.errorState.${NameRequestState.INVALID_LEGAL_TYPE_FOR_ACTION_TYPE}`,
        {
          businessType: getCorpFullDescription(businessType),
          nrBusinessType: getCorpFullDescription(nameRequest.legalType)
        })
      : t(
        `validation.nrNumber.errorState.${NameRequestState.INVALID_LEGAL_TYPE}`,
        {
          expectedNrBusinessType: getCorpFullDescription(businessType),
          nrBusinessType: getCorpFullDescription(nameRequest.legalType)
        })
  }
}

const validateNrNumber = async (nrNum: string) => {
  icon.value = { class: 'text-primary' }
  if (nrNum.length && NR_NUM_REGEX.test(nrNum)) {
    isLoading.value = true
    formRef.value?.clear('nrNumber')
    try {
      const nameRequest = await service.getLinkedNameRequest(businessIdentifier, nrNum)
      validationError.value = getNrErrorMsg(nameRequest) ?? ''
      if (validationError.value) {
        icon.value = { class: 'text-error' }
      } else {
        icon.value = { class: 'text-success', name: 'i-mdi-check' }
        model.value.legalName = getNrApprovedName(nameRequest)
      }
    } catch (err: unknown) {
      icon.value = { class: 'text-error' }
      const statusCode = getErrorStatus(err)
      validationError.value = [400, 403, 404].includes(statusCode!)
        ? t(`validation.nrNumber.errorState.${NameRequestState.NOT_FOUND}`)
        : t('validation.nrNumber.errorState.undefined')
    } finally {
      isLoading.value = false
    }
  } else {
    // invalid format - set error validation
    validationError.value = t('validation.nrNumber.invalid')
  }
  formRef.value?.validate({ silent: true })
}

watchDebounced(() => model.value.nrNumber, validateNrNumber, { debounce: 1000 })

const icon = ref<{ class: string, name?: string }>({ class: 'text-primary' })

// Compute UInput props based on loading state and iconSetting
const uInputProps = computed<InputProps>(() => {
  return {
    loading: isLoading.value,
    trailing: true,
    ui: {
      trailingIcon: `size-7 ${icon.value.class}`
    },
    trailingIcon: icon.value?.name
  }
})

// Provide custom props for UInput
provide('UInput-props-nr-number-input', uInputProps)

defineExpose({ formRef })
</script>

<template>
  <UForm
    ref="nr-number-form"
    :schema="schema"
    nested
    :name
  >
    <ConnectFormInput
      v-model="model.nrNumber"
      data-testid="form-group-nr-number"
      :help="$t('text.exampleNR1234567')"
      input-id="nr-number-input"
      :label="$t('label.enterTheNrNumber')"
      mask="NR #######"
      name="nrNumber"
    />
  </UForm>
</template>
