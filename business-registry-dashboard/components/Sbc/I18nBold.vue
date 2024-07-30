<script setup lang="ts">
const props = defineProps({
  translationPath: { type: String, required: true }
})

const attrs = useAttrs()
const { t } = useI18n()

const translationProps = {
  ...attrs,
  boldStart: '<strong>',
  boldEnd: '</strong>'
}

const textToDisplay = t(props.translationPath, translationProps)
</script>
<template>
  <!-- eslint-disable-next-line -->
  <span v-html="textToDisplay" />
</template>
