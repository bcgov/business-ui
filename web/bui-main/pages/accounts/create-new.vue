<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import { z } from 'zod'
import { handleFormErrorEvent } from '~/utils/form/handleFormErrorEvent'
import { UForm } from '#components'
const localePath = useLocalePath()
const { t } = useI18n()
const accountStore = useAccountStore()
const accountFormRef = ref<InstanceType<typeof UForm> | null>(null)
const keycloak = useKeycloak()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.createAccount.title')
})

definePageMeta({
  middleware: ['filing-paid', 'filing-in-progress']
})

const accountDetails = reactive<NewAccount>({
  accountName: undefined,
  contact: {
    phone: undefined,
    phoneExt: undefined,
    email: undefined
  }
})

const accountSchema = z.object({
  accountName: z.string({ required_error: t('page.createAccount.form.accountNameSection.error.req') }).min(2, t('page.createAccount.form.accountNameSection.error.min')),
  contact: z.object({
    phone: z.string({ required_error: t('page.createAccount.form.contactDetailsSection.error.phone.req') }).min(10, t('page.createAccount.form.contactDetailsSection.error.phone.invalid')).regex(/^[0-9()/ -]+$/, t('page.createAccount.form.contactDetailsSection.error.phone.invalid')),
    phoneExt: z.string().optional(),
    email: z.string({ required_error: t('page.createAccount.form.contactDetailsSection.error.email.req') }).email({ message: t('page.createAccount.form.contactDetailsSection.error.email.invalid') })
  })
})

type FormSchema = z.output<typeof accountSchema>

async function submitCreateAccountForm (event: FormSubmitEvent<FormSchema>) {
  await accountStore.createNewAccount(event.data, () => navigateTo(localePath('/annual-report')))
}

// custom validate account name on blur, using debounced on input is giving me issues currently
const validate = async (state: any): Promise<FormError[]> => {
  const errors = []
  try {
    if (!state.accountName) { return [] }
    const accountAvailable = await accountStore.isAccountNameAvailable(state.accountName)
    if (!accountAvailable) {
      errors.push({ path: 'accountName', message: t('page.createAccount.form.accountNameSection.error.unique') })
    }
  } catch {
    // fail silently
  }
  return errors
}

// try to prefill account name on page load
if (import.meta.client) {
  try {
    const name = parseSpecialChars(keycloak.kcUser.value.fullName, '') // parse name if special chars
    accountDetails.accountName = await accountStore.findAvailableAccountName(name) // find account name using users name
  } catch (e) {
    console.error(`Could not prefill account name: ${e}`)
  } finally {
    pageLoading.value = false
  }
}
</script>
<template>
  <ClientOnly>
    <div class="mx-auto flex w-full max-w-[1360px] flex-col items-center gap-8 text-left">
      <SbcPageSectionH1
        class="self-start"
        :heading="$t('page.createAccount.h1')"
      />

      <SbcAlert
        :show-on-category="[
          AlertCategory.CREATE_ACCOUNT,
          AlertCategory.INTERNAL_SERVER_ERROR
        ]"
      />

      <SbcPageSectionCard
        :heading="$t('page.createAccount.h2')"
      >
        <!-- display current users name -->
        <div class="flex flex-col gap-y-4 md:grid md:grid-cols-6">
          <span class="col-span-1 col-start-1 font-semibold text-bcGovColor-darkGray">{{ $t('page.createAccount.form.infoSection.fieldSet') }}</span>
          <div class="col-span-full col-start-2 flex flex-col gap-2 text-bcGovColor-midGray">
            <span> {{ parseSpecialChars(keycloak.kcUser.value.fullName, 'USER') }} </span>
            <span> {{ $t('page.createAccount.form.infoSection.info') }} </span>
          </div>
        </div>

        <UDivider class="my-8" />

        <UForm
          ref="accountFormRef"
          :state="accountDetails"
          :schema="accountSchema"
          :validate="validate"
          class="flex flex-col gap-y-4 md:grid md:grid-cols-6 md:gap-y-8"
          @error="handleFormErrorEvent"
          @submit="submitCreateAccountForm"
        >
          <!-- account name -->
          <span aria-hidden="true" class="col-span-1 col-start-1 row-span-1 row-start-1 font-semibold text-bcGovColor-darkGray">{{ $t('page.createAccount.form.accountNameSection.fieldSet') }}</span>
          <UFormGroup name="accountName" class="col-span-full col-start-2 row-span-1 row-start-1">
            <UInput
              v-model="accountDetails.accountName"
              :variant="handleFormInputVariant('accountName', accountFormRef?.errors)"
              :aria-label="$t('page.createAccount.form.accountNameSection.accountNameInputLabel')"
              :placeholder="$t('page.createAccount.form.accountNameSection.accountNameInputLabel')"
              class="placeholder:text-bcGovColor-midGray"
            />
          </UFormGroup>

          <!-- contact details -->
          <span aria-hidden="true" class="col-span-1 col-start-1 row-span-1 row-start-3 mt-4 font-semibold text-bcGovColor-darkGray md:mt-0">{{ $t('page.createAccount.form.contactDetailsSection.fieldSet') }}</span>
          <div class="col-span-full col-start-2 row-span-1 row-start-3">
            <div class="flex flex-col justify-between gap-4 md:flex-row">
              <!-- phone number -->
              <UFormGroup name="contact.phone" class="md:flex-1">
                <UInput
                  v-model="accountDetails.contact.phone"
                  :variant="handleFormInputVariant('contact.phone', accountFormRef?.errors)"
                  :placeholder="$t('page.createAccount.form.contactDetailsSection.phoneInputLabel')"
                  :aria-label="$t('page.createAccount.form.contactDetailsSection.phoneInputLabel')"
                />
              </UFormGroup>
              <!-- phone number extension -->
              <UFormGroup name="contact.phoneExt" class="md:flex-1">
                <UInput
                  v-model="accountDetails.contact.phoneExt"
                  :variant="handleFormInputVariant('contact.phoneExt', accountFormRef?.errors)"
                  :placeholder="$t('page.createAccount.form.contactDetailsSection.phoneExtInputLabel.main')"
                  :aria-label="$t('page.createAccount.form.contactDetailsSection.phoneExtInputLabel.aria')"
                />
              </UFormGroup>
            </div>
          </div>
          <!-- email address -->
          <UFormGroup name="contact.email" class="col-span-full col-start-2 row-span-1 row-start-4">
            <UInput
              v-model="accountDetails.contact.email"
              :variant="handleFormInputVariant('contact.email', accountFormRef?.errors)"
              :placeholder="$t('page.createAccount.form.contactDetailsSection.emailInputLabel')"
              :aria-label="$t('page.createAccount.form.contactDetailsSection.emailInputLabel')"
            />
          </UFormGroup>

          <!-- submit button -->
          <div class="col-span-full col-start-1 row-span-1 row-start-6">
            <div class="flex">
              <UButton
                class="ml-auto"
                :label="$t('btn.saveAccountAndFileAr')"
                type="submit"
                :loading="accountStore.loading"
              />
            </div>
          </div>
        </UForm>
      </SbcPageSectionCard>
    </div>
  </ClientOnly>
</template>
