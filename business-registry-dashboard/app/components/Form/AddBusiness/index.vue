<script setup lang="ts">
import { FetchError } from 'ofetch'
import type { AccordionItem } from '#ui/types'
import { FormAddBusinessBase, FormAddBusinessError } from '#components' // FormAddBusinessHelp

defineProps<{
  authOptions: AccordionItem[]
  addressType: string
  contactEmail: string
  identifier: string
}>()

type Form = typeof FormAddBusinessBase
// type Help = typeof FormAddBusinessHelp
type Error = typeof FormAddBusinessError
type Comp = Form | Error
// type Comp = Form | Help | Error

const state: Record<string, Comp> = {
  FormAddBusinessBase,
  FormAddBusinessError
}

const currentState = ref('FormAddBusinessBase')
const error = ref<FetchError>()

function handleError (e: FetchError) {
  console.log('error emitted')
  error.value = e
  currentState.value = 'FormAddBusinessError'
}
</script>
<template>
  <!-- TODO: add state for when business is already added to table -->
  <transition name="fade" mode="out-in">
    <component
      :is="state[currentState]"
      :error
      :auth-options="authOptions"
      :address-type="addressType"
      :contact-email="contactEmail"
      :identifier="identifier"
      @retry="currentState = 'FormAddBusinessBase'"
      @business-error="handleError"
    />
  </transition>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
