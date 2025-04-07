<script setup lang="ts">
defineProps<{
  address: Partial<ConnectAddress>
  omitCountry?: boolean
  useLocationDescLabel?: boolean
}>()

const getAddressDisplayParts = (
  address: Partial<ConnectAddress>,
  separateCity = false,
  addTextDecor = false,
  omitCountry = false
): string[] => {
  const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' })
  const textDecor = addTextDecor ? ',' : ''

  const getLine1 = () => {
    return (
      address.street || [
        [address.unitNumber, address.streetNumber].filter(val => !!val).join('-'),
        address.streetName
      ].filter(val => !!val).join(' ') || ''
    ) + textDecor
  }

  const getLine2 = () => {
    return (address.streetAdditional || '') + textDecor
  }

  const getCity = () => {
    return (address.city || '') + textDecor
  }

  const getRegion = () => {
    return address.region
      ? address.region + (addTextDecor ? '\u00A0' : '')
      : ''
  }

  const getCountry = () => {
    return address.country && !omitCountry ? (regionNamesInEnglish.of(address.country) || address.country) : ''
  }

  return [
    getLine1(),
    getLine2(),
    separateCity ? getCity() : '',
    [!separateCity ? getCity() : '', getRegion(), address.postalCode].filter(val => !!val).join(' ') || '',
    getCountry()
  ].filter(val => !!val && val !== ',')
}
</script>

<template>
  <div data-testid="address-display">
    <div
      v-for="addressLine, i in getAddressDisplayParts(address, false, true, omitCountry)"
      :key="addressLine + i"
      data-testid="address-line"
    >
      {{ addressLine }}
    </div>
    <ConnectInfoBox
      v-if="address.locationDescription"
      class="mt-2"
      :content="address.locationDescription"
      :title="useLocationDescLabel ? $t('label.locationDescription') : $t('label.deliveryInstructions')"
      data-testid="location-description"
    />
  </div>
</template>
