import type { BadgeProps } from '@nuxt/ui'

export function getTableBadges<T extends { actions: ActionType[] }>(row: TableBusinessRow<T>): BadgeProps[] {
  const t = useNuxtApp().$i18n.t

  const badgeMap: Record<ActionType, BadgeProps> = {
    [ActionType.ADDED]: { label: t('badge.added') },
    [ActionType.REMOVED]: { label: t('badge.removed'), color: 'neutral' as const },
    [ActionType.ADDRESS_CHANGED]: { label: t('badge.addressChanged') },
    [ActionType.CORRECTED]: { label: t('badge.corrected') },
    [ActionType.EDITED]: { label: t('badge.edited') },
    [ActionType.EMAIL_CHANGED]: { label: t('badge.emailChanged') },
    [ActionType.NAME_CHANGED]: { label: t('badge.nameChanged') },
    [ActionType.REPLACED]: { label: t('badge.replaced') },
    [ActionType.ROLES_CHANGED]: { label: t('badge.rolesChanged') }
  }

  const rowActions = row.original.new.actions

  if (rowActions.includes(ActionType.ADDED)) {
    return [badgeMap.ADDED]
  }

  if (rowActions.includes(ActionType.REMOVED)) {
    return [badgeMap.REMOVED]
  }

  return rowActions.map(action => badgeMap[action])
}
