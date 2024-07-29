<script setup lang="ts">
defineProps({
  accountName: { default: 'N/A', type: String },
  username: { default: 'N/A', type: String },
  theme: { default: 'header', type: String } // header or dropdown
})
</script>
<template>
  <div class="flex items-center gap-1">
    <UAvatar
      :alt="username[0].toUpperCase()"
      size="sm"
      :ui="{
        background: 'bg-bcGovBlue-300 dark:bg-[#E0E7ED]',
        text: 'font-semibold leading-none text-white dark:text-bcGovColor-darkGray truncate',
        placeholder: 'font-semibold leading-none text-white truncate dark:text-bcGovColor-darkGray text-xl',
        rounded: 'rounded-sm'
      }"
    />
    <div class="mx-2 flex flex-col text-left font-normal tracking-wide">
      <span
        class="line-clamp-1 font-semibold"
        :class="{'text-white': theme === 'header', 'text-bcGovColor-darkGray': theme === 'dropdown'}"
      >
        {{ username.toUpperCase() }}
      </span>
      <span
        class="line-clamp-1 text-sm"
        :class="{'text-gray-300': theme === 'header', 'text-bcGovColor-midGray': theme === 'dropdown'}"
      >
        {{ accountName.toUpperCase() }}
      </span>
    </div>
  </div>
</template>
