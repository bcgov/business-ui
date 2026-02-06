import type { BadgeProps } from '@nuxt/ui'

export function getTableBadges<T extends { actions: ActionType[] }>(row: TableBusinessRow<T>): BadgeProps[] {
  const t = useNuxtApp().$i18n.t

  const badgeMap: Record<ActionType, BadgeProps> = {
    [ActionType.ADDED]: { label: t('badge.added') },
    [ActionType.REMOVED]: { label: t('badge.removed'), color: 'neutral' as const },
    [ActionType.ADDRESS_CHANGED]: { label: t('badge.addressChanged') },
    [ActionType.EMAIL_CHANGED]: { label: t('badge.emailChanged') },
    [ActionType.NAME_CHANGED]: { label: t('badge.nameChanged') },
    [ActionType.ROLES_CHANGED]: { label: t('badge.rolesChanged') },
    [ActionType.CHANGED]: { label: t('badge.changed') }
  }

  // get unique actions
  const rowActions = Array.from(new Set(row.original.new.actions))

  if (rowActions.includes(ActionType.ADDED)) {
    return [badgeMap.ADDED]
  }

  if (rowActions.includes(ActionType.REMOVED)) {
    return [badgeMap.REMOVED]
  }

  return rowActions.map(action => badgeMap[action])
}
