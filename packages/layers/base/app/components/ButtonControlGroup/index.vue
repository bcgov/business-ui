<script setup lang="ts">
// renders one group of the button control, so a layout can place the groups in different spots
const { side, stateKey = 'default-button-control' } = defineProps<{
  side: 'left' | 'right'
  stateKey?: string
}>()

const { buttonControl } = useConnectButtonControl(stateKey)
const group = computed(() => side === 'left' ? buttonControl.value?.leftGroup : buttonControl.value?.rightGroup)
</script>

<template>
  <div
    v-if="group?.buttons?.length"
    :data-testid="`${side}-buttons`"
    :class="['flex gap-4', group.stacked ? 'flex-col' : 'flex-row flex-wrap items-center']"
  >
    <div :class="['flex gap-4', group.stacked ? 'flex-col' : 'flex-row flex-wrap', group.class]">
      <ConnectButtonControlButtons :buttons="group.buttons" :position="side" />
    </div>
    <p
      v-if="group.alertText"
      class="text-error"
      role="alert"
    >
      {{ group.alertText }}
    </p>
  </div>
</template>
