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
const { officers, expanded, editState } = storeToRefs(useOfficerStore())

const formTitle = computed(() => {
  if (!editState.value.section) {
    return ''
  }

  switch (editState.value.section) {
  case 'address':
    return t('label.changeAddress')
  case 'roles':
    return t('label.changeRoles')
  case 'name':
    return t('label.changeName')
  default:
    return ''
  }
})

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

function getIsRowRemoved(row: Row<OfficerTableState>) {
  return row.original.state.actions.includes('removed')
}

function getCellContainerClass(row: Row<OfficerTableState>, defaultClass: string, actionCell = false): string {
  const expandedClass = (row.getIsExpanded() && row.index !== 0) ? 'border-t-6 border-bcGovGray-100' : ''
  const removedClass = getIsRowRemoved(row) ? 'opacity-50' : ''

  if (actionCell) {
    return `${expandedClass} ${defaultClass}`
  }
  return `${expandedClass} ${removedClass} ${defaultClass}`
}

function getRowActions(row: Row<OfficerTableState>) {
  const actions = [
    {
      label: t('label.changeName'),
      onSelect: () => officerStore.initOfficerEdit(row, 'name')
    },
    {
      label: t('label.changeRoles'),
      onSelect: () => officerStore.initOfficerEdit(row, 'roles')
    },
    {
      label: t('label.changeAddress'),
      onSelect: () => officerStore.initOfficerEdit(row, 'address')
    }
  ]

  if (row.original.history.length) {
    actions.unshift({
      label: t('label.undo'),
      onSelect: () => officerStore.updateOfficers({}, row, 'undo')
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
                  label: isRemoved ? t('label.undo') : t('label.remove'),
                  icon: isRemoved ? 'i-mdi-undo' : 'i-mdi-delete',
                  disabled: officerStore.disableActions,
                  class: 'px-4',
                  onClick: () => isRemoved
                    ? officerStore.updateOfficers({}, row, 'undo')
                    : officerStore.updateOfficers({}, row, 'removed')
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
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data="officers"
    :columns="columns"
    sticky
    :ui="{
      root: 'bg-white rounded-sm ring ring-gray-200',
      tbody: 'px-10',
      th: 'bg-bcGovColor-gray2 px-2',
      td: 'px-0 py-0 text-bcGovGray-700 align-top'
    }"
  >
    <template #expanded="{ row }">
      <FormOfficerChange
        :class="(row.index !== officers.length - 1) ? 'border-b-6 border-bcGovGray-100' : ''"
        :default-state="editState.data"
        :editing="true"
        :title="formTitle"
        @cancel="officerStore.cancelOfficerEdit"
        @officer-change="officerStore.onOfficerEditSubmit($event, row)"
      />
    </template>

    <template #empty>
      <div class="text-bcGovGray-700 text-left text-base px-6">
        {{ $t('text.noOfficers') }}
      </div>
    </template>
  </UTable>

  <!-- <pre>{{ officers }}</pre> -->
</template>
