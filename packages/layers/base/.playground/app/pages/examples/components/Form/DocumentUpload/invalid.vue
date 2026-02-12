<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth'
})
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      :heading="{ label: 'Document Upload (Invalid)' }"
      class="max-w-3xl"
    >
      <FormDocumentUpload
        ref="document-upload-ref"
        name="documentUpload"
        :validate="true"
      />
    </ConnectPageSection>
  </div>
</template>
