<script setup lang="ts">
// https://vue-i18n.intlify.dev/api/composition.html#te-key-locale
const { t, te } = useI18n()
const isSmallScreen = useMediaQuery('(max-width: 640px)')

const props = defineProps<{
  status?: number
  i18nPrefix: string
}>()
defineEmits<{ close: [] }>()

const titleKey = `${props.i18nPrefix}.${props.status}.title`
const descKey = `${props.i18nPrefix}.${props.status}.description`

const title = te(titleKey) ? t(titleKey) : t(`${props.i18nPrefix}.undefined.title`)
const description = te(descKey) ? t(descKey) : t(`${props.i18nPrefix}.undefined.description`)
</script>

<template>
  <UModal
    id="officer-submit-error-modal"
    overlay
    :title
    :description
  >
    <template #content>
      <div class="p-10 flex flex-col items-center text-center gap-6">
        <UIcon
          class="text-red-600 shrink-0 size-10"
          name="i-mdi-alert-circle-outline"
        />
        <div
          role="alert"
          class="flex flex-col gap-6"
        >
          <h2 class="text-2xl font-semibold text-bcGovColor-darkGray">
            {{ title }}
          </h2>
          <p>{{ description }}</p>
        </div>
        <div class="flex flex-col gap-4 text-left self-start">
          <p>{{ $t('text.ifIssuePersistsContactUs') }}</p>
          <ConnectContactInfoBcros />
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <UButton
            :label="$t('btn.close')"
            :block="isSmallScreen"
            size="xl"
            @click="$emit('close')"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
