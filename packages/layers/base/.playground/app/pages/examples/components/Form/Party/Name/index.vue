<script setup lang="ts">
import type { FormSubmitEvent, FormError } from '@nuxt/ui'
import { z } from 'zod'

definePageMeta({
  layout: 'connect-auth'
})

type FullSchema = PartyNameSchema & FolioSchema

const state = reactive<FullSchema>({
  partyType: PartyType.PERSON,
  businessName: '',
  firstName: '',
  middleName: '',
  lastName: '',
  folioNumber: ''
})

const nameRef = useTemplateRef<FormPartyNameRef>('name-ref')
const folioRef = useTemplateRef<FormFolioRef>('folio-ref')

const nameErrors = computed<FormError<string>[]>(() => nameRef.value?.formRef?.getErrors() || [])
const folioErrors = computed<FormError<string>[]>(() => folioRef.value?.formRef?.getErrors() || [])
const hasErrors = computed<boolean | undefined>(() => !!nameErrors.value.length || !!folioErrors.value.length)

// loses typing here
// only accepts FormSubmitEvent<Schema> (not FullSchema)
// cast type to get type completion if necessary
async function onSubmit(event: FormSubmitEvent<unknown>) {
  const data = event.data as FullSchema
  console.info('Form data: ', data)
}
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Party Name Form (default/nested)' }"
      :ui-body="hasErrors ? 'p-10 border-l-2 border-error' : 'p-10'"
      class="max-w-3xl"
    >
      <UForm
        ref="form-ref"
        :state="state"
        :schema="z.any()"
        novalidate
        class="gap-6 flex flex-col"
        @submit="onSubmit"
        @error="onFormSubmitError"
      >
        <FormPartyName ref="name-ref" v-model="state" />
        <div class="bg-shade p-6">
          <FormFolio ref="folio-ref" v-model="state" />
        </div>
        <div class="flex gap-6 justify-end">
          <UButton type="submit" :label="$t('label.done')" />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            @click="() => {
              nameRef?.formRef?.clear()
              folioRef?.formRef?.clear()
            }"
          />
        </div>
      </UForm>
    </ConnectPageSection>
  </div>
</template>
