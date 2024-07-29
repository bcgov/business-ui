<script setup lang="ts">
interface Item {
  label: string
  value: string | null
}

const props = defineProps<{
  items: Item[]
  breakValue: 'sm' | 'md' | 'lg'
}>()

const filteredItems = computed(() => {
  return props.items.filter(item => item.value !== null)
})

const breakpoint: Record<string, { [key: string]: string }> = {
  table: {
    sm: 'sm:block',
    md: 'md:block',
    lg: 'lg:block'
  },
  flex: {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden'
  }
}
</script>
<template>
  <div class="text-left">
    <!-- Desktop/Tablet View -->
    <table
      class="hidden w-fit table-auto"
      :class="breakpoint.table[breakValue]"
    >
      <tbody v-for="item in filteredItems" :key="item.label">
        <tr>
          <td class="whitespace-nowrap align-top font-semibold text-bcGovColor-darkGray">
            {{ item.label }}
          </td>
          <td class="text-wrap break-words pl-4 align-top text-bcGovColor-midGray">
            {{ item.value }}
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Mobile View -->
    <div
      v-for="item in filteredItems"
      :key="item.label"
      class="flex flex-col"
      :class="breakpoint.flex[breakValue]"
    >
      <span class="font-semibold text-bcGovColor-darkGray">
        {{ item.label }}
      </span>
      <span class="mb-4 text-bcGovColor-midGray last:mb-0">
        {{ item.value }}
      </span>
    </div>
  </div>
</template>
