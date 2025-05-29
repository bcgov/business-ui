<script setup lang="ts">
import { z } from 'zod'
import type { Form } from '#ui/types'

const { t } = useI18n()

defineProps<{
  removeBusinessPayload: RemoveBusinessPayload
  loading: boolean
}>()

const emit = defineEmits<{
  confirm: [email: string, reset: boolean]
  close: [void]
}>()

const radio = ref('noReset')
const options = [
  {
    value: 'reset',
    label: t('modal.removeBusiness.passcode.form.radio.reset.label'),
    help: t('modal.removeBusiness.passcode.form.radio.reset.help')
  },
  {
    value: 'noReset',
    label: t('modal.removeBusiness.passcode.form.radio.noReset.label'),
    help: t('modal.removeBusiness.passcode.form.radio.noReset.help')
  }
]

const formRef = ref<Form<EmailSchema>>()
const submitBtnRef = ref()

type EmailSchema = z.infer<typeof emailSchema>

const emailState = reactive({
  email: '',
  confirmEmail: ''
})

const emailSchema = z.object({
  email: z.string({ required_error: t('modal.removeBusiness.passcode.form.email.error.required') }).email({ message: t('modal.removeBusiness.passcode.form.email.error.invalid') }),
  confirmEmail: z.string({ required_error: t('modal.removeBusiness.passcode.form.confirmEmail.error.required') }).email({ message: t('modal.removeBusiness.passcode.form.confirmEmail.error.invalid') })
}).refine(data => data.email === data.confirmEmail, {
  message: t('modal.removeBusiness.passcode.form.confirmEmail.error.match'),
  path: ['confirmEmail']
})

function removeBusiness () {
  if (radio.value === 'reset') {
    submitBtnRef.value?.click()
  } else {
    emit('confirm', '', false)
  }
}
</script>
<template>
  <div class="flex flex-col gap-4">
    <URadioGroup
      v-model="radio"
      :options
      :ui="{
        wrapper: 'relative flex items-start -mt-8',
        legend: 'text-base font-medium text-gray-700 dark:text-gray-200 mb-4'
      }"
      :ui-radio="{
        label: 'text-base font-medium text-bcGovColor-midGray dark:text-gray-200',
        base: 'size-4',
        container: 'flex items-center h-full',
      }"
    >
      <template #legend>
        <span>{{ $t('modal.removeBusiness.passcode.form.radio.legend') }}</span>
      </template>
      <template #help="{ option }">
        <ul class="ml-4 list-disc pt-2">
          <li
            v-for="(item, i) in option.help.split(',')"
            :key="i"
            class="text-base text-bcGovColor-midGray"
          >
            {{ item }}
          </li>
        </ul>
        <UForm
          ref="formRef"
          class="py-4"
          :schema="emailSchema"
          :state="emailState"
          @submit="$emit('confirm', emailState.email, true)"
          @error="handleFormErrorEvent"
        >
          <div
            v-if="radio === 'reset' && option.value === 'reset'"
            class="-ml-7 space-y-4 px-4 sm:px-10"
          >
            <UFormGroup name="email">
              <UInput
                v-model="emailState.email"
                class="text-bcGovColor-midGray"
                variant="bcGovLg"
                :aria-label="$t('modal.removeBusiness.passcode.form.email.arialabel')"
                :placeholder="$t('modal.removeBusiness.passcode.form.email.placeholder')"
              />
            </UFormGroup>
            <UFormGroup name="confirmEmail">
              <UInput
                v-model="emailState.confirmEmail"
                class="text-bcGovColor-midGray"
                variant="bcGovLg"
                :aria-label="$t('modal.removeBusiness.passcode.form.confirmEmail.arialabel')"
                :placeholder="$t('modal.removeBusiness.passcode.form.confirmEmail.placeholder')"
              />
            </UFormGroup>
            <button ref="submitBtnRef" type="submit" class="hidden" />
          </div>
        </UForm>
      </template>
    </URadioGroup>

    <div class="flex flex-wrap items-center justify-end gap-4">
      <UButton
        :label="$t('words.Remove')"
        :loading
        @click="removeBusiness"
      />
      <UButton
        :label="$t('btn.close')"
        color="gray"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
