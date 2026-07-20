<script setup lang="ts">
const props = defineProps<{
  label: string
  closeLabel?: string
  tKey?: string
  tProps?: object
}>()

const { tm } = useI18n()

const open = ref(false)
const parsedT = computed(() => props.tKey ? tm(props.tKey) : undefined)
const isArray = computed(() => Array.isArray(parsedT.value))
</script>

<template>
  <UCollapsible v-model:open="open" class="flex flex-col gap-2">
    <UButton
      variant="link"
      leading-icon="i-mdi-help-circle-outline"
      class="p-0 text-left whitespace-normal w-fit"
    >
      {{ open ? (closeLabel ?? $t('label.hideHelp')) : label }}
    </UButton>

    <template #content>
      <div class="border-y border-dotted py-4 flex flex-col gap-4">
        <slot>
          <template v-if="isArray">
            <ConnectI18nHelper
              v-for="(_, index) in parsedT"
              :key="index"
              :translation-path="`${tKey}.${index}`"
              as="p"
              v-bind="tProps"
            />
          </template>

          <ConnectI18nHelper
            v-else-if="tKey"
            :translation-path="tKey"
            as="p"
            v-bind="tProps"
          />
        </slot>

        <UButton
          :label="$t('label.hideHelp')"
          variant="link"
          class="w-min underline p-0 ml-auto"
          @click="open = false"
        />
      </div>
    </template>
  </UCollapsible>
</template>
