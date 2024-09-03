<script setup lang="ts">
import { z } from 'zod'
import type { Form } from '#ui/types'

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
    label: 'Reset my passcode and remove business',
    help: 'Business will be removed from this account|New business passcode will be generated and will cancel the old business passcode|New business passcode will be sent through email to the person who will be responsible for managing this business moving forward'
  },
  {
    value: 'noReset',
    label: 'Do not reset my passcode and remove business',
    help: 'Business will be removed from this account|The current passcode for this business will be cancelled|You will not be able to add this business back to your account without a new passcode'
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
  email: z.string({ required_error: 'Email address is required.' }).email({ message: 'Please enter a valid email address.' }),
  confirmEmail: z.string({ required_error: 'Email confirmation is required.' }).email({ message: 'Please enter a valid email address.' })
}).refine(data => data.email === data.confirmEmail, {
  message: 'Email addresses must match',
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
    <p aria-hidden="true" class="-mt-8">
      Please select one of the two choices below to remove this business from the account
    </p>
    <URadioGroup
      v-model="radio"
      legend="Please select one of the two choices below to remove this business from the account"
      :options
      :ui="{
        legend: 'sr-only',
      }"
      :ui-radio="{
        label: 'text-base font-medium text-bcGovColor-midGray dark:text-gray-200',
        base: 'size-4',
        container: 'flex items-center h-full',
      }"
    >
      <template #help="{ option }">
        <ul class="ml-4 list-disc pt-2">
          <li
            v-for="(item, i) in option.help.split('|')"
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
            class="-ml-7 space-y-4 px-10"
          >
            <UFormGroup name="email">
              <UInput
                v-model="emailState.email"
                class="text-bcGovColor-midGray"
                variant="bcGovLg"
                aria-label="Email Address"
                placeholder="Email Address"
              />
            </UFormGroup>
            <UFormGroup name="confirmEmail">
              <UInput
                v-model="emailState.confirmEmail"
                class="text-bcGovColor-midGray"
                variant="bcGovLg"
                aria-label="Confirm Email Address"
                placeholder="Confirm Email Address"
              />
            </UFormGroup>
            <button ref="submitBtnRef" type="submit" class="hidden" />
          </div>
        </UForm>
      </template>
    </URadioGroup>

    <div class="flex flex-wrap items-center justify-end gap-4">
      <UButton
        label="Remove"
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
