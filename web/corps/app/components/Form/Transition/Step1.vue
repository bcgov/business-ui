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

    <section data-testid="share-structure-section">
      <h2 class="text-base">
        3. {{ $t('label.shareStructure') }}
      </h2>

      <ManageShareStructure
        v-model:active-class="store.formState.activeClass"
        v-model:active-series="store.formState.activeSeries"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noShareClasses')"
        :add-label="$t('label.addShareClass')"
      />
    </section>
  </div>
</template>
