<script setup lang="ts">
import { CorpTypeCd, GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'

// No `order: 0` here on purpose: that marks a page as reachable without authentication
// (see middleware/00.auth.global.ts), and this page shows who can access a business.
definePageMeta({ layout: 'business' })

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
    business.value = await $businessApi<LearBusiness>(`/businesses/${identifier.value}?slim=true`)
  } catch (e) {
    logFetchError(e, `Error retrieving business ${identifier.value}`)
  }

  await load()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-[32px] text-bcGovColor-darkGray">
        {{ businessName }}
      </h1>
      <p v-if="businessType" class="text-gray-700">
        {{ businessType }}
      </p>
    </div>

    <div class="flex flex-col gap-1">
      <h2 class="text-xl font-semibold text-bcGovColor-darkGray">
        {{ $t('page.viewAccess.h1') }}
      </h2>
      <p class="text-gray-700">
        {{ $t('page.viewAccess.intro') }}
      </p>
    </div>

    <TableAuthorizedAccounts
      :accounts="accounts"
      :loading="loading"
      :error="error"
    />
  </div>
</template>
