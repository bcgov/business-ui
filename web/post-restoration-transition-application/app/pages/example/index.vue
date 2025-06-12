<script setup lang="ts">
const isInvalid = ref(false)
</script>

<template>
  <div>
    <!--    This examples showcase import and reuse section control form the person-roles layer -->
    <FormSection
      :label="$t('label.legalName')"
      :invalid="isInvalid"
    >
      <UButton
        :label="$t('btn.done')"
        variant="outline"
        icon="i-mdi-domain"
        size="xl"
        class="w-full"
        @click="isInvalid=!isInvalid"
      />
    </FormSection>
  </div>
</template>

<style scoped>

</style>
