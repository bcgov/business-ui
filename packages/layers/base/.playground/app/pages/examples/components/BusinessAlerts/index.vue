<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth'
})

useHead({
  title: 'Business Alerts Example'
})

const localePath = useLocalePath()

setBreadcrumbs([
  {
    to: localePath('/'),
    label: 'Examples'
  },
  {
    label: 'BusinessAlerts'
  }
])

const { init: initBusiness } = useBusinessStore()
const { init: initBootstrap } = useBusinessBootstrapStore()
const { business, businessAlerts, businessIdentifier } = storeToRefs(useBusinessStore())
const { bootstrapFiling, bootstrapIdentifier } = storeToRefs(useBusinessBootstrapStore())

/** good dev examples:
 * BC0870681 (not in good standing, process of being dissolved)
 * BC0688952 (not in good standing, process of being dissolved - user delays maxed)
*/
const identifier = ref('')

const loading = ref(false)
const loadAlerts = async () => {
  loading.value = true
  business.value = undefined
  bootstrapFiling.value = undefined
  try {
    if (isTempRegIdentifier(identifier.value)) {
      await initBootstrap(identifier.value)
    } else {
      await initBusiness(identifier.value)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="py-8 space-y-6">
    <h1>
      BusinessAlerts
    </h1>

    <ConnectPageSection
      :heading="{
        label: 'Example (login and API integration setup required)'
      }"
      ui-body="p-4 space-y-4"
    >
      <div class="space-y-3">
        <ConnectInput
          id="identifier-input"
          v-model="identifier"
          label="Business Identifier"
        />
        <UButton
          :disabled="!identifier"
          label="Load Business Alerts"
          :loading
          @click.stop="loadAlerts()"
        />
      </div>
      <ConnectTransitionCollapse>
        <div v-if="!loading && (businessIdentifier || bootstrapIdentifier)" class="bg-shade p-5">
          <BusinessAlerts v-if="businessAlerts" :alert-info="businessAlerts" />
          <p v-else>
            No alerts to show for this business.
          </p>
        </div>
      </ConnectTransitionCollapse>
    </ConnectPageSection>
  </div>
</template>
