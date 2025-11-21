<script setup lang="ts">
import { z } from 'zod'
// import type { Form, FormError } from '@nuxt/ui'

defineProps<{
  name?: string
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

type ReceiverDetails = Pick<PartyStateBase, 'name' | 'address'>

const schema = z.object({
  name: getPartyNameSchema(),
  address: getAddressSchema()
})

const model = defineModel<ReceiverDetails>({ required: true })

// const formRef = useTemplateRef<Form<ReceiverDetails>>('receiver-details-form')
const partyNameFormRef = useTemplateRef<FormPartyNameRef>('party-name-form')
const addressFormRef = useTemplateRef<AddressFormRef>('address-form')

async function onDone() {
  // need to validate child refs to get input IDs
  const result = await Promise.allSettled([
    partyNameFormRef.value?.formRef?.validate(),
    addressFormRef.value?.formRef?.validate()
  ])

  const rejections = result.filter(r => r.status === 'rejected')

  if (rejections.length > 0) {
    const errors = rejections.flatMap(r => r.reason.errors)
    const firstId = errors[0]?.id
    if (firstId) {
      const element = document.getElementById(firstId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          element.focus({ preventScroll: true })
        }, 0)
      }
    }
  } else {
    emit('done')
  }
}
</script>

<template>
  <UForm
    ref="receiver-details-form"
    :schema
    :name
    nested
    :state="model"
    class="p-6 bg-white rounded shadow"
    @keydown.enter.prevent.stop="onDone"
  >
    <ConnectFieldset label="Add Receiver" orientation="horizontal">
      <div class="space-y-4">
        <FormPartyName
          ref="party-name-form"
          v-model="model.name"
          :state="model.name"
          name="name"
        />
        <FormAddress
          ref="address-form"
          v-model="model.address"
          :state="model.address"
          nested
          name="address"
        />
        <div class="flex gap-6 justify-end">
          <UButton
            :label="$t('label.done')"
            @click="onDone"
          />
          <UButton
            variant="outline"
            :label="$t('label.cancel')"
            @click="$emit('cancel')"
          />
        </div>
      </div>
    </ConnectFieldset>
  </UForm>
</template>
