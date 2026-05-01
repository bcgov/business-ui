<script setup lang="ts">
definePageMeta({
  layout: 'connect-auth',
  breadcrumbs: [
    { to: '/', label: 'Examples' },
    { label: 'SubFormWrapper' }
  ]
})

useHead({
  title: 'SubFormWrapper Example'
})

const test = ref('')
const formTarget = 'some-sub-form'
const { alerts, attachAlerts, setAlert } = useFilingAlerts('sub-form-alerts')
const { targetId, messageId } = attachAlerts(formTarget, test)

function triggerTaskGuard() {
  setAlert(formTarget, 'Task guard alert')
}
</script>

<template>
  <div class="py-8 space-y-6">
    <h1>
      SubFormWrapper
    </h1>

    <ConnectPageSection :heading="{ label: 'Props' }" ui-body="p-4 space-y-4">
      <ul>
        <li>`variant` - 'edit' | 'add' | 'correct' | 'change' - required</li>
        <li>`itemLabel` - string - required</li>
        <li>`hideHeaderCancel` - boolean - optional</li>
        <li>`hideRemove` - boolean - optional</li>
        <li>`error` - boolean - optional</li>
        <li>`taskGuardConfig` - { message?: string, messageId: string, targetId: string } - optional</li>
      </ul>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '`edit` variant' }" ui-body="p-4 space-y-4">
      <SubFormWrapper variant="edit" item-label="Officer">
        <div class="p-10 flex items-center justify-center border border-black mt-8">
          Content Here
        </div>
      </SubFormWrapper>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '`add` variant' }" ui-body="p-4 space-y-4">
      <SubFormWrapper variant="add" item-label="Officer">
        <div class="p-10 flex items-center justify-center border border-black mt-8">
          Content Here
        </div>
      </SubFormWrapper>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '`correct` variant' }" ui-body="p-4 space-y-4">
      <SubFormWrapper variant="correct" item-label="Officer">
        <div class="p-10 flex items-center justify-center border border-black mt-8">
          Content Here
        </div>
      </SubFormWrapper>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: '`change` variant' }" ui-body="p-4 space-y-4">
      <SubFormWrapper variant="change" item-label="Officer">
        <div class="p-10 flex items-center justify-center border border-black mt-8">
          Content Here
        </div>
      </SubFormWrapper>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: 'hideHeaderCancel - `add` variant' }" ui-body="p-4 space-y-4">
      <SubFormWrapper
        variant="add"
        item-label="Officer"
        hide-header-cancel
      >
        <div class="p-10 flex items-center justify-center border border-black mt-8">
          Content Here
        </div>
      </SubFormWrapper>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: 'hideRemove - `edit` variant' }" ui-body="p-4 space-y-4">
      <SubFormWrapper
        variant="edit"
        item-label="Officer"
        hide-remove
      >
        <div class="p-10 flex items-center justify-center border border-black mt-8">
          Content Here
        </div>
      </SubFormWrapper>
    </ConnectPageSection>

    <ConnectPageSection :heading="{ label: 'error - `add` variant' }" ui-body="p-4 space-y-4">
      <SubFormWrapper
        variant="add"
        item-label="Officer"
        error
      >
        <div class="p-10 flex items-center justify-center border border-black mt-8">
          Content Here
        </div>
      </SubFormWrapper>
    </ConnectPageSection>

    <ConnectPageSection
      :heading="{ label: 'Task Guard - `edit` variant' }"
      ui-body="p-4 space-y-4"
      :actions="[{ label: 'Trigger Task Guard', variant: 'outline', onClick: triggerTaskGuard }]"
    >
      <SubFormWrapper
        variant="edit"
        item-label="Officer"
        :task-guard-config="{
          message: alerts[formTarget],
          messageId,
          targetId
        }"
      >
        <div class="p-8 flex items-center justify-center">
          <ConnectInput
            id="example-input"
            v-model="test"
            label="Content Here"
          />
        </div>
      </SubFormWrapper>
    </ConnectPageSection>
  </div>
</template>
