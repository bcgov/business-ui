<script setup lang="ts">
import { FetchError } from 'ofetch'
const affStore = useAffiliationsStore()
const toast = useToast()
const brdModal = useBrdModals()

const props = defineProps<{
  removeBusinessPayload: RemoveBusinessPayload
  type: 'generic' | 'passcode'
}>()

const hasError = ref(false)
const errorText = ref('')
const loading = ref(false)

async function removeBusiness (resetPasscodeEmail: string, resetPasscode = true) {
  try {
    loading.value = true
    console.log('removing business')
    const payload = props.removeBusinessPayload
    payload.passcodeResetEmail = resetPasscodeEmail
    payload.resetPasscode = resetPasscode

    await new Promise(resolve => setTimeout(resolve, 1500)) // use this to show loading for demo
    // throw new Error('test error') // use this to show error state for demo

    // await affStore.removeBusiness(payload) // comment this out for demo
    toast.add({ title: 'Business successfully removed from your list.' }) // add success toast
    brdModal.close()
  } catch (e) {
    errorText.value = (e as FetchError).data?.message || 'An error occurred, please try again. If this error persists, please contact us.'
    hasError.value = true
    console.log('error removing business')
    // show error state in same modal
  } finally {
    console.log('finally')
    if (!hasError.value) {
      await affStore.loadAffiliations().catch(e => console.error('Could not refresh affiliations at this time. ', (e as FetchError).response))
    }
    loading.value = false
  }
}

function tryAgain () {
  hasError.value = false
  errorText.value = ''
}
</script>
<template>
  <ModalBase :title="type === 'passcode' ? 'Remove Business' : undefined">
    <transition name="fade" mode="out-in">
      <ModalRemoveBusinessGeneric
        v-if="type === 'generic' && !hasError"
        class="md:w-[700px]"
        :loading
        :remove-business-payload="removeBusinessPayload"
        @confirm="removeBusiness('', false)"
        @close="brdModal.close()"
      />
      <ModalRemoveBusinessPasscode
        v-else-if="type === 'passcode' && !hasError"
        class="md:w-[700px]"
        :loading
        :remove-business-payload="removeBusinessPayload"
        @confirm="removeBusiness"
        @close="brdModal.close()"
      />
      <div v-else-if="hasError" class="flex flex-col items-center gap-4 text-center md:w-[700px]">
        <UIcon name="i-mdi-alert-circle-outline" class="-mt-10 size-8 text-red-500" />
        <h2 class="text-xl font-semibold">
          Something Went Wrong
        </h2>
        <p>An error occurred, please try again. If this error persists, please contact us.</p>
        <BCRegContactInfo class="self-start text-left" />
        <div class="mt-4 flex gap-2">
          <UButton
            :label="$t('btn.cancel')"
            variant="outline"
            @click="brdModal.close()"
          />
          <UButton
            :label="$t('btn.tryAgain')"
            @click="tryAgain"
          />
        </div>
        <!-- <div class="sr-only" role="status">
      {{ ariaAlertText }}
    </div> -->
      </div>
    </transition>
  </ModalBase>
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
