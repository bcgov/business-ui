<script setup lang="ts">
import { FetchError } from 'ofetch'
const affStore = useAffiliationsStore()
const toast = useToast()
const brdModal = useBrdModals()
const { t } = useI18n()

const props = defineProps<{
  removeBusinessPayload: RemoveBusinessPayload
  type: 'generic' | 'passcode'
}>()

const hasError = ref(false)
const errorText = ref('') // TODO: add aria alert text
const loading = ref(false)

async function removeBusiness (resetPasscodeEmail: string, resetPasscode = true) {
  try {
    loading.value = true
    const payload = props.removeBusinessPayload
    payload.passcodeResetEmail = resetPasscodeEmail
    payload.resetPasscode = resetPasscode
    await affStore.removeBusiness(payload)
    toast.add({ title: t('modal.removeBusiness.index.successToast') }) // add success toast
    brdModal.close()
  } catch (e) {
    errorText.value = (e as FetchError).data?.message || t('error.generic.description')
    hasError.value = true
  } finally {
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
  <ModalBase :title="(type === 'passcode' && !hasError) ? $t('labels.removeBusiness') : undefined">
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
          {{ $t('error.generic.title') }}
        </h2>
        <!-- <p>{{ errorText }}</p> -->
        <p>{{ $t('error.generic.description') }}</p>
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
        <!-- TODO: add aria alert -->
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
