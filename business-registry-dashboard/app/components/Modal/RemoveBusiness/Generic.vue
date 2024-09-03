<script setup lang="ts">
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const props = defineProps<{
  removeBusinessPayload: RemoveBusinessPayload
  loading: boolean
}>()

defineEmits<{
  confirm: [void]
  close: [void]
}>()

const modalOptions = computed(() => {
  const type = props.removeBusinessPayload.business.corpType.code
  let title = ''
  let description = ''
  let primaryBtnLabel = ''
  let secondaryBtnLabel = ''

  if (type === CorpTypes.NAME_REQUEST) {
    title = 'Remove Name Request?' // TODO: add translations
    description = 'Removing this Name Request will remove the request from your Business Registry list. You can add it back at a later time by selecting Add an Existing... Name Request. This Name Request will still be valid until it is used or cancelled, or it expires.'
    primaryBtnLabel = 'Remove Name Request'
    secondaryBtnLabel = 'Keep Name Request'
  } else if (type === CorpTypes.INCORPORATION_APPLICATION) {
    title = 'Delete Incorporation Application?' // TODO: add translations
    description = 'Deleting this incorporation application will remove the application from your Business Registry list. The business associated with this application will not be incorporated. If this incorporation application was associated with a Name Request, the Name Request can still be used to incorporate a business.'
    primaryBtnLabel = 'Delete Incorporation Application'
    secondaryBtnLabel = 'Keep Incorporation Application'
  } else if (type === CorpTypes.AMALGAMATION_APPLICATION) {
    title = 'Delete Amalgamation Application?' // TODO: add translations
    description = 'Deleting this amalgamation application will remove the application from your Business Registry list. If this amalgamation application was associated with a Name Request, the Name Request can still be used to start an amalgamation application.'
    primaryBtnLabel = 'Delete Amalgamation Application'
    secondaryBtnLabel = 'Keep Amalgamation Application'
  } else if (type === CorpTypes.REGISTRATION) {
    title = 'Delete Registration?' // TODO: add translations
    description = 'Deleting this registration will remove the application from your Business Registry list. The business associated with this application will not be registered. If this registration was associated with a Name Request, the Name Request can still be used to register a business.'
    primaryBtnLabel = 'Delete Registration'
    secondaryBtnLabel = 'Keep Registration'
  } else if (type === CorpTypes.PARTNERSHIP || type === CorpTypes.SOLE_PROP) {
    title = 'Remove Registration?' // TODO: add translations
    description = 'Removing this registration will remove the associated business from your Business Registry list. To add the business back to the My Business Registry list later, you will need the business registration number and the name of the proprietor exactly as it appears on the registration application.'
    primaryBtnLabel = 'Remove Registration'
    secondaryBtnLabel = 'Keep Registration'
  } else { // this should never happen
    console.log('handle passcodeResetOptionsModal')
    title = 'password?'
    description = 'password?'
    // this.$refs.passcodeResetOptionsModal.open()
  }

  return { title, description, primaryBtnLabel, secondaryBtnLabel }
})
</script>
<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <UIcon name="i-mdi-alert-circle-outline" class="-mt-10 size-8 text-red-500" />
    <h2 class="text-xl font-semibold">
      {{ modalOptions.title }}
    </h2>
    <p>{{ modalOptions.description }}</p>
    <div class="mt-2 flex flex-wrap items-center justify-center gap-4">
      <UButton
        :block="isSmallScreen"
        :label="modalOptions.primaryBtnLabel"
        :loading
        @click="$emit('confirm')"
      />
      <UButton
        :block="isSmallScreen"
        :label="modalOptions.secondaryBtnLabel"
        color="gray"
        @click="$emit('close')"
      />
    </div>
  </div>
</template>
