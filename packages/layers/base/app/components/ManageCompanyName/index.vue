<script setup lang="ts">
import { DateTime } from 'luxon'

// correctNameOptions and nrAllowedActionsTypes only required when readonly = false
type Props = {
  stateKey?: string
  business?: BusinessData | BusinessDataPublic
  contact?: ContactPoint
  loading?: boolean
} & (
  | {
    readonly: false
    correctNameOptions: CorrectNameOption[]
    nrAllowedActionsTypes: NrRequestActionCode[]
  }
  | {
    readonly?: true
    correctNameOptions?: CorrectNameOption[]
    nrAllowedActionsTypes?: NrRequestActionCode[]
  }
)

const {
  stateKey = 'manage-company-name',
  business,
  contact
} = defineProps<Props>()

const activeNameRequest = defineModel<ActiveNameRequestSchema | undefined>('active-name-request', { required: true })

const { t } = useI18n()
const schema = getNameRequestSchema()
const { state, nrDetails, undoState, updateState } = useManageCompanyName(stateKey)

const formattedFoundingDate = computed(() => {
  return toReadableDate(business?.foundingDate ?? '', DateTime.DATETIME_FULL)
})

const formattedContactInfo = computed(() => {
  const emptyText = `(${t('label.notEntered')})`

  if (!contact) {
    return { phone: emptyText, email: emptyText }
  }

  const { phone, extension, phoneExtension, email } = contact

  const ext = extension ?? phoneExtension
  const phoneLabel = phone
    ? (ext ? `${phone} Ext: ${ext}` : phone)
    : emptyText

  return {
    phone: phoneLabel,
    email: email ?? emptyText
  }
})

const mainAction = computed(() => {
  if (state.value.new.actions.length) {
    return { label: t('label.undo'), icon: 'i-mdi-undo', click: undoState }
  }
  return { label: t('label.correct'), icon: 'i-mdi-pencil', click: initEdit }
})

const dropdownActions = computed(() => {
  if (state.value.new.actions.length) {
    return [{ label: t('label.change'), icon: 'i-mdi-pencil', onSelect: initEdit }]
  }
  return []
})

function initEdit() {
  activeNameRequest.value = schema.parse({})
}

function cleanupForm() {
  activeNameRequest.value = undefined
}
</script>

<template>
  <ConnectPageSection
    :heading="{ label: 'Your Company', icon: 'i-mdi-domain', ui: 'bg-shade-secondary px-4 py-4 sm:px-6 rounded-t-md' }"
    ui-body="p-0 sm:p-0"
  >
    <div class="flex flex-col">
      <ConnectFieldset padding-class="py-4 px-4 sm:py-5 sm:px-6">
        <template #label>
          <div class="space-y-1">
            <div>Company Name</div>
            <UBadge
              v-if="state.new.actions.includes(ActionType.CORRECTED)"
              :label="$t('badge.corrected')"
            />
          </div>
        </template>
        <template #default>
          <div v-if="!activeNameRequest" class="flex justify-between">
            <USkeleton v-if="loading" class="h-8 w-3/4 sm:w-1/2" />
            <ManageCompanyNameNrDetails v-else-if="nrDetails" :details="nrDetails" />
            <span v-else class="text-xl font-bold">{{ state.new.legalName }}</span>
            <UFieldGroup v-if="!readonly" class="divide-x divide-line-muted h-min">
              <UButton
                :label="mainAction.label"
                :icon="mainAction.icon"
                variant="ghost"
                @click="mainAction.click"
              />
              <UDropdownMenu
                v-if="dropdownActions.length"
                :items="dropdownActions"
              >
                <UButton
                  variant="ghost"
                  icon="i-mdi-caret-down"
                  class="px-4 data-[state=open]:bg-(--ui-primary)/25 group"
                  :aria-label="t('label.moreActions')"
                  :ui="{
                    leadingIcon: 'shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200'
                  }"
                />
              </UDropdownMenu>
            </UFieldGroup>
          </div>
          <FormBusinessName
            v-if="business && activeNameRequest"
            ref="business-name-form"
            v-model="activeNameRequest"
            name="activeNameRequest"
            :state-key="stateKey"
            :initial-company-name="state.new.legalName"
            :business-identifier="business.identifier"
            :business-type="business.legalType"
            :correct-name-options="readonly ? [] : correctNameOptions"
            :filing-name="useFiling().getFilingName(FilingType.CORRECTION)!"
            :nr-allowed-action-types="readonly ? [] : nrAllowedActionsTypes"
            @cancel="activeNameRequest = undefined"
            @done="() => { updateState(activeNameRequest); cleanupForm() }"
          />
        </template>
      </ConnectFieldset>
      <USeparator class="px-4 sm:px-6" />
      <div class="flex gap-2 sm:gap-6 px-4 sm:px-6 flex-col sm:flex-row border-l-3 border-transparent py-4 sm:py-5">
        <span class="text-neutral-highlighted font-bold w-full sm:basis-1/4">
          Recognition Date and Time
        </span>
        <USkeleton v-if="loading" class="h-6 w-2/3 sm:w-1/3" />
        <span v-else class="flex-1">{{ formattedFoundingDate }}</span>
      </div>
      <USeparator class="px-4 sm:px-6" />
      <div class="flex gap-2 sm:gap-6 px-4 sm:px-6 flex-col sm:flex-row border-l-3 border-transparent py-4 sm:py-5">
        <span class="text-neutral-highlighted font-bold w-full sm:basis-1/4">
          Registered Office Contact Information
        </span>

        <div class="grid grid-cols-2 gap-4 sm:gap-6 flex-1">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-bold text-neutral-highlighted">Email Address</span>
            <USkeleton v-if="loading" class="h-6 w-3/4 sm:w-1/2" />
            <span v-else>{{ formattedContactInfo.email || t('label.notEntered') }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-sm font-bold text-neutral-highlighted">Phone Number</span>
            <USkeleton v-if="loading" class="h-6 w-3/4 sm:w-1/2" />
            <span v-else>{{ formattedContactInfo.phone }}</span>
          </div>
        </div>
      </div>
    </div>
  </ConnectPageSection>
</template>
