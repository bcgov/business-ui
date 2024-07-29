<template>
  <!-- use french logo for french locale, any other locale uses english logo -->
  <div v-if="$i18n.locale === 'fr-CA'">
    <!-- Using scale because it will increase the size of the image without affecting the container size -->
    <!-- there is a lot of padding on the images, if only the height gets increased, the padding makes the header too tall -->
    <img
      class="hidden h-[60px] scale-125 sm:block"
      src="BCGovLogoLgFr"
      :alt="$t('SbcLogo.alt')"
    >
    <img
      class="block h-[64px] scale-125 sm:hidden"
      src="BCGovLogoSmFr"
      :alt="$t('SbcLogo.alt')"
    >
  </div>
  <div v-else>
    <img
      class="hidden h-[60px] scale-125 sm:block"
      src="BCGovLogoLgEn"
      :alt="$t('SbcLogo.alt')"
    >
    <img
      class="block h-[64px] scale-150 sm:hidden"
      src="BCGovLogoSmEn"
      :alt="$t('SbcLogo.alt')"
    >
  </div>
</template>
