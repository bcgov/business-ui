<script setup lang="ts" generic="T extends { actions: ActionType[] }">
const {
  row,
  allowedActions
} = defineProps<{
  row: TableBusinessRow<T>
  allowedActions?: ManageAllowedAction[]
}>()

const emit = defineEmits<{
  'init-edit': []
  'undo': []
  'table-action': []
  'remove': []
}>()

const { t } = useI18n()

function isActionAllowed(action: ManageAllowedAction) {
  return !allowedActions || allowedActions.includes(action)
}

const isAdded = computed(() => row.original.old === undefined)
const isRemoved = computed(() => getIsRowRemoved(row))
const isEdited = computed(() => getIsRowEdited(row))
const isRemovedOrEdited = computed(() => isRemoved.value || isEdited.value)
const canRemove = computed(() => isActionAllowed(ManageAllowedAction.REMOVE) || isAdded.value)
const canChange = computed(() => {
  const allowed = isActionAllowed(ManageAllowedAction.ADDRESS_CHANGE)
    || isActionAllowed(ManageAllowedAction.NAME_CHANGE)
    || isActionAllowed(ManageAllowedAction.ROLE_CHANGE)
  return allowed || isAdded.value
})

const availableActions = computed(() => {
  const actions = []

  if (isRemovedOrEdited.value) {
    actions.push({
      label: t('label.undo'),
      icon: 'i-mdi-undo',
      click: () => emit('undo')
    })
  }

  if (canChange.value && !isRemoved.value) {
    actions.push({
      label: t('label.change'),
      icon: 'i-mdi-pencil',
      click: () => emit('init-edit')
    })
  }

  if (canRemove.value && !isRemoved.value) {
    actions.push({
      label: t('label.remove'),
      icon: 'i-mdi-delete',
      click: () => emit('remove')
    })
  }

  return actions
})

const mainAction = computed(() => availableActions.value[0])
const dropdownActions = computed(() => availableActions.value.slice(1).map(action => ({
  label: action.label,
  icon: action.icon,
  onSelect: action.click,
  ui: {
    item: 'text-primary',
    itemLeadingIcon: 'text-primary'
  }
})))
const hasDropdownActions = computed(() => dropdownActions.value.length > 0)

// NOTE: leaving as a reference to prevent actions if an action is currently in progress
// const preventDropdownCloseAutoFocus = ref(false)
//
// function getDropdownActions() {
//   const ui = {
//     item: 'text-primary',
//     itemLeadingIcon: 'text-primary'
//   }

//   const actions = [
//     {
//       label: t('label.remove'),
//       ui,
//       icon: 'i-mdi-delete',
//       onSelect: async () => {
//         emit('remove')
//         // emit('table-action')
//         // const hasActiveForm = await officerStore.checkHasActiveForm('change')
//         // if (hasActiveForm) {
//         //   preventDropdownCloseAutoFocus.value = true
//         //   return
//         // }
//         // officerStore.removeOfficer(row)
//       }
//     }
//   ]

//   if (isEdited.value) {
//     actions.unshift({
//       label: t('label.change'),
//       icon: 'i-mdi-pencil',
//       ui,
//       onSelect: async () => {
//         emit('init-edit')
//         // emit('table-action')
//         // const hasActiveForm = await officerStore.checkHasActiveForm('change')
//         // if (hasActiveForm) {
//         //   preventDropdownCloseAutoFocus.value = true
//         //   return
//         // }
//         // officerStore.initOfficerEdit(row)
//       }
//     })
//   }

//   return actions
// }

// @click="async () => {
//     const hasActiveForm = await officerStore.checkHasActiveForm('change')
//     if (hasActiveForm) {
//       return
//     }
//     if (isRemoved || hasEdits) {
//       officerStore.undoOfficer(row)
//     }
//     else {
//       officerStore.initOfficerEdit(row)
//     }
//     emit('table-action')
//   }"

// required to prevent refocusing on dropdown trigger
// when the focus has moved to the form when the user has an unfinished task
// onCloseAutoFocus: (e: Event) => {
//   if (preventDropdownCloseAutoFocus) {
//     e.preventDefault()
//     preventDropdownCloseAutoFocus = false
//   }
// }
</script>

<template>
  <div class="flex justify-end">
    <UFieldGroup v-if="mainAction" class="divide-x divide-line-muted">
      <UButton
        variant="ghost"
        :label="mainAction.label"
        :icon="mainAction.icon"
        @click="mainAction.click"
      />
      <UDropdownMenu
        v-if="hasDropdownActions"
        :items="dropdownActions"
        :content="{
          align: 'end'
        }"
      >
        <UButton
          variant="ghost"
          icon="i-mdi-caret-down"
          class="px-4 data-[state=open]:bg-(--ui-primary)/25 group"
          :aria-label="t('label.moreActions')"
          :ui="{
            leadingIcon: 'shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200'
          }"
          @click="$emit('table-action')"
        />
      </UDropdownMenu>
    </UFieldGroup>
  </div>
</template>
