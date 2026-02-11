<script setup lang="ts">
import { z } from 'zod'
import mockClasses from '#test-mocks/business-share-classes/json/default.json'

definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ label: 'Examples', to: '/' }, { label: 'Manage Share Structure' }]
})

const { tableState } = useManageShareStructure()
tableState.value = mockClasses.shareClasses.map((c) => {
  return {
    new: {
      ...c,
      actions: [],
      id: c.id.toString(),
      series: c.series.map(s => ({
        ...s,
        id: s.id.toString(),
        actions: []
      }))
    },
    old: {
      ...c,
      actions: [],
      id: c.id.toString(),
      series: c.series.map(s => ({
        ...s,
        id: s.id.toString(),
        actions: []
      }))
    }
  }
})

// const activeClass = ref<ActiveShareClassSchema | undefined>(undefined)
// const activeSeries = ref<ActiveShareSeriesSchema | undefined>(undefined)
const loading = ref(false)

// watch(activeClass, v => console.log(v), { deep: true })

const formState = reactive<{
  activeClass: ActiveShareClassSchema | undefined
  activeSeries: ActiveShareSeriesSchema | undefined
}>({
  activeClass: undefined,
  activeSeries: undefined
})

const schema = z.object({
  activeClass: getActiveShareClassSchema(),
  activeSeries: getActiveShareSeriesSchema()
})

// const allCurrencies = Intl.supportedValuesOf('currency').map((code) => {
//   try {
//     const symbol = new Intl.NumberFormat('en-CA', {
//       style: 'currency',
//       currency: code,
//       currencyDisplay: 'narrowSymbol'
//     })
//       .formatToParts(0)
//       .find(p => p.type === 'currency').value

//     const name = new Intl.DisplayNames(['en'], { type: 'currency' }).of(code)

//     return { code, symbol, name }
//   } catch (e) {
//     return null // Handle rare unsupported codes
//   }
// }).filter(Boolean)

// console.log(allCurrencies)

// const codes = Intl.supportedValuesOf('currency')
// console.log(codes)
</script>

<template>
  <UContainer>
    <ConnectPageSection
      :heading="{ label: 'Manage Share Structure - Default' }"
      ui-body="p-10"
    >
      <!-- <UForm :state="formState" :schema> -->
      <ManageShareStructure
        v-model:active-class="formState.activeClass"
        v-model:active-series="formState.activeSeries"
        :loading="loading"
        :empty-text="loading ? `Loading...` : 'No classes'"
        add-label="Add Share Class"
        edit-label="Edit Class or series?"
      />
      <!-- </UForm> -->
    </ConnectPageSection>
  </UContainer>
</template>
