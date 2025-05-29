<script setup lang="ts">
import { FetchError } from 'ofetch'
import type { AccordionItem } from '#ui/types'
import { FormAddBusinessBase, FormAddBusinessError, FormAddBusinessEmailAuthSent } from '#components'

defineProps<{
  authOptions: AccordionItem[]
  contactEmail: string
  identifier: string
  accounts: Array<{ branchName?: string, name: string, uuid: string }>
  businessDetails: {
    isFirm: boolean
    isCorporation: boolean
    isBenefit: boolean
    isCoop: boolean
  }
  isCorpOrBenOrCoop: boolean
}>()

type Form = typeof FormAddBusinessBase
type Success = typeof FormAddBusinessEmailAuthSent
type Error = typeof FormAddBusinessError
type Comp = Form | Error | Success

const state: Record<string, Comp> = {
  FormAddBusinessBase,
  FormAddBusinessError,
  FormAddBusinessEmailAuthSent
}

const currentState = ref('FormAddBusinessBase')
const errorObj = ref<{ error: FetchError, type: string }>()
const successObj = ref<{ type: string, value: string }>()

function handleError (e: { error: FetchError, type: string }) {
  errorObj.value = e
  currentState.value = 'FormAddBusinessError'
}

defineExpose({
  currentState
})
</script>
<template>
  <!-- TODO: add state for when business is already added to table -->
  <transition name="fade" mode="out-in">
    <component
      :is="state[currentState]"
      :error-obj="errorObj"
      :success-obj="successObj"
      :auth-options="authOptions"
      :contact-email="contactEmail"
      :identifier
      :accounts
      :business-details="businessDetails"
      :is-corp-or-ben-or-coop="isCorpOrBenOrCoop"
      @retry="currentState = 'FormAddBusinessBase'"
      @business-error="handleError"
      @email-success="currentState = 'FormAddBusinessEmailAuthSent'"
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
