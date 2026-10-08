<script setup lang="ts">
import type { FormError, Form } from '@nuxt/ui'
import type { MessageFunction, VueMessageType } from 'vue-i18n'

const {
  name,
  order,
  editableName = false,
  leadInTranslationPath = 'text.completingPartyConfirmLeadIn'
} = defineProps<{
  name?: string
  order?: string | number
  /** render a required legal-name input (staff filing on a client's behalf); otherwise the auth user's name is used */
  editableName?: boolean
  /** i18n path for the confirmation lead-in sentence - consumers may override (e.g. the continuation out variant) */
  leadInTranslationPath?: string
}>()

const { t, tm, rt } = useI18n()
const { authUser } = useConnectAuth()

const schema = getConfirmCompletingPartySchema()

const model = defineModel<ConfirmCompletingPartySchema>({ required: true })

// default the completing party to the signed-in user when the name isn't staff-editable
if (!editableName && !model.value.completingPartyName) {
  model.value.completingPartyName = authUser.value.fullName
}

const formRef = useTemplateRef<Form<ConfirmCompletingPartySchema>>('confirm-completing-party-form')

const formErrors = computed<{
  name: FormError | undefined
  confirmed: FormError | undefined
}>(() => {
  const errors = formRef.value?.getErrors()
  return {
    name: errors?.find(e => e.name === 'completingPartyName'),
    confirmed: errors?.find(e => e.name === 'confirmed')
  }
})

const displayName = computed(() =>
  model.value.completingPartyName || `[${t('label.legalNameOfCompletingParty')}]`
)

const bullets = computed(() =>
  (tm('text.completingPartyConfirmBullets') as MessageFunction<VueMessageType>[]).map(b => rt(b))
)

defineExpose({
  formRef
})
</script>

<template>
  <!-- nested forms resolve their state from the parent form via `name` (DocumentDelivery pattern) -->
  <UForm
    ref="confirm-completing-party-form"
    data-testid="confirm-completing-party-section"
    :schema
    :name
    nested
  >
    <ConnectFieldset
      :label="order
        ? `${order}. ${$t('label.completingPartyConfirmation')}`
        : $t('label.completingPartyConfirmation')"
      :description="$t('text.completingPartyConfirmationDescription')"
      :error="formErrors.name || formErrors.confirmed"
      body-variant="card"
      orientation="vertical"
    >
      <div class="py-6">
        <!-- only the checkbox error message renders under the Confirm label - a name error
          shows inline under its input (boolean keeps the error styling without the message) -->
        <ConnectFormFieldWrapper
          :label="$t('label.confirm')"
          orientation="horizontal"
          :error="formErrors.confirmed || !!formErrors.name"
          show-error-msg
        >
          <div class="space-y-4">
            <ConnectFormInput
              v-if="editableName"
              v-model="model.completingPartyName"
              input-id="completing-party-name-input"
              :label="$t('label.legalNameOfCompletingParty')"
              name="completingPartyName"
            />
            <UFormField
              name="confirmed"
              :ui="{
                error: 'sr-only'
              }"
            >
              <div class="bg-shade rounded p-4">
                <UCheckbox
                  v-model="model.confirmed"
                  :ui="{ root: 'items-start' }"
                  :aria-invalid="!!formErrors.confirmed"
                  data-testid="confirm-completing-party-checkbox"
                >
                  <template #label>
                    <div class="space-y-2">
                      <ConnectI18nHelper
                        as="p"
                        :translation-path="leadInTranslationPath"
                        :name="displayName"
                      />
                      <ul class="list-disc ml-6 space-y-2">
                        <li v-for="(bullet, i) in bullets" :key="i">
                          {{ bullet }}
                        </li>
                      </ul>
                    </div>
                  </template>
                </UCheckbox>
              </div>
            </UFormField>
          </div>
        </ConnectFormFieldWrapper>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
