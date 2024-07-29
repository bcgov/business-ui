<script setup lang="ts">
const { loggedInUserOptions } = useSbcNav()
const keycloak = useKeycloak()
const account = useAccountStore()
const environment = useRuntimeConfig().public.environment

defineProps<{
  appVersion: {
    ui: string
    api: string
  } | undefined
}>()
</script>
<template>
  <header
    id="sbc-main-header"
    data-testid="sbc-main-header"
    class="relative border-b-2 border-bcGovColor-navDivider bg-bcGovColor-header p-2 sm:px-4 dark:border-b dark:bg-bcGovColor-darkGray"
  >
    <div v-if="environment.includes('Development') || environment.includes('Test')" class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-3xl text-gray-300 opacity-75">
      <span>{{ environment }}</span>
      <ClientOnly>
        <div v-if="appVersion" class="flex flex-col text-base">
          <span>UI: v{{ appVersion.ui }}</span>
          <span>API: v{{ appVersion.api }}</span>
        </div>
      </ClientOnly>
    </div>
    <nav
      class="m-auto flex w-full max-w-[1360px] items-center justify-between"
      :aria-label="$t('SbcHeader.navLabel')"
    >
      <div class="flex items-center gap-6">
        <SbcLogo />
        <span class="text-lg font-semibold text-white"> {{ $t('btn.sbcConnect') }} </span>
      </div>
      <div class="flex gap-1">
        <ClientOnly>
          <UDropdown
            v-if="keycloak.isAuthenticated()"
            id="account-options-dropdown"
            :items="loggedInUserOptions"
            :ui="{
              width: '',
              height: 'max-h-60',
              item: {
                disabled:
                  'cursor-text select-text text-bcGovGray-900 dark:text-white opacity-100 font-semibold',
              }
            }"
          >
            <!-- required for UInput aria-label -->
            <!-- eslint-disable vue/attribute-hyphenation -->
            <UButton
              id="account-options-button"
              color="white"
              variant="link"
              :ariaLabel="$t('btn.accountOptions')"
            >
              <SbcHeaderAccountLabel
                class="hidden md:flex"
                :username="parseSpecialChars(keycloak.kcUser.value.fullName, 'USER')"
                :account-name="account.currentAccount.name ? parseSpecialChars(account.currentAccount.name, 'ACCOUNT') : ''"
              />
              <UAvatar
                class="md:hidden"
                :alt="parseSpecialChars(keycloak.kcUser.value.fullName, 'U')[0].toUpperCase()"
                :ui="{
                  background: 'bg-bcGovBlue-300 dark:bg-[#E0E7ED]',
                  text: 'font-semibold leading-none text-white dark:text-bcGovColor-darkGray truncate',
                  placeholder: 'font-semibold leading-none text-white truncate dark:text-bcGovColor-darkGray text-xl',
                  rounded: 'rounded-sm'
                }"
              />
            </UButton>

            <template #account>
              <SbcHeaderAccountLabel
                :username="parseSpecialChars(keycloak.kcUser.value.fullName, 'USER')"
                :account-name="account.currentAccount.name ? parseSpecialChars(account.currentAccount.name, 'ACCOUNT') : ''"
                theme="dropdown"
              />
            </template>
          </UDropdown>
        </ClientOnly>
        <LocaleSelect />
      </div>
    </nav>
  </header>
</template>
