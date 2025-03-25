<script setup lang="ts">
import { UInput } from '#components'
const showHelpText = ref(false)
const showHelpTextBtnRef = ref<InstanceType<typeof UInput> | null>(null)

const toggleHelpText = () => {
  showHelpText.value = !showHelpText.value
  if (!showHelpText.value) {
    showHelpTextBtnRef.value?.$el.focus()
    showHelpTextBtnRef.value?.$el.scrollIntoView({ block: 'left', behaviour: 'smooth' })
  }
}
</script>
<template>
  <UButton
    ref="showHelpTextBtnRef"
    :label="showHelpText ? $t('btn.busStartHelp.hide') : $t('btn.busStartHelp.show')"
    variant="link"
    icon="i-mdi-help-circle-outline"
    class="-mt-1 self-start text-sm"
    :aria-expanded="showHelpText"
    :padded="false"
    aria-controls="help-text-content"
    :ui="{ icon: { size: { sm: 'size-4' } } }"
    @click="toggleHelpText"
  />
  <div
    id="help-text-content"
    :aria-hidden="!showHelpText"
    role="region"
    class="mx-auto max-w-bcGovLg overflow-hidden text-sm transition-all duration-500 ease-in-out"
    :class="{
      '-mb-3 max-h-0 opacity-0': !showHelpText,
      '-mb-0 max-h-[10000px] py-5 opacity-100': showHelpText,
    }"
  >
    <div class="flex justify-start gap-0">
      <div class="flex-col justify-start pb-5 pl-5 text-sm text-bcGovColor-midGray ">
        {{ $t('contactInfo.bcRegModal.title') }}
      </div>
    </div>
    <div class="pl-5">
      <div>
        <ul>
          <li class="pb-1 text-bcGovColor-midGray">
            <span class="text-sm font-semibold text-bcGovColor-midGray "><UIcon name="i-mdi-phone" class="mr-2 size-5 text-bcGovColor-activeBlue" />{{ $t('contactInfo.bcRegModal.tollFree.title') }}</span>
            <a class="pl-1 text-sm text-blue-500 underline" :href="`tel:${$t('contactInfo.bcRegGeneral.tollFree.value')}`">{{ $t('contactInfo.bcRegGeneral.tollFree.value') }}</a>
          </li>
          <li class="pb-1 text-bcGovColor-midGray">
            <span class="text-sm font-semibold text-bcGovColor-midGray"><UIcon name="i-mdi-phone" class="mr-2 size-5 text-bcGovColor-activeBlue" />{{ $t('contactInfo.bcRegGeneral.victoriaOffice.title') }}</span>
            <a class="pl-1 text-sm text-blue-500 underline" :href="`tel:${$t('contactInfo.bcRegGeneral.victoriaOffice.value')}`">{{ $t('contactInfo.bcRegGeneral.victoriaOffice.value') }}</a>
          </li>
          <li class="pb-1 text-bcGovColor-midGray">
            <span class="text-sm font-semibold text-bcGovColor-midGray"><UIcon name="i-mdi-email" class="mr-2 size-5 text-bcGovColor-activeBlue" />{{ $t('contactInfo.bcRegGeneral.email.title') }}</span>
            <a class="pl-1 text-sm text-blue-500 underline" href="mailto:BCRegistries@gov.bc.ca?subject=BC Registries and Online Services - Support Request">BCRegistries@gov.bc.ca</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
