<script setup lang="ts">
import type { Form } from '@nuxt/ui'
import { z } from 'zod'

const { t } = useI18n()
const store = useTransitionStore()
const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)

const schema = z.object({
  confirmOffices: z.boolean().refine(val => val === true, t('connect.validation.required')),
  confirmDirectors: z.boolean().refine(val => val === true, t('connect.validation.required'))
})

type TAStep1Schema = z.output<typeof schema>

const formRef = useTemplateRef<Form<TAStep1Schema>>('ta-form-step-1')

const confirmErrors = computed(() => {
  const errors = formRef.value?.getErrors()

  return {
    confirmOffices: !!errors?.find(e => e.name?.includes('confirmOffices')),
    confirmDirectors: !!errors?.find(e => e.name?.includes('confirmDirectors'))
  }
})
</script>

<template>
  <UForm
    ref="ta-form-step-1"
    :state="store.formState"
    :schema
    novalidate
    class="py-6 space-y-6 sm:py-10 sm:space-y-10"
    @error="onFormSubmitError"
  >
    <section class="space-y-4" data-testid="office-addresses-section">
      <div>
        <h2 class="text-base">
          1. {{ $t('label.officeAddresses') }}
        </h2>
        <p>{{ $t('text.officeAddressesMustBeCorrect') }}</p>
      </div>

      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :add-label="$t('label.addOffice')"
        :edit-label="$t('label.editOffice')"
        :allowed-actions="[]"
      />

      <ConnectFormFieldWrapper
        orientation="horizontal"
        label="Confirm"
        class="bg-white p-6 rounded"
        :class="{ 'border-l-3 border-error': confirmErrors.confirmOffices }"
      >
        <UFormField name="confirmOffices" :ui="{ error: 'sr-only' }">
          <template #default="{ error }">
            <UCheckbox
              v-model="store.formState.confirmOffices"
              label="I confirm that the office address information listed for this business is correct."
              :ui="{
                label: error ? 'text-base text-error' : 'text-base'
              }"
            />
          </template>
        </UFormField>
      </ConnectFormFieldWrapper>
    </section>

    <section class="space-y-4" data-testid="current-directors-section">
      <div>
        <h2 class="text-base">
          2. {{ $t('label.currentDirectors') }}
        </h2>
        <p>{{ $t('text.currentDirectorsMustBeCorrect') }}</p>
      </div>

      <ManageParties
        v-model:active-party="store.formState.activeDirector"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :add-label="$t('label.addDirector')"
        :edit-label="$t('label.editDirector')"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
        form-party-details-name="activeDirector"
      />

      <ConnectFormFieldWrapper
        orientation="horizontal"
        label="Confirm"
        class="bg-white p-6 rounded"
        :class="{ 'border-l-3 border-error': confirmErrors.confirmDirectors }"
      >
        <UFormField name="confirmDirectors" :ui="{ error: 'sr-only' }">
          <template #default="{ error }">
            <UCheckbox
              v-model="store.formState.confirmDirectors"
              label="I confirm that the director information listed for this business is correct."
              :ui="{
                label: error ? 'text-base text-error' : 'text-base'
              }"
            />
          </template>
        </UFormField>
      </ConnectFormFieldWrapper>
    </section>

    <section data-testid="share-structure-section">
      <h2 class="text-base">
        3. {{ $t('label.shareStructure') }}
      </h2>

      <ManageShareStructure
        v-model:active-class="store.formState.activeClass"
        v-model:active-series="store.formState.activeSeries"
        :loading="store.initializing"
        :empty-text="store.initializing
          ? `${$t('label.loading')}...`
          : $t('label.noShareClasses')
        "
        :add-label="$t('label.addShareClass')"
      />
    </section>
  </UForm>
</template>
