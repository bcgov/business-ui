<script setup lang="ts">
import type { MaskInputOptions } from 'maska'
import { z } from 'zod'
import type { FormError, FormSubmitEvent, Form } from '#ui/types'

const brdModal = useBrdModals()
const toast = useToast()
const { t } = useI18n()

const emit = defineEmits<{
  showHelp: [void]
  nameRequestError: [void]
}>()

const props = defineProps<{
  nrNum: string
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

type NRSchema = z.infer<typeof nrSchema>

const validate = (state: NRSchema): FormError[] => {
  alertText.value = ''

  const errors = []
  const phoneValid = z.string().regex(/^\d{3}-\d{3}-\d{4}$/).safeParse(state.phone).success
  const emailValid = z.string().email().safeParse(state.email).success
  if (!state.phone && !state.email) { // show alert if both fields are empty
    alertText.value = t('form.manageNR.fields.alert.bothEmpty')
  } else if (state.phone && !state.email) { // show phone error if phone populated but invalid
    if (!phoneValid) {
      errors.push({ path: 'phone', message: t('form.manageNR.fields.phone.error.invalid') })
    }
  } else if (!state.phone && state.email) { // show email error if email populated but invalid
    if (!emailValid) {
      errors.push({ path: 'email', message: t('form.manageNR.fields.email.error.invalid') })
    }
  } else if (state.phone && state.email) { // show alert and error text if both fields populated and both are invalid
    if (!phoneValid && !emailValid) {
      alertText.value = t('form.manageNR.fields.alert.bothInvalid')
      errors.push({ path: 'phone', message: t('form.manageNR.fields.phone.error.invalid') })
      errors.push({ path: 'email', message: t('form.manageNR.fields.email.error.invalid') })
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
      // make api request
      console.log('submitting phone: ', event.data.phone)
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // emit('nameRequestError')
          toast.add({ title: t('form.manageNR.successToast', { nrNum: props.nrNum }) })
          brdModal.manageNameRequest(false)
          resolve()
        }, 500)
      })
    } else if (emailValid) {
      // make api request
      console.log('submitting email: ', event.data.email)
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          emit('nameRequestError')
          resolve()
        }, 500)
      })
    }
  } catch (e) {
    emit('nameRequestError') // pass error?
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
      <legend class="py-4">
        {{ $t('form.manageNR.legend') }}
      </legend>

      <div class="flex flex-col gap-4">
        <UFormGroup
          name="phone"
          :help="$t('form.manageNR.fields.phone.help')"
        >
          <UInput
            v-model="state.phone"
            v-maska="phoneMask"
            :placeholder="$t('form.manageNR.fields.phone.placeholder')"
            :aria-label="$t('form.manageNR.fields.phone.arialabel')"
            variant="bcGovLg"
          />
        </UFormGroup>

        <span class="font-semibold">{{ $t('words.Or') }}</span>

        <UFormGroup
          name="email"
          :help="$t('form.manageNR.fields.email.help')"
        >
          <UInput
            v-model="state.email"
            :placeholder="$t('form.manageNR.fields.email.placeholder')"
            :aria-label="$t('form.manageNR.fields.email.arialabel')"
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
        :label="$t('btn.help')"
        variant="ghost"
        icon="i-mdi-help-circle-outline"
        @click="$emit('showHelp')"
      />

      <div class="flex gap-2">
        <UButton
          :label="$t('btn.cancel')"
          variant="outline"
          @click="brdModal.manageNameRequest(false)"
        />
        <UButton
          type="submit"
          :label="$t('form.manageNR.submitBtn')"
          :loading="formLoading"
        />
      </div>
    </div>
  </UForm>
</template>
