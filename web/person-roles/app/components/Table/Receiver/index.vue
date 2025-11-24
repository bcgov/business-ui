<script setup lang="ts">
defineProps<{
  loading?: boolean
  emptyText?: string
  addLabel: string
  editLabel: string
}>()

const activeParty = defineModel<ActivePartySchema | undefined>('active-party', { required: true })

const {
  addingParty,
  expandedState,
  tableState,
  addNewParty,
  removeParty,
  undoParty,
  applyTableEdits
} = usePartyTable()

const activePartySchema = getActivePartySchema()

function initAddParty() {
  activeParty.value = activePartySchema.parse({})
  addingParty.value = true
}

function cleanupPartyForm() {
  addingParty.value = false
  expandedState.value = undefined
  activeParty.value = undefined
}

function addParty(party: ActivePartySchema) {
  addNewParty(party)
  cleanupPartyForm()
}

function initEditParty(row: TableBusinessRow<PartySchema>) {
  activeParty.value = activePartySchema.parse({ ...row.original.new })
  expandedState.value = { [row.index]: true }
}

function applyEdits(party: ActivePartySchema, row: TableBusinessRow<PartySchema>) {
  applyTableEdits(party, row)
  cleanupPartyForm()
}
</script>

<template>
  <div class="space-y-4">
    <UButton
      :label="addLabel"
      variant="outline"
      icon="i-mdi-account-plus-outline"
      class="w-min"
      @click="initAddParty"
    />

    <FormPartyDetails
      v-if="addingParty && activeParty"
      v-model="activeParty"
      :title="addLabel"
      name="activeParty"
      variant="add"
      @done="() => addParty(activeParty)"
      @cancel="cleanupPartyForm"
    />

    <TableParty
      v-model:expanded="expandedState"
      :data="tableState"
      :loading
      :empty-text="emptyText"
      @init-edit="initEditParty"
      @remove="removeParty"
      @undo="undoParty"
    >
      <template #expanded="{ row }">
        <FormPartyDetails
          v-if="activeParty"
          v-model="activeParty"
          :title="editLabel"
          name="activeParty"
          variant="edit"
          @cancel="cleanupPartyForm"
          @done="() => applyEdits(activeParty, row)"
        />
      </template>
    </TableParty>
  </div>
</template>
