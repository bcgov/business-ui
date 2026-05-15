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
    confirmOffices: errors?.find(e => e.name?.includes('confirmOffices')),
    confirmDirectors: errors?.find(e => e.name?.includes('confirmDirectors'))
  }
})

defineExpose({
  formRef
})
</script>

<template>
  <UForm
    ref="ta-form-step-1"
    :state="store.formState"
    :schema
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onFormSubmitError"
  >
    <div class="space-y-4" data-testid="office-addresses-section">
      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        subject=""
        :section-title="`1. ${$t('label.officeAddresses')}`"
        :section-description="$t('text.officeAddressesMustBeCorrect')"
        :table-title="$t('label.offices')"
        :allowed-actions="[]"
      />

      <ConnectFormFieldWrapper
        orientation="horizontal"
        :label="$t('label.confirm')"
        class="bg-white p-6 rounded"
        :error="confirmErrors.confirmOffices"
      >
        <UFormField name="confirmOffices" :ui="{ error: 'sr-only' }">
          <UCheckbox
            v-model="store.formState.confirmOffices"
            :label="$t('text.confirmOfficesCorrect')"
          />
        </UFormField>
      </ConnectFormFieldWrapper>
    </div>

    <div class="space-y-4" data-testid="current-directors-section">
      <ManageParties
        v-model:active-party="store.formState.activeDirector"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :section-title="`2. ${$t('label.currentDirectors')}`"
        :section-description="$t('text.currentDirectorsMustBeCorrect')"
        :table-title="$t('label.directors')"
        :subject="$t('label.director')"
        :columns-to-display="['name', 'mailing', 'delivery', 'effectiveDates', 'actions']"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        model-name="activeDirector"
        :label-overrides="{ editLabel: $t('label.changeAddress') }"
        :party-form-props="{ hideRemove: true }"
      />

      <ConnectFormFieldWrapper
        orientation="horizontal"
        :label="$t('label.confirm')"
        class="bg-white p-6 rounded"
        :error="confirmErrors.confirmDirectors"
      >
        <UFormField name="confirmDirectors" :ui="{ error: 'sr-only' }">
          <UCheckbox
            v-model="store.formState.confirmDirectors"
            :label="$t('text.confirmDirectorsCorrect')"
          />
        </UFormField>
      </ConnectFormFieldWrapper>
    </div>

    <ManageShareStructure
      v-model:active-class="store.formState.activeClass"
      v-model:active-series="store.formState.activeSeries"
      data-testid="share-structure-section"
      :loading="store.initializing"
      :empty-text="store.initializing
        ? `${$t('label.loading')}...`
        : $t('label.noSubjectAddedYet', { subject: $t('label.shareClasses') })
      "
      :section-title="`3. ${$t('label.shareStructure')}`"
      :section-description="$t('text.shareStructureMustMatchCompanysCurrentState')"
    />
  </UForm>
</template>
