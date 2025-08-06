<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn, BadgeProps } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const { t } = useI18n()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UButtonGroup = resolveComponent('UButtonGroup')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const ConnectAddressDisplay = resolveComponent('ConnectAddressDisplay')

const officerStore = useOfficerStore()
const { officerTableState, expanded, editState, initializing } = storeToRefs(useOfficerStore())

const emit = defineEmits<{
  'table-action': []
}>()

const preventDropdownCloseAutoFocus = ref(false)
const addressSchema = getRequiredAddressSchema()

// returns a unique list of badge props to display in the table based on what actions were taken
function getTableBadges(actions: OfficerFormAction[]): BadgeProps[] {
  if (!actions.length) {
    return []
  }

  const unique = [...new Set(actions)]

  const badgeMap: Record<OfficerFormAction, BadgeProps> = {
    name: {
      label: t('badge.nameChanged')
    },
    roles: {
      label: t('badge.rolesChanged')
    },
    address: {
      label: t('badge.addressChanged')
    },
    added: {
      label: t('badge.added')
    },
    removed: {
      label: t('badge.removed'),
      color: 'neutral'
    }
  }

  if (unique.includes('removed')) {
    return [badgeMap['removed']]
  }

  if (unique.includes('added')) {
    return [badgeMap['added']]
  }

  const newBadges = unique.map(i => badgeMap[i])

  return newBadges
}

// used to apply 'removed' styling if the row was removed
function getIsRowRemoved(row: Row<OfficerTableState>) {
  return row.original.state.actions.includes('removed')
}

// concatenates default class to apply to the <td>
// necessary for styling as using the table meta <td> isnt enough
function getCellContainerClass(row: Row<OfficerTableState>, defaultClass: string, actionCell = false): string {
  const removedClass = getIsRowRemoved(row) ? 'opacity-50' : ''

  if (actionCell) {
    return defaultClass
  }
  return `${removedClass} ${defaultClass}`
}

// returns array of dropdown menu actions for the given row
function getRowActions(row: Row<OfficerTableState>) {
  const uiProp = {
    item: 'text-primary',
    itemLeadingIcon: 'text-primary'
  }

  const actions = [
    {
      label: t('label.remove'),
      ui: uiProp,
      onSelect: async () => {
        emit('table-action')
        const hasActiveForm = await officerStore.checkHasActiveForm('change')
        if (hasActiveForm) {
          preventDropdownCloseAutoFocus.value = true
          return
        }
        officerStore.removeOfficer(row)
      },
      icon: 'i-mdi-delete'
    }
  ]

  if (row.original.history.length) {
    actions.unshift({
      label: t('label.change'),
      icon: 'i-mdi-pencil',
      ui: uiProp,
      onSelect: async () => {
        emit('table-action')
        const hasActiveForm = await officerStore.checkHasActiveForm('change')
        if (hasActiveForm) {
          preventDropdownCloseAutoFocus.value = true
          return
        }
        officerStore.initOfficerEdit(row)
      }
    })
  }

  return actions
}

