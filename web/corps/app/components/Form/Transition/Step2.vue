<script setup lang="ts">
const store = useTransitionStore()
const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
</script>

<template>
  <div class="space-y-6 sm:space-y-10">
    <section class="space-y-4">
      <div>
        <h2 class="text-base">
          1. {{ $t('label.officeAddresses') }}
        </h2>
        <p>{{ $t('text.officeAddressesMustBeCorrect') }}</p>
      </div>

      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :add-label="$t('label.addOffice')"
        :edit-label="$t('label.editOffice')"
        :allowed-actions="[]"
      />
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="text-base">
          2. {{ $t('label.currentDirectors') }}
        </h2>
        <p>{{ $t('text.currentDirectorsMustBeCorrect') }}</p>
      </div>

      <ManageParties
        v-model:active-party="store.formState.activeDirector"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noDirectors')"
        :add-label="$t('label.addDirector')"
        :edit-label="$t('label.editDirector')"
        :role-type="RoleTypeUi.DIRECTOR"
        :allowed-actions="[]"
      />
    </section>

    <div class="w-full border border-black p-10">
      share structure here
    </div>

    <div class="w-full border border-black p-10">
      articles here - Maybe not needed - ignore for now
    </div>

    <div class="w-full border border-black p-10">
      pre existing company provisions
    </div>

    <!-- staff only -->
    <div class="w-full border border-black p-10">
      document delivery
    </div>

    <!-- TODO: help content enhancement? -->
    <!-- client only -->
    <FormFolio
      v-if="!store.isStaff && store.formState.folio"
      v-model="store.formState.folio"
      order="X"
      name="folio"
    />

    <!-- staff only -->
    <FormCourtOrderPoa
      v-if="store.isStaff && store.formState.courtOrder"
      v-model="store.formState.courtOrder"
      :disabled="store.initializing"
      name="courtOrder"
      order="X"
    />

    <!-- client only -->
    <FormCertify
      v-if="!store.isStaff && store.formState.certify"
      v-model="store.formState.certify"
      order="X"
      name="certify"
      :description="$t('text.certifyTransitionDescription')"
    />

    <!-- staff only -->
    <ConnectFieldset
      v-if="store.isStaff && store.formState.staffPayment"
      :label="`4. ${$t('label.staffPayment')}`"
      body-variant="card"
    >
      <ConnectFormFieldWrapper :label="$t('label.payment')" orientation="horizontal">
        <StaffPayment
          ref="staff-pay-ref"
          v-model="store.formState.staffPayment"
          :disabled="store.initializing"
          :show-priority="true"
          name="staffPayment"
          :enable-auto-reset="!store.initializing"
        />
      </ConnectFormFieldWrapper>
    </ConnectFieldset>
  </div>
</template>
