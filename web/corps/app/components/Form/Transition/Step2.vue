<script setup lang="ts">
const store = useTransitionStore()

const activeParty = ref(undefined)
const activeOffice = ref(undefined)
const folio = reactive({
  folioNumber: ''
})
const certify = reactive({
  isCertified: false,
  legalName: ''
})
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
        :allowed-actions="[]"
      />
    </section>

    <div class="w-full border border-black p-10">
      share structure here
    </div>

    <div class="w-full border border-black p-10">
      articles here
    </div>

    <div class="w-full border border-black p-10">
      pre existing company provisions
    </div>

    <div class="w-full border border-black p-10">
      document delivery
    </div>

    <FormFolio
      v-model="folio"
      order="X"
    />

    <FormCertify
      v-model="certify"
      order="X"
      description="Confirm the legal name of the person authorized to complete and submit this post restoration transition application."
    />
  </div>
</template>
