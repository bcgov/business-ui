<script setup lang="ts">
import { UInput } from '#components'
const showHelpText = ref(false)
const showHelpTextBtnRef = ref<InstanceType<typeof UInput> | null>(null)

const toggleHelpText = () => {
  showHelpText.value = !showHelpText.value
  if (!showHelpText.value) {
    showHelpTextBtnRef.value?.$el.focus()
    showHelpTextBtnRef.value?.$el.scrollIntoView({ block: 'center', behaviour: 'smooth' })
  }
}
</script>
<template>
  <UButton
    ref="showHelpTextBtnRef"
    :label="showHelpText ? $t('btn.busStartHelp.hide') : $t('btn.busStartHelp.show')"
    variant="link"
    icon="i-mdi-help-circle-outline"
    class="-mt-1 self-start"
    :aria-expanded="showHelpText"
    :padded="false"
    aria-controls="help-text-content"
    :ui="{ icon: { size: { sm: 'size-6' } } }"
    @click="toggleHelpText"
  />
  <div
    id="help-text-content"
    :aria-hidden="!showHelpText"
    role="region"
    class="mx-auto max-w-bcGovLg overflow-hidden border-y border-dashed border-gray-700 transition-all duration-500 ease-in-out"
    :class="{
      '-mb-3 max-h-0 opacity-0': !showHelpText,
      '-mb-0 max-h-[10000px] py-8 opacity-100': showHelpText,
    }"
  >
    <div class="prose prose-bcGov prose-h3:text-center prose-p:my-8 prose-ol:space-y-10 max-w-bcGovLg">
      <h3>{{ $t('startManageBusinessHelp.heading') }}</h3>
      <p>{{ $t('startManageBusinessHelp.intro') }}</p>
      <ol>
        <!-- Step 1 -->
        <li>
          <div class="font-semibold text-gray-900">
            {{ $t('startManageBusinessHelp.steps.businessType.heading') }}
          </div>
          <ul>
            <li>
              {{ $t('startManageBusinessHelp.steps.businessType.content1') }}
              <a
                href="https://entity-selection-prod.apps.silver.devops.gov.bc.ca/"
                target="_blank"
                class="text-blue-500 underline"
              >
                {{ $t('startManageBusinessHelp.steps.businessType.wizardLink') }}
              </a>
            </li>
            <li>{{ $t('startManageBusinessHelp.steps.businessType.content2') }}</li>
            <li>{{ $t('startManageBusinessHelp.steps.businessType.content3') }}</li>
          </ul>
        </li>

        <!-- Step 2 -->
        <li>
          <div class="font-semibold text-gray-900">
            {{ $t('startManageBusinessHelp.steps.requestName.heading') }}
          </div>

          <div class="font-semibold text-gray-700">
            {{ $t('startManageBusinessHelp.steps.requestName.namedBusiness.heading') }}
          </div>
          <ul>
            <li>
              <ConnectI18nHelper translation-path="startManageBusinessHelp.steps.requestName.namedBusiness.content1" />
            </li>
            <li>{{ $t('startManageBusinessHelp.steps.requestName.namedBusiness.content2') }}</li>
            <li>{{ $t('startManageBusinessHelp.steps.requestName.namedBusiness.content3') }}</li>
            <li>{{ $t('startManageBusinessHelp.steps.requestName.namedBusiness.content4') }}</li>
            <li>
              <ConnectI18nHelper translation-path="startManageBusinessHelp.steps.requestName.namedBusiness.content5" />
            </li>
          </ul>

          <div class="font-semibold text-gray-700">
            {{ $t('startManageBusinessHelp.steps.requestName.numberedCompany.heading') }}
          </div>
          <ul>
            <li>
              <ConnectI18nHelper translation-path="startManageBusinessHelp.steps.requestName.numberedCompany.content1" />
            </li>
          </ul>
        </li>

        <!-- Step 3 -->
        <li>
          <div class="font-semibold text-gray-900">
            {{ $t('startManageBusinessHelp.steps.incorporateRegister.heading') }}
          </div>
          <ul>
            <li>
              <ConnectI18nHelper translation-path="startManageBusinessHelp.steps.incorporateRegister.content1" />
              <ul class="ml-4 mt-2">
                <li>{{ $t('startManageBusinessHelp.steps.incorporateRegister.content2') }}</li>
                <li>{{ $t('startManageBusinessHelp.steps.incorporateRegister.content3') }}</li>
              </ul>
            </li>
            <li>{{ $t('startManageBusinessHelp.steps.incorporateRegister.content2') }}</li>
            <li>{{ $t('startManageBusinessHelp.steps.incorporateRegister.content3') }}</li>
          </ul>
        </li>

        <!-- Step 4 -->
        <li>
          <div class="font-semibold text-gray-900">
            {{ $t('startManageBusinessHelp.steps.manageMaintain.heading') }}
          </div>
          <ul>
            <li>{{ $t('startManageBusinessHelp.steps.manageMaintain.content1') }}</li>
            <li>
              <ConnectI18nHelper translation-path="startManageBusinessHelp.steps.manageMaintain.content2" />
              <ul class="ml-4 mt-2">
                <li>{{ $t('startManageBusinessHelp.steps.manageMaintain.content3') }}</li>
                <li>{{ $t('startManageBusinessHelp.steps.manageMaintain.content4') }}</li>
                <li>{{ $t('startManageBusinessHelp.steps.manageMaintain.content5') }}</li>
                <li>{{ $t('startManageBusinessHelp.steps.manageMaintain.content6') }}</li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
    </div>
    <div class="flex">
      <UButton
        :label="$t('btn.busStartHelp.hide')"
        variant="link"
        class="ml-auto"
        @click="toggleHelpText"
      />
    </div>
  </div>
</template>
