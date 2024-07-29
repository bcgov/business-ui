<script setup lang="ts">
import type { FormError } from '#ui/types'
import { UCheckbox, UForm } from '#components'
const localePath = useLocalePath()
const { t } = useI18n()
const pageLoading = useState('page-loading')
const tosStore = useTosStore()

useHead({
  title: t('page.tos.title')
})

definePageMeta({
  isTos: true
})

const checkboxRef = ref<InstanceType<typeof UCheckbox>>(null)
const formRef = ref<InstanceType<typeof UForm>>(null)
const tosDivRef = ref<HTMLDivElement | null>(null)
const showDeclineTermsModal = ref(false)

const { bottom: tosBottom } = useElementBounding(tosDivRef)
const { top: formTop } = useElementBounding(formRef)

const hasReachedBottom = computed(() => formTop.value >= tosBottom.value)

watch(hasReachedBottom, (newVal) => {
  if (newVal) {
    formRef.value?.clear()
  }
})

const state = reactive({
  agreeToTerms: undefined
})

const validate = (state: { agreeToTerms: boolean | undefined }): FormError[] => {
  const errors: FormError[] = []

  if (!state.agreeToTerms && !hasReachedBottom.value) {
    errors.push({ path: 'agreeToTerms', message: t('page.tos.form.scrollError') })
    return errors
  }

  if (!state.agreeToTerms) {
    errors.push({ path: 'agreeToTerms', message: t('page.tos.form.checkedError') })
  }

  return errors
}

onMounted(() => {
  pageLoading.value = false
})
</script>
<template>
  <ClientOnly>
    <div class="relative -mb-4 flex w-full flex-col items-center sm:max-w-screen-sm md:max-w-screen-md">
      <SbcPageSectionH1 class="sticky top-0 -my-4 w-full border-b border-bcGovGray-500 bg-bcGovColor-gray1 py-2 text-center" :heading="$t('page.tos.h1')" />
      <SbcAlert
        :show-on-category="[AlertCategory.INTERNAL_SERVER_ERROR, AlertCategory.TOS_PATCH_ERROR]"
        class="sticky top-12 mt-2"
      />

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="tosStore.tos.termsOfUse" ref="tosDivRef" class="prose prose-bcGov max-w-full break-words" v-html="tosStore.tos.termsOfUse" />
      <UForm
        ref="formRef"
        class="sticky bottom-0 flex w-full flex-col items-center justify-between gap-4 border-t border-bcGovGray-500 bg-bcGovColor-gray1 py-4 sm:flex-row sm:gap-0"
        :state
        :validate="validate"
        @submit="tosStore.submitTermsOfUse($event, () => navigateTo(localePath('/accounts/choose-existing')))"
      >
        <UFormGroup
          name="agreeToTerms"
          :class="[
            !hasReachedBottom && !state.agreeToTerms ? 'mb-2' : '',
            !hasReachedBottom && formRef?.errors.length === 0 && !state.agreeToTerms ? '-mt-8 sm:-mt-0' : ''
          ]"
        >
          <UCheckbox
            v-if="hasReachedBottom || state.agreeToTerms"
            ref="checkboxRef"
            v-model="state.agreeToTerms"
            class="mt-1 self-start sm:self-auto"
            :label="$t('page.tos.form.checkboxLabel')"
          />
          <template #error="{ error }">
            <span :class="{ 'text-red-500': error, 'text-base': !hasReachedBottom }">
              {{ error }}
            </span>
          </template>
        </UFormGroup>
        <div class="ml-auto flex w-full gap-4 sm:w-min">
          <UButton
            class="flex-1 sm:flex-none"
            :ui="{ base: 'flex justify-center items-center'}"
            :label="$t('btn.accept')"
            :loading="tosStore.loading"
            type="submit"
          />
          <UButton
            class="flex-1 sm:flex-none"
            :ui="{ base: 'flex justify-center items-center'}"
            :label="$t('btn.decline')"
            variant="outline"
            @click="showDeclineTermsModal = true"
          />
        </div>
      </UForm>
    </div>
    <SbcModal
      v-model="showDeclineTermsModal"
      :title="$t('page.tos.modal.title')"
      :content="$t('page.tos.modal.content')"
      :actions="[{ label: $t('btn.decline'), handler: () => navigateTo({ path: localePath('/'), query: { fromTos: 'true' }})}]"
    />
  </ClientOnly>
</template>
