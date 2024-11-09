<template>
  <div class="flex flex-col gap-4">
    <p class="text-bcGovColor-midGray">
      {{ $t('contactInfo.bcRegGeneral.title') }}
    </p>
    <ul>
      <li class="text-bcGovColor-midGray">
        {{ $t('contactInfo.bcRegGeneral.tollFree.title') }}
        <a class="text-blue-500 underline" href="tel:+1-877-370-1033">1-877-370-1033</a>
      </li>
      <li class="text-bcGovColor-midGray">
        {{ $t('contactInfo.bcRegGeneral.victoriaOffice.title') }}
        <a class="text-blue-500 underline" href="tel:+1-250-370-1033">1-250-370-1033</a>
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
