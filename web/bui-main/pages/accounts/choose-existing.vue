<script setup lang="ts">
import { isoCountriesList } from '~/utils/isoCountriesList'
const localePath = useLocalePath()
const { t } = useI18n()
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const accountStore = useAccountStore()

useHead({
  title: t('page.existingAccount.title')
})

definePageMeta({
  middleware: ['filing-paid', 'filing-in-progress', 'check-accounts']
})

onMounted(() => {
  const pageLoading = useState('page-loading')
  pageLoading.value = false
})
</script>
<template>
  <ClientOnly>
    <div class="mx-auto flex flex-col items-center gap-4 text-left sm:gap-8">
      <SbcPageSectionH1
        :heading="$t('page.existingAccount.h1')"
        class="self-start"
      />
      <UCard class="w-full max-w-5xl border border-bcGovColor-navDivider bg-[#FFF7E3]">
        <div class="flex items-center gap-2">
          <p class="text-bcGovColor-midGray dark:text-gray-300">
            <span class="font-semibold">{{ $t('labels.note') }}: </span>{{ $t('page.existingAccount.existingAccountWarning') }}
          </p>
        </div>
      </UCard>
      <h2 class="self-start text-xl font-semibold text-bcGovColor-darkGray dark:text-white">
        {{ $t('page.existingAccount.h2') }} ({{ accountStore.userAccounts?.length || 0 }})
      </h2>
      <UCard class="max-h-96 w-full overflow-auto">
        <ul
          class="flex flex-col divide-y text-left text-bcGovColor-midGray dark:text-white"
        >
          <li v-for="account in accountStore.userAccounts" :key="account.name" class="flex flex-col items-start gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
            <div class="flex flex-row items-center gap-4 sm:gap-6">
              <UAvatar
                :alt="account.name[0]"
                :ui="{
                  background: 'bg-bcGovBlue-300 dark:bg-[#E0E7ED]',
                  text: 'font-semibold leading-none text-white dark:text-bcGovColor-darkGray truncate',
                  placeholder: 'font-semibold leading-none text-white truncate dark:text-bcGovColor-darkGray text-xl',
                  rounded: 'rounded-sm'
                }"
              />
              <div class="flex w-full flex-col text-left">
                <span class="text-lg font-semibold text-bcGovColor-darkGray dark:text-white">
                  {{ account.name }}
                </span>
                <span
                  v-if="account.mailingAddress.length !== 0 && 'street' in account.mailingAddress[0]"
                  :id="`account-address-${account.id}`"
                  class="text-bcGovColor-midGray dark:text-gray-300"
                >
                  {{ account.mailingAddress[0].street }},
                  {{ account.mailingAddress[0].city }},
                  {{ account.mailingAddress[0].region }}
                  {{ account.mailingAddress[0].postalCode }},
                  {{ isoCountriesList.find((country: SbcCountry) => country.alpha_2 === account.mailingAddress[0].country)?.name || account.mailingAddress[0].country }}
                </span>
              </div>
            </div>
            <UButton
              class="sm:ml-auto"
              :label="$t('btn.useThisAccount.main')"
              :aria-describedby="account.mailingAddress.length !== 0 ? `account-address-${account.id}` : ''"
              :aria-label="$t('btn.useThisAccount.aria', { name: account.name})"
              icon="i-mdi-chevron-right"
              trailing
              :disabled="accountStore.loading"
              :block="isSmallScreen"
              :loading="accountStore.loading && account.id === accountStore.currentAccount.id"
              data-testid="choose-existing-account-button"
              @click="accountStore.selectUserAccount(account.id, () => navigateTo(localePath('/annual-report')))"
            />
          </li>
        </ul>
      </UCard>
      <UButton
        :to="localePath('/accounts/create-new')"
        variant="outline"
        :label="$t('btn.createNewAccount')"
        icon="i-mdi-chevron-right"
        trailing
        :block="isSmallScreen"
      />
    </div>
  </ClientOnly>
</template>
