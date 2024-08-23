<script setup lang="ts">
import { FormAddNameRequestBase, FormAddNameRequestHelp, FormAddNameRequestError } from '#components'

defineProps<{
  nrNum: string
}>()

type Form = typeof FormAddNameRequestBase
type Help = typeof FormAddNameRequestHelp
type Error = typeof FormAddNameRequestError
type Comp = Form | Help | Error

const state: Record<string, Comp> = {
  FormAddNameRequestBase,
  FormAddNameRequestHelp,
  FormAddNameRequestError
}

const currentState = ref('FormAddNameRequestBase')
</script>
<template>
  <!-- TODO: add state for when name is already added to table -->
  <transition name="fade" mode="out-in">
    <component
      :is="state[currentState]"
      :nr-num="nrNum"
      @show-help="currentState = 'FormAddNameRequestHelp'"
      @hide-help="currentState = 'FormAddNameRequestBase'"
      @retry-name-request="currentState = 'FormAddNameRequestBase'"
      @name-request-error="currentState = 'FormAddNameRequestError'"
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
