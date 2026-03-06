<script setup lang="ts">
import type { Form } from '@nuxt/ui'

const store = useCorrectionStore()
const activeOffice = ref<ActiveOfficesSchema | undefined>(undefined)

const _formRef = useTemplateRef<Form<unknown>>('correction-form-step-1')

const directorAllowedActions = [
  ManageAllowedAction.ADD,
  ManageAllowedAction.ADDRESS_CHANGE,
  ManageAllowedAction.NAME_CHANGE,
  ManageAllowedAction.REMOVE
]

const receiverLiquidatorAllowedActions = [
  ManageAllowedAction.ADD,
  ManageAllowedAction.ADDRESS_CHANGE,
  ManageAllowedAction.NAME_CHANGE,
  ManageAllowedAction.REMOVE
]
</script>

<template>
  <UForm
    ref="correction-form-step-1"
    :state="store.formState"
    novalidate
    class="space-y-6 sm:space-y-10"
    @error="onFormSubmitError"
  >
    <!-- Section 1: Office Addresses -->
    <section class="space-y-4" data-testid="office-addresses-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.officeAddresses') }}
        </h2>
        <p>{{ $t('text.officeAddressesMustBeCorrect') }}</p>
      </div>

      <ManageOffices
        v-model:active-office="activeOffice"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noOffices')"
        :add-label="$t('label.addOffice')"
        :edit-label="$t('label.editOffice')"
        :allowed-actions="[ManageAllowedAction.ADDRESS_CHANGE]"
      />
    </section>

    <!-- Section 2: Directors -->
    <section class="space-y-4" data-testid="current-directors-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.currentDirectors') }}
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
        :allowed-actions="directorAllowedActions"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
        form-party-details-name="activeDirector"
      />
    </section>

    <!-- Section 3: Share Structure -->
    <section data-testid="share-structure-section">
      <h2 class="text-base">
        {{ $t('label.shareStructure') }}
      </h2>

      <ManageShareStructure
        v-model:active-class="store.formState.activeClass"
        v-model:active-series="store.formState.activeSeries"
        :loading="store.initializing"
        :empty-text="store.initializing
          ? `${$t('label.loading')}...`
          : $t('label.noShareClasses')
        "
        :add-label="$t('label.addShareClass')"
      />
    </section>

    <!-- Section 4: Receivers -->
    <!-- ToDO: Do we want recievers conditionally -->
    <section class="space-y-4" data-testid="receivers-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.receivers') }}
        </h2>
        <p>{{ $t('text.receiversMustBeCorrect') }}</p>
      </div>

      <ManageParties
        v-model:active-party="store.formState.activeReceiver"
        state-key="manage-receivers"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noReceivers')"
        :add-label="$t('label.addReceiver')"
        :edit-label="$t('label.editReceiver')"
        :role-type="RoleTypeUi.RECEIVER"
        :allowed-actions="receiverLiquidatorAllowedActions"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
        form-party-details-name="activeReceiver"
        :party-form-props="{
          partyNameProps: { allowBusinessName: true, allowPreferredName: false }
        }"
      />
    </section>

    <!-- Section 5: Liquidators -->
    <!-- ToDO: Do we want liquidators conditionally -->
    <section class="space-y-4" data-testid="liquidators-section">
      <div>
        <h2 class="text-base">
          {{ $t('label.liquidators') }}
        </h2>
        <p>{{ $t('text.liquidatorsMustBeCorrect') }}</p>
      </div>

      <ManageParties
        v-model:active-party="store.formState.activeLiquidator"
        state-key="manage-liquidators"
        :loading="store.initializing"
        :empty-text="store.initializing ? `${$t('label.loading')}...` : $t('label.noLiquidators')"
        :add-label="$t('label.addLiquidator')"
        :edit-label="$t('label.editLiquidator')"
        :role-type="RoleTypeUi.LIQUIDATOR"
        :allowed-actions="receiverLiquidatorAllowedActions"
        :columns-to-display="['name', 'delivery', 'mailing', 'effectiveDates', 'actions']"
        form-party-details-name="activeLiquidator"
        :party-form-props="{
          partyNameProps: { allowBusinessName: true, allowPreferredName: false }
        }"
      />
    </section>

    <!-- Section: Correction Detail Comment (number adjusts based on visible sections) -->
    <section class="space-y-4" data-testid="correction-comment-section">
      <h2 class="text-base">
        PLACEHOLDER COMPONENT: {{ $t('label.correctionComment') }}
      </h2>
      <p>{{ $t('text.correctionCommentDescription') }}</p>
      <div class="rounded bg-white p-6">
        <UFormField name="comment">
          <UTextarea
            v-model="store.formState.comment"
            :placeholder="$t('text.correctionCommentDescription')"
            :maxlength="4096"
            :rows="5"
            class="w-full"
          />
        </UFormField>
      </div>
    </section>
  </UForm>
</template>