const columns: TableColumn<OfficerTableState>[] = [
  {
    id: 'name',
    header: t('label.name'),
    meta: {
      class: {
        td: '',
        th: 'pl-6'
      }
    },
    cell: ({ row }) => {
      const officer = row.original.state.officer
      const name = `${officer.firstName} ${officer.middleName} ${officer.lastName}`.toUpperCase()
      const preferredName = officer.preferredName
      const badges = getTableBadges(row.original.state.actions)
      const defaultCellClass = 'pl-6 pr-2 py-4 font-bold min-w-48 max-w-48 whitespace-normal flex flex-col gap-2'
      const containerClass = getCellContainerClass(row, defaultCellClass)

      return h('div', { class: containerClass }, [
        h('span', {}, name),
        preferredName
          ? h('div', { class: 'flex flex-col' }, [
            h('i', { class: 'text-sm italic font-normal' }, t('label.preferredNameColon')),
            h('span', { class: 'text-sm' }, preferredName.toUpperCase())
          ])
          : null,
        badges.length
          ? h('ul', { class: 'flex flex-col gap-2' },
              badges.map(badge =>
                h(UBadge, {
                  as: 'li',
                  class: 'w-min',
                  key: badge.label,
                  ...badge
                })
              )
          )
          : null
      ])
    }
  },
  {
    id: 'roles',
    header: t('label.roles'),
    meta: {
      class: {
        td: ''
      }
    },
    cell: ({ row }) => {
      const roleOrder = [
        'CEO',
        'CFO',
        'PRESIDENT',
        'VICE_PRESIDENT',
        'VP',
        'CHAIR',
        'TREASURER',
        'SECRETARY',
        'ASSISTANT_SECRETARY',
        'OTHER'
      ]
      const roleOrderMap = new Map(roleOrder.map((role, index) => [role, index]))
      const isRemoved = row.original.state.actions.includes('removed')
      const allRoles = row.original.state.officer.roles
      const activeRoles = allRoles.filter(r => r.cessationDate === null)
      const displayedRoles = isRemoved ? allRoles : activeRoles
      const sortedRoles = [...displayedRoles].sort((a, b) => {
        const indexA = roleOrderMap.get(a.roleType) ?? Infinity
        const indexB = roleOrderMap.get(b.roleType) ?? Infinity
        return indexA - indexB
      })
      const containerClass = getCellContainerClass(row, 'px-2 py-4 flex flex-col')

      return sortedRoles.length
        ? h('ul', { class: containerClass },
            sortedRoles.map(role =>
              h('li', {}, t(`enum.officerRole.${role.roleType}`))
            )
        )
        : null
    }
  },
  {
    id: 'deliveryAddress',
    header: t('label.deliveryAddress'),
    meta: {
      class: {
        td: ''
      }
    },
    cell: ({ row }) => {
      const address = row.original.state.officer.deliveryAddress
      const containerClass = getCellContainerClass(row, 'px-2 py-4 min-w-48 max-w-48 overflow-clip')

      return h('div', { class: containerClass }, h(ConnectAddressDisplay, { address }))
    }
  },
  {
    id: 'mailingAddress',
    header: t('label.mailingAddress'),
    meta: {
      class: {
        td: ''
      }
    },
    cell: ({ row }) => {
      const sameAs = row.original.state.officer.sameAsDelivery
      const mailingAddress = row.original.state.officer.mailingAddress
      const containerClass = getCellContainerClass(row, 'px-2 py-4 min-w-48 max-w-48 overflow-clip')

      // only display mailing address if fully entered
      const isValidAddress = (addressSchema.safeParse(mailingAddress)).success

      return h('div', { class: containerClass }, h(!isValidAddress
        ? h('span', {}, t('label.notEntered'))
        : sameAs
          ? h('span', {}, t('label.sameAsDeliveryAddress'))
          : h(ConnectAddressDisplay, { address: mailingAddress })
      ))
    }
  },
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, t('label.actions')),
    meta: {
      class: {
        td: '',
        th: 'pr-6'
      }
    },
    cell: ({ row }) => {
      const isRemoved = getIsRowRemoved(row)
      const hasHistory = row.original.history.length
      const containerClass = getCellContainerClass(row, 'pl-2 py-4 pr-6 ml-auto flex justify-end', true)

      return h(
        'div',
        { class: containerClass },
        [
          h(
            UButtonGroup,
            {},
            {
              default: () => [
                h(UButton, {
                  variant: 'ghost',
                  label: (isRemoved || hasHistory) ? t('label.undo') : t('label.change'),
                  icon: (isRemoved || hasHistory) ? 'i-mdi-undo' : 'i-mdi-pencil',
                  class: 'px-4',
                  onClick: async () => {
                    const hasActiveForm = await officerStore.checkHasActiveForm('change')
                    if (hasActiveForm) {
                      return
                    }
                    if (isRemoved || hasHistory) {
                      officerStore.undoOfficer(row)
                    } else {
                      officerStore.initOfficerEdit(row)
                    }
                    emit('table-action')
                  }
                }),
                isRemoved
                  ? null
                  : h(UDropdownMenu, {
                    items: getRowActions(row),
                    content: {
                      align: 'end',
                      // required to prevent refocusing on dropdown trigger
                      // when the focus has moved to the form when the user has an unfinished task
                      onCloseAutoFocus: (e: Event) => {
                        if (preventDropdownCloseAutoFocus.value) {
                          e.preventDefault()
                          preventDropdownCloseAutoFocus.value = false
                        }
                      }
                    }
                  }, {
                    default: () =>
                      h(UButton, {
                        'variant': 'ghost',
                        'icon': 'i-mdi-caret-down',
                        'class': 'px-4 data-[state=open]:bg-(--ui-primary)/25 group',
                        'ui': {
                          leadingIcon: 'shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200'
                        },
                        'aria-label': t('label.moreActions'),
                        'onClick': emit('table-action')
                      })
                  })
              ]
            }
          )
        ]
      )
    }
  }
]

// apply border to top of table row if expanded except for 1st row
const expandedTrClass = computed(() =>
  (typeof expanded.value === 'object' && expanded.value !== null && expanded.value[0] === true)
    ? ''
    : 'data-[expanded=true]:border-t-6 data-[expanded=true]:border-bcGovGray-100'
)
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data="officerTableState"
    :columns
    :loading="initializing"
    sticky
    :ui="{
      root: 'bg-white rounded-sm ring ring-gray-200',
      tbody: 'px-10',
      th: 'bg-bcGovColor-gray2 px-2',
      td: 'px-0 py-0 text-bcGovGray-900 align-top',
      tr: expandedTrClass
    }"
  >
    <template #expanded="{ row }">
      <div :class="(row.index !== officerTableState.length - 1) ? 'border-b-6 border-bcGovGray-100' : ''">
        <FormOfficerChange
          class="max-w-full"
          :default-state="editState"
          :editing="true"
          :title="$t('label.makeChanges')"
          @cancel="officerStore.cancelOfficerEdit"
          @officer-change="officerStore.editOfficer($event, row)"
        />
      </div>
    </template>

    <template #empty>
      <div class="text-bcGovGray-700 text-left text-base px-6">
        {{ $t('text.noOfficers') }}
      </div>
    </template>
  </UTable>

  <!-- <pre>{{ officers }}</pre> -->
</template>
