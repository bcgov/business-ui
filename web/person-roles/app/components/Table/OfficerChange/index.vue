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
  const actions = [
    {
      label: t('label.remove'),
      onSelect: () => officerStore.removeOfficer(row),
      icon: 'i-mdi-delete'
    }
  ]

  if (row.original.history.length) {
    actions.unshift({
      label: t('label.undo'),
      onSelect: () => officerStore.undoOfficer(row),
      icon: 'i-mdi-undo'
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
            h('i', { class: 'text-xs italic' }, t('label.preferredName')),
            h('span', { class: 'text-xs' }, preferredName.toUpperCase())
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
      const roles = row.original.state.officer.roles
      const containerClass = getCellContainerClass(row, 'px-2 py-4 flex flex-col')

      return roles.length
        ? h('ul', { class: containerClass },
            roles.map(role =>
              h('li', {}, t(`enum.officerRole.${role}`))
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
      const containerClass = getCellContainerClass(row, 'px-2 py-4 min-w-48 max-w-48')

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
      const containerClass = getCellContainerClass(row, 'px-2 py-4 min-w-48 max-w-48')

      return h('div', { class: containerClass }, h(sameAs
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
                  label: isRemoved ? t('label.undo') : t('label.change'),
                  icon: isRemoved ? 'i-mdi-undo' : 'i-mdi-pencil',
                  disabled: officerStore.disableActions,
                  class: 'px-4',
                  onClick: () => isRemoved
                    ? officerStore.undoOfficer(row)
                    : officerStore.initOfficerEdit(row)
                }),
                isRemoved
                  ? null
                  : h(UDropdownMenu, {
                    items: getRowActions(row),
                    disabled: officerStore.disableActions,
                    content: { align: 'end' }
                  }, {
                    default: () =>
                      h(UButton, {
                        'variant': 'ghost',
                        'icon': 'i-mdi-caret-down',
                        'class': 'px-4',
                        'aria-label': t('label.moreActions')
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
      td: 'px-0 py-0 text-bcGovGray-700 align-top',
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
