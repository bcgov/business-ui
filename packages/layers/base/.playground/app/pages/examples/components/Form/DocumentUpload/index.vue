<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth'
})

const { formatBytes } = useDocumentHandler()

type Schema = { documents: Array<File> }
const state = reactive<Schema>({
  documents: []
})
</script>

<template>
  <div class="py-10 flex flex-col gap-10 items-center">
    <ConnectPageSection
      v-if="state.documents.length > 0"
      :heading="{ label: 'Documents Summary' }"
      class="max-w-3xl"
    >
      <!-- Documents Summary Section: PLAYGROUND ONLY -->
      <div class="mt-8 space-y-4">
        <div class="flex items-center px-4">
          <UBadge color="blue" variant="soft">
            {{ state.documents.length }} file{{ state.documents.length !== 1 ? 's' : '' }}
          </UBadge>
        </div>

        <!-- Summary Stats -->
        <div class="mt-6 grid grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-xs font-medium text-neutral mb-1">
              Total Files
            </div>
            <div class="text-2xl font-bold text-primary">
              {{ state.documents.length }}
            </div>
          </div>
          <div class="bg-green-50 rounded-lg p-4">
            <div class="text-xs font-medium text-neutral mb-1">
              Total Size
            </div>
            <div class="text-2xl font-bold text-success">
              {{ formatBytes(state.documents.reduce((sum, f) => sum + f.size, 0)) }}
            </div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-xs font-medium text-neutral mb-1">
              All PDFs
            </div>
            <div class="text-2xl font-bold">
              {{ state.documents.every(f => f.type === 'application/pdf') ? '✓' : '!' }}
            </div>
          </div>
        </div>
      </div>
    </ConnectPageSection>

    <ConnectPageSection
      :heading="{ label: 'Document Upload (default)' }"
      class="max-w-3xl"
    >
      <FormDocumentUpload
        ref="document-upload-ref"
        name="documentUpload"
        @converted-files="state.documents = $event"
      />
    </ConnectPageSection>
  </div>
</template>
