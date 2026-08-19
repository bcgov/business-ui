<script setup lang="ts">
import { CorpTypeCd, GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

definePageMeta({ order: 0 })

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig().public
const accountStore = useConnectAccountStore()
const webUrl = getWebUrl()
const { $businessApi } = useNuxtApp()

const identifier = computed(() => route.params.identifier as string)

const business = ref<LearBusiness | null>(null)
const { accounts, loading, error, load } = useAuthorizedAccounts(identifier)

const businessName = computed(() => business.value?.legalName || identifier.value)
const businessType = computed(() =>
  business.value?.legalType
    ? GetCorpFullDescription(business.value.legalType as CorpTypeCd)
    : ''
)

useHead({
  title: t('page.viewAccess.title')
})

watchEffect(() => {
  setBreadcrumbs([
    {
      to: `${config.registryHomeURL}dashboard?accountid=${accountStore.currentAccount.id}`,
      label: t('labels.bcRegDashboard')
    },
    { to: '/', label: t('page.home.h1') },
    {
      to: `${webUrl.getBusinessDashUrl()}${identifier.value}?accountid=${accountStore.currentAccount.id}`,
      label: businessName.value
    },
    { label: t('page.viewAccess.h1') }
  ])
})

onMounted(async () => {
  // The business name/type only decorate the header and breadcrumb, so a failure here must not stop
  // the table from loading -- the identifier is shown in place of the name.
  try {
    const { business: learBusiness } = await $businessApi<{ business: LearBusiness }>(
      `/businesses/${identifier.value}?slim=true`
    )
    business.value = learBusiness
  } catch (e) {
    logFetchError(e, `Error retrieving business ${identifier.value}`)
  }

  await load()
})
</script>

<template>
  <NuxtLayout name="business">
    <div class="flex flex-col gap-6">
      <div class="relative inset-x-1/2 mx-[-50vw] -mt-8 w-screen overflow-x-hidden bg-white sm:-mt-10">
        <div class="mx-auto flex max-w-bcGovLg flex-col gap-1 px-6 pb-6 pt-[60px] sm:px-8">
          <h1 class="text-xl font-bold text-bcGovColor-darkGray">
            {{ businessName }}
          </h1>
          <p v-if="businessType" class="text-sm text-gray-700">
            {{ businessType }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold text-bcGovColor-darkGray">
          {{ $t('page.viewAccess.h1') }}
        </h2>
        <p class="text-sm text-gray-700">
          {{ $t('page.viewAccess.intro') }}
        </p>
      </div>

      <TableAuthorizedAccounts
        :accounts="accounts"
        :loading="loading"
        :error="error"
      />
    </div>
  </NuxtLayout>
</template>
