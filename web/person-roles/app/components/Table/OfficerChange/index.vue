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

  const t = useNuxtApp().$i18n.t

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

function isRowRemoved(row: Row<OfficerTableState>) {
  return row.original.state.actions.includes('removed')
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
        td: 'pl-6 pr-2 py-4 font-bold min-w-48 max-w-48 whitespace-normal',
        th: 'pl-6'
      }
    },
    cell: ({ row }) => {
      const officer = row.original.state.officer
      const name = `${officer.firstName} ${officer.middleName} ${officer.lastName}`.toUpperCase()
      const preferredName = officer.preferredName
      const badges = getTableBadges(row.original.state.actions)
      const containerClass = isRowRemoved(row) ? 'opacity-50 flex flex-col gap-2' : 'flex flex-col gap-2'

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
        td: 'px-2 py-4'
      }
    },
    cell: ({ row }) => {
      const roles = row.original.state.officer.roles
      const containerClass = isRowRemoved(row) ? 'opacity-50 flex flex-col gap-1' : 'flex flex-col gap-1'

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
        td: 'px-2 py-4 min-w-48 max-w-48'
      }
    },
    cell: ({ row }) => {
      const address = row.original.state.officer.deliveryAddress
      const containerClass = isRowRemoved(row) ? 'opacity-50' : ''

      return h('div', { class: containerClass }, h(ConnectAddressDisplay, { address }))
    }
  },
  {
    id: 'mailingAddress',
    header: t('label.mailingAddress'),
    meta: {
      class: {
        td: 'px-2 py-4 min-w-48 max-w-48'
      }
    },
    cell: ({ row }) => {
      const sameAs = row.original.state.officer.sameAsDelivery
      const mailingAddress = row.original.state.officer.mailingAddress
      const containerClass = isRowRemoved(row) ? 'opacity-50' : ''

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
        td: 'pl-2 py-4 pr-6 ml-auto',
        th: 'pr-6'
      }
    },
    cell: ({ row }) => {
      const isRemoved = isRowRemoved(row)

      return h(
        'div',
        { class: 'flex justify-end' },
        [
          h(
            UButtonGroup,
            {},
            {
              default: () => [
                h(UButton, {
                  variant: 'ghost',
                  label: isRemoved ? 'Undo' : 'Remove',
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
                        'aria-label': 'More Actions'
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
  <div class="max-w-[calc(100dvw-2.25rem)] overflow-clip rounded-sm">
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
          :default-state="editState.data"
          :editing="true"
          :title="formTitle"
          @cancel="officerStore.cancelOfficerEdit"
          @officer-change="officerStore.onOfficerEditSubmit($event, row)"
        />
      </template>
    </UTable>
  </div>

  <!-- <pre>{{ officers }}</pre> -->
</template>
