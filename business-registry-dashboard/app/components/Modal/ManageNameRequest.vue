<script setup lang="ts">
defineProps<{
  nameRequest: {
    names: string[]
    nrNum: string
  }
}>()
</script>
<template>
  <ModalBase
    title="Manage a Name Request"
  >
    <!-- nr info section -->
    <div class="-mt-4 flex flex-col gap-2">
      <!-- nr names display -->
      <div class="flex gap-8">
        <span class="font-semibold">Requested Name(s):</span>
        <ul>
          <li v-for="name in nameRequest.names" :key="name">
            {{ name }}
          </li>
        </ul>
      </div>
      <!-- nr number display -->
      <div class="flex gap-8">
        <span class="font-semibold">Name Request Number:</span>
        <span>{{ nameRequest.nrNum }}</span>
      </div>
    </div>
    <FormAddNameRequest />
  </ModalBase>
</template>
