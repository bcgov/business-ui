<script setup lang="ts">
const store = useTransitionStore()
const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)
</script>

<template>
  <div class="space-y-6 sm:space-y-10">
    <section class="space-y-4" data-testid="office-addresses-section">
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

    <section class="space-y-4" data-testid="current-directors-section">
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
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
      />
    </section>

    <div class="w-full border border-black p-10" data-testid="share-structure-section">
      share structure here
    </div>

    <div class="w-full border border-black p-10 space-y-2" data-testid="articles-section">
      <div>articles here</div>
      <div>Maybe no date at all? Ignore this section for now</div>
    </div>
  </div>
</template>
