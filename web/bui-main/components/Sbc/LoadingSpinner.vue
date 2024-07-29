<script setup lang="ts">
defineProps({
  overlay: {
    type: Boolean,
    default: false
  }
})
</script>
<template>
  <!-- eslint-disable tailwindcss/no-custom-classname -->
  <Teleport v-if="overlay" to="body">
    <div class="absolute left-0 top-0 z-[999] h-screen w-screen bg-gray-100 opacity-50" />
  </Teleport>
  <svg class="spinner" viewBox="0 0 50 50">
    <circle
      class="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke-width="5"
    />
  </svg>
</template>
<style scoped>
  .spinner {
    position: absolute;
    animation: rotate 1.5s linear infinite;
    z-index: 1000;
    top: 50%;
    left: 50%;
    margin: -37.5px 0 0 -37.5px;
    width: 75px;
    height: 75px;
    transform-origin: 50% 50%;
  }

  .spinner .path {
    stroke: #1669bb;
    stroke-linecap: round;
    animation: dash 1.25s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
</style>
