<script setup lang="ts">
const store = useTransitionStore()

const activeParty = ref(undefined)
const activeOffice = ref(undefined)
</script>

<template>
  <div class="space-y-6 sm:space-y-10">
    <section class="space-y-4">
      <div>
        <h2 class="text-base">
          1. Office Addresses
        </h2>
        <p>Office addresses must be correct before filing your application.</p>
      </div>

      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : 'No Offices'"
        :add-label="'Add Office'"
        :edit-label="'Edit Office'"
        :allowed-actions="[]"
      />
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="text-base">
          2. Current Directors
        </h2>
        <p>Current directors must be correct before filing your application.</p>
      </div>

      <ManageParties
        v-model:active-party="activeParty"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : 'No Directors'"
        :add-label="'Add Director'"
        :edit-label="'Edit Director'"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      />
    </section>

    <div class="w-full border border-black p-10">
      share structure here
    </div>

    <div class="w-full border border-black p-10 space-y-2">
      <div>articles here</div>
      <div>Maybe no date at all? Ignore this section for now</div>
      <!-- https://www.figma.com/design/9Lp6kpwm6JyfQmBqvRdVJF/Transition-Application?node-id=15505-217656&t=9NvNK4yKNBDaNOdQ-4 -->
    </div>
  </div>
</template>
