<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [
    { to: '/', label: 'Examples' },
    { label: 'ModalError' }
  ]
})

useHead({
  title: 'ModalError Example'
})

const { errorModal } = useModal()

function openExample(error: unknown) {
  errorModal.open({
    error,
    i18nPrefix: 'errorModal',
    buttons: [
      {
        label: 'Close', variant: 'outline', shouldClose: true
      },
      {
        label: 'Trigger Alert', onClick: () => window.alert('Alert from modal!')
      }
    ]
  })
}
</script>

<template>
  <div class="py-8 space-y-6">
    <h1>
      ModalError
    </h1>

    <p>The modal content will be set by the error response.status or statusCode.</p>

    <ConnectPageSection :heading="{ label: 'Props' }" ui-body="p-4 space-y-4">
      <ul>
        <li>`i18nPrefix` - string - required </li>
        <li>`error` - unknown - required </li>
        <li>`buttons` - ConnectModalButton[] - optional </li>
      </ul>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: 'Usage' }" ui-body="p-4 space-y-4">
      <code>
        const { errorModal } = useModal()
        <br>
        errorModal.open({...props})
      </code>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '404 Error' }" ui-body="p-4 space-y-4">
      <UButton label="Open" @click="openExample({ response: { status: 404 } })" />
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '401 Error' }" ui-body="p-4 space-y-4">
      <UButton label="Open" @click="openExample({ statusCode: 401 })" />
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '403 Error' }" ui-body="p-4 space-y-4">
      <UButton label="Open" @click="openExample({ response: { status: 403 } })" />
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '500 Error' }" ui-body="p-4 space-y-4">
      <UButton label="Open" @click="openExample({ statusCode: 500 })" />
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: 'No Translation Error' }" ui-body="p-4 space-y-4">
      <UButton label="Open" @click="openExample({ response: { status: 503 } })" />
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: 'Unknown Error' }" ui-body="p-4 space-y-4">
      <UButton label="Open" @click="openExample(undefined)" />
    </ConnectPageSection>
  </div>
</template>
