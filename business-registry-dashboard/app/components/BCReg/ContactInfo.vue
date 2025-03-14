<template>
  <div class="flex flex-col gap-4">
    <p class="text-bcGovColor-midGray">
      {{ $t('contactInfo.bcRegGeneral.title') }}
    </p>
    <ul>
      <li class="text-bcGovColor-midGray">
        {{ $t('contactInfo.bcRegGeneral.tollFree.title') }}
        <a class="text-blue-500 underline" :href="`tel:${$t('contactInfo.bcRegGeneral.tollFree.value')}`">{{ $t('contactInfo.bcRegGeneral.tollFree.value') }}</a>
      </li>
      <li class="text-bcGovColor-midGray">
        {{ $t('contactInfo.bcRegGeneral.victoriaOffice.title') }}
        <a class="text-blue-500 underline" :href="`tel:${$t('contactInfo.bcRegGeneral.victoriaOffice.value')}`">{{ $t('contactInfo.bcRegGeneral.victoriaOffice.value') }}</a>
      </li>
      <li class="text-bcGovColor-midGray">
        {{ $t('contactInfo.bcRegGeneral.email.title') }}
        <a class="text-blue-500 underline" href="mailto:BCRegistries@gov.bc.ca?subject=BC Registries and Online Services - Support Request">BCRegistries@gov.bc.ca</a>
      </li>
    </ul>
    <div class="flex flex-col">
      <span class="font-semibold text-bcGovColor-midGray">{{ $t('contactInfo.bcRegGeneral.hours.title') }}</span>
      <span class="text-bcGovColor-midGray">{{ $t('contactInfo.bcRegGeneral.hours.value') }}</span>
    </div>
  </div>
</template>
