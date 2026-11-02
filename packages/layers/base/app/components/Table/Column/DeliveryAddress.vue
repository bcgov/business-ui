<script setup lang="ts">
const props = defineProps<{
  data: AddressSchema
  /** marks an incomplete address with this text instead of "Not Entered" */
  invalidLabel?: string
}>()

const addressSchema = getRequiredAddressSchema()
const isValidAddress = computed(() => (addressSchema.safeParse(props.data.deliveryAddress)).success)
</script>

<template>
  <div>
    <span v-if="data.sameAs">{{ $t('label.sameAsMailingAddress') }}</span>
    <template v-else-if="!isValidAddress && invalidLabel">
      <ConnectAddressDisplay
        v-if="hasAddressInput(data.deliveryAddress)"
        :address="data.deliveryAddress"
        :text-decor="true"
      />
      <span class="italic text-error" data-testid="invalid-address-label">{{ invalidLabel }}</span>
    </template>
    <span v-else-if="!isValidAddress">{{ $t('label.notEntered') }}</span>
    <ConnectAddressDisplay
      v-else
      :address="data.deliveryAddress"
      :text-decor="true"
    />
  </div>
</template>
