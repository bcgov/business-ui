<script setup lang="ts">
const props = defineProps<{
  isRemoved: boolean
  isEdited: boolean
}>()

const emit = defineEmits<{
  'init-edit': []
  'undo': []
  'table-action': []
  'remove': []
}>()

const { t } = useI18n()

// const preventDropdownCloseAutoFocus = ref(false)

const isRemovedOrEdited = computed(() => props.isRemoved || props.isEdited)

function onMainActionClick() {
  if (isRemovedOrEdited.value) {
    emit('undo')
  } else {
    emit('init-edit')
  }
}

function getDropdownActions() {
  const ui = {
    item: 'text-primary',
    itemLeadingIcon: 'text-primary'
  }

  const actions = [
    {
      label: t('label.remove'),
      ui,
      icon: 'i-mdi-delete',
      onSelect: async () => {
        emit('remove')
        // emit('table-action')
        // const hasActiveForm = await officerStore.checkHasActiveForm('change')
        // if (hasActiveForm) {
        //   preventDropdownCloseAutoFocus.value = true
        //   return
        // }
        // officerStore.removeOfficer(row)
      }
    }
  ]

  if (props.isEdited) {
    actions.unshift({
      label: t('label.change'),
      icon: 'i-mdi-pencil',
      ui,
      onSelect: async () => {
        emit('init-edit')
        // emit('table-action')
        // const hasActiveForm = await officerStore.checkHasActiveForm('change')
        // if (hasActiveForm) {
        //   preventDropdownCloseAutoFocus.value = true
        //   return
        // }
        // officerStore.initOfficerEdit(row)
      }
    })
  }

  return actions
}
</script>

<template>
  <div class="pl-2 py-4 pr-6 ml-auto flex justify-end">
    <UFieldGroup class="divide-x divide-line-muted">
      <UButton
        variant="ghost"
        class="px-4"
        :label="isRemovedOrEdited ? $t('label.undo') : $t('label.change')"
        :icon="isRemovedOrEdited ? 'i-mdi-undo' : 'i-mdi-pencil'"
        @click="onMainActionClick"
      />
      <!-- @click="async () => {
          const hasActiveForm = await officerStore.checkHasActiveForm('change')
          if (hasActiveForm) {
            return
          }
          if (isRemoved || hasEdits) {
            officerStore.undoOfficer(row)
          }
          else {
            officerStore.initOfficerEdit(row)
          }
          emit('table-action')
        }" -->
      <UDropdownMenu
        v-if="!isRemoved"
        :items="getDropdownActions()"
        :content="{
          align: 'end'
          // required to prevent refocusing on dropdown trigger
          // when the focus has moved to the form when the user has an unfinished task
          // onCloseAutoFocus: (e: Event) => {
          //   if (preventDropdownCloseAutoFocus) {
          //     e.preventDefault()
          //     preventDropdownCloseAutoFocus = false
          //   }
          // }
        }"
      >
        <UButton
          variant="ghost"
          icon="i-mdi-caret-down"
          class="px-4 data-[state=open]:bg-(--ui-primary)/25 group"
          :aria-label="$t('label.moreActions')"
          :ui="{
            leadingIcon: 'shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200'
          }"
          @click="$emit('table-action')"
        />
      </UDropdownMenu>
    </UFieldGroup>
  </div>
</template>
