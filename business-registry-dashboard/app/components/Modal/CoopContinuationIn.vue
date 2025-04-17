<template>
  <ModalBase :title="$t('modal.continuationInCoop.title')">
    <div>
      <p class="-mt-8 pb-4 text-bcGovColor-midGray">
        {{ $t('modal.continuationInCoop.description') }}
      </p>

      <div class="flex items-center gap-2">
        <UIcon name="i-mdi-phone" class="size-4 text-bcGovColor-nonClickable" />
        <span class="text-bcGovColor-midGray">{{ $t('contactInfo.bcRegStaff.tollFree.title') }}</span>
        <a :href="`tel:${$t('contactInfo.bcRegStaff.tollFree.value')}`" class="text-blue-500 underline">
          {{ $t('contactInfo.bcRegStaff.tollFree.value') }}
        </a>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-mdi-phone" class="size-4 text-bcGovColor-nonClickable" />
        <span class="text-bcGovColor-midGray">{{ $t('contactInfo.bcRegStaff.victoriaOffice.title') }}</span>
        <a :href="`tel:${$t('contactInfo.bcRegStaff.victoriaOffice.value')}`" class="text-blue-500 underline">
          {{ $t('contactInfo.bcRegStaff.victoriaOffice.value') }}
        </a>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-mdi-email" class="size-4 text-bcGovColor-nonClickable" />
        <span class="text-bcGovColor-midGray">{{ $t('contactInfo.bcRegGeneral.email.title') }}</span>
        <a href="mailto:BCRegistries@gov.bc.ca" class="text-blue-500 underline">BCRegistries@gov.bc.ca</a>
      </div>

      <div class="mt-8 flex justify-center">
        <UButton color="primary" class="px-7 py-3" @click="closeModal">
          {{ $t('btn.close') }}
        </UButton>
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
const brdModal = useBrdModals()

function closeModal () {
  brdModal.close()
}
</script>
