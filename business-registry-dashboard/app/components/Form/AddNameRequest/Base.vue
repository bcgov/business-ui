<script setup lang="ts">
import type { MaskInputOptions } from 'maska'
import { z } from 'zod'
import type { FormError, FormSubmitEvent, Form } from '#ui/types'

const brdModal = useBrdModals()
const toast = useToast()

const emit = defineEmits<{
  showHelp: [void]
  nameRequestError: [void]
}>()

const alertText = ref('')
const formRef = ref<Form<NRSchema>>()
const formLoading = ref(false)
const state = reactive({
  email: '',
  phone: ''
})

const phoneMask: MaskInputOptions = ({
  mask: '###-###-####',
  eager: true
})

const nrSchema = z.object({
  email: z.string(),
  phone: z.string()
})

// const nrSchema = z.object({
//   email: z.string().email({ message: 'Please enter a valid email.' }).optional(),
//   phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, { message: 'Please enter a valid phone number (e.g., 123-456-7890).' }).optional()
// }).refine(data => data.email || data.phone, {
//   message: 'At least one contact method (email or phone) must be provided.',
//   path: ['phone', 'email'] // Optional: can also target a specific path
// }).superRefine((data, ctx) => {
//   if (data.email && data.phone) {
//     const emailValid = z.string().email().safeParse(data.email).success
//     const phoneValid = z.string().regex(/^\d{3}-\d{3}-\d{4}$/).safeParse(data.phone).success

//     if (!emailValid && !phoneValid) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: 'Both email and phone are invalid.',
//         path: ['email', 'phone']
//       })
//     } else if (!emailValid && phoneValid) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: 'Email is invalid; using phone instead.',
//         path: ['email']
//       })
//     } else if (emailValid && !phoneValid) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: 'Phone is invalid; using email instead.',
//         path: ['phone']
//       })
//     }
//   }
// })

type NRSchema = z.infer<typeof nrSchema>

const validate = (state: NRSchema): FormError[] => {
  alertText.value = ''

  const errors = []
  const phoneValid = z.string().regex(/^\d{3}-\d{3}-\d{4}$/).safeParse(state.phone).success
  const emailValid = z.string().email().safeParse(state.email).success
  if (!state.phone && !state.email) {
    alertText.value = 'At least one contact method (email or phone) must be provided.'
  } else if (state.phone && !state.email) {
    if (!phoneValid) {
      errors.push({ path: 'phone', message: 'Please enter a valid phone number (e.g., 123-456-7890).' })
    }
  } else if (!state.phone && state.email) {
    if (!emailValid) {
      errors.push({ path: 'email', message: 'Please enter a valid email.' })
    }
  } else if (state.phone && state.email) {
    if (!phoneValid && !emailValid) {
      alertText.value = 'Both fields are invalid. Please enter either a valid phone number or a valid email.'
      errors.push({ path: 'phone', message: 'Please enter a valid phone number (e.g., 123-456-7890).' })
      errors.push({ path: 'email', message: 'Please enter a valid email.' })
    }
  }

  return errors
}

async function onSubmit (event: FormSubmitEvent<NRSchema>) {
  // emit('nameRequestError')
  // Do something with data
  try {
    formLoading.value = true
    const emailValid = z.string().email().safeParse(event.data.email).success
    const phoneValid = z.string().regex(/^\d{3}-\d{3}-\d{4}$/).safeParse(event.data.phone).success

    if (phoneValid) {
      console.log('submitting phone: ', event.data.phone)
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // emit('nameRequestError')
          toast.add({ title: 'NR 1231231 was successfully added to your table.' })
          brdModal.manageNameRequest(false)
          resolve()
        }, 500)
      })
    } else if (emailValid) {
      console.log('submitting email: ', event.data.email)
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          emit('nameRequestError')
          resolve()
        }, 500)
      })
    }
  } catch (e) {
    // do something
  } finally {
    formLoading.value = false
  }
}
</script>
<template>
  <UForm
    ref="formRef"
    :state
    :validate-on="['submit']"
    :validate="validate"
    class="space-y-4"
    @submit="onSubmit"
    @error="handleFormErrorEvent"
  >
    <fieldset>
      <legend class="sr-only">
        Name Request Number and Applicant Phone Number or Email Address
      </legend>

      <div class="my-4">
        Enter either the applicant phone number OR applicant email that were used when the name was requested:
      </div>

      <div class="flex flex-col gap-4">
        <UFormGroup
          name="phone"
          help="Example: 555-555-5555"
        >
          <UInput
            v-model="state.phone"
            v-maska="phoneMask"
            placeholder="Applicant Phone Number"
            aria-label="Applicant Phone Number"
            variant="bcGovLg"
          />
        </UFormGroup>

        <span class="font-semibold">Or</span>

        <UFormGroup
          name="email"
          help="Example: name@email.com"
        >
          <UInput
            v-model="state.email"
            placeholder="Applicant Email Address"
            aria-label="Applicant Email Address"
            variant="bcGovLg"
          />
        </UFormGroup>
      </div>
    </fieldset>

    <UAlert
      v-if="alertText !== ''"
      icon="i-mdi-alert"
      color="red"
      variant="error"
      :description="alertText"
    />

    <div class="flex justify-between">
      <UButton
        label="Help"
        variant="ghost"
        icon="i-mdi-help-circle-outline"
        @click="$emit('showHelp')"
      />

      <div class="flex gap-2">
        <UButton
          label="Cancel"
          variant="outline"
          @click="brdModal.manageNameRequest(false)"
        />
        <UButton
          type="submit"
          label="Manage this Name Request"
          :loading="formLoading"
        />
      </div>
    </div>
  </UForm>
</template>
