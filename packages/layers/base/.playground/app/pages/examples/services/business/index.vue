<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [{ to: '/', label: 'Examples' }, { label: 'BusinessService' }]
})

useHead({
  title: 'Business Service Example'
})

const cache = useQueryCache()
const { keys, base } = useBusinessQueryKeys()
const query = useBusinessQuery()
const service = useBusinessService()

const businessId = ref('BC1234567')
const enabled = computed(() => businessId.value.length === 9)
const {
  data: business,
  status: bStatus,
  asyncStatus: bAsyncStatus,
  isPending: bPending,
  isLoading: bLoading,
  error: bError,
  refresh: refreshBusiness,
  refetch: refetchBusiness
} = query.business(businessId, false, { enabled })

const {
  data: addresses,
  status: aStatus,
  asyncStatus: aAsyncStatus,
  isPending: aPending,
  isLoading: aLoading,
  error: aError,
  refresh: refreshAddresses,
  refetch: refetchAddresses
} = query.addresses(businessId, { enabled })

function invalidateBCache(id: string) {
  const key = keys.business(id, false)
  console.info('Invalidating key: ', key)
  cache.invalidateQueries({ key })
}

function invalidateACache(id: string) {
  const key = keys.addresses(id)
  console.info('Invalidating key: ', key)
  cache.invalidateQueries({ key })
}

async function triggerBService() {
  try {
    await service.getBusiness(businessId.value, false, true)
  } catch (e) {
    console.error('Caught error: ', e)
  }
}

async function triggerAService() {
  try {
    await service.getAddresses(businessId.value, true)
  } catch (e) {
    console.error('Caught error: ', e)
  }
}
</script>

<template>
  <UContainer class="space-y-6">
    <h1>Business Service</h1>
    <p>Please sign in and enter a valid business ID</p>
    <div class="p-10 bg-white max-w-1/2">
      <ConnectInput
        id="id-input"
        v-model="businessId"
        label="Business ID"
      />
    </div>
    <ConnectPageSection
      :heading="{ label: 'Side-by-Side Comparison' }"
      ui-body="bg-white p-6"
      :actions="[
        {
          label: 'Invalidate all via partial match',
          onClick: () => {
            cache.invalidateQueries({ key: base })
          }
        }
      ]"
    >
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-primary italic">
              Business
            </h3>
            <UButton
              label="Refresh"
              size="xs"
              variant="ghost"
              @click="refreshBusiness()"
            />
            <UButton
              label="Refetch"
              size="xs"
              variant="ghost"
              @click="refetchBusiness()"
            />
            <UButton
              label="Invalidate"
              size="xs"
              variant="ghost"
              @click="invalidateBCache(businessId)"
            />
            <UButton
              label="Trigger Service"
              size="xs"
              variant="ghost"
              @click="triggerBService"
            />
          </div>

          <div class="flex justify-between">
            <div>
              Status: {{ bStatus }}
            </div>
            <div>
              Async Status: {{ bAsyncStatus }}
            </div>
            <div>
              Pending: {{ bPending }}
            </div>
          </div>

          <div class="bg-gray-900 text-green-400 p-4 rounded text-xs h-80 overflow-auto border-2 border-gray-800">
            <div v-if="bLoading">
              Fetching Business...
            </div>
            <pre v-else-if="business">{{ JSON.stringify(business, null, 2) }}</pre>
            <div v-else-if="bError" class="text-red-400">
              {{ bError }}
            </div>
            <div v-else class="text-gray-500">
              Waiting for valid ID...
            </div>
          </div>
        </div>

        <div class="space-y-4 lg:border-l lg:pl-8 border-gray-100">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-primary italic">
              Addresses
            </h3>
            <UButton
              label="Refresh"
              size="xs"
              variant="ghost"
              @click="refreshAddresses()"
            />
            <UButton
              label="Refetch"
              size="xs"
              variant="ghost"
              @click="refetchAddresses()"
            />
            <UButton
              label="Invalidate"
              size="xs"
              variant="ghost"
              @click="invalidateACache(businessId)"
            />
            <UButton
              label="Trigger Service"
              size="xs"
              variant="ghost"
              @click="triggerAService"
            />
          </div>

          <div class="flex justify-between">
            <div>
              Status: {{ aStatus }}
            </div>
            <div>
              Async Status: {{ aAsyncStatus }}
            </div>
            <div>
              Pending: {{ aPending }}
            </div>
          </div>

          <div class="bg-gray-900 text-green-400 p-4 rounded text-xs h-80 overflow-auto border-2 border-gray-800">
            <div v-if="aLoading">
              Fetching Addresses...
            </div>
            <pre v-else-if="addresses">{{ JSON.stringify(addresses, null, 2) }}</pre>
            <div v-else-if="aError" class="text-red-400">
              {{ aError }}
            </div>
            <div v-else class="text-gray-500">
              Waiting for valid ID...
            </div>
          </div>
        </div>
      </div>
    </ConnectPageSection>
  </UContainer>
</template>
