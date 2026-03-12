import type { BadgeProps } from '@nuxt/ui'

export function getTableBadges<T extends { actions: ActionType[] }>(
  row: TableBusinessRow<T>,
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): BadgeProps[] {
  const t = useNuxtApp().$i18n.t

  const badgeMap: Record<ActionType, BadgeProps> = {
    [ActionType.ADDED]: { label: t('badge.added') },
    [ActionType.REMOVED]: { label: t('badge.removed'), color: 'neutral' as const },
    [ActionType.ADDRESS_CHANGED]: {
      label: badgeLabelOverrides?.[ActionType.ADDRESS_CHANGED] ?? t('badge.addressChanged')
    },
    [ActionType.CORRECTED]: { label: badgeLabelOverrides?.[ActionType.CORRECTED] ?? t('badge.corrected') },
    [ActionType.EMAIL_CHANGED]: { label: badgeLabelOverrides?.[ActionType.EMAIL_CHANGED] ?? t('badge.emailChanged') },
    [ActionType.NAME_CHANGED]: { label: badgeLabelOverrides?.[ActionType.NAME_CHANGED] ?? t('badge.nameChanged') },
    [ActionType.ROLES_CHANGED]: { label: badgeLabelOverrides?.[ActionType.ROLES_CHANGED] ?? t('badge.rolesChanged') },
    [ActionType.CHANGED]: { label: badgeLabelOverrides?.[ActionType.CHANGED] ?? t('badge.changed') }
  }

  // get unique actions
  const rowActions = Array.from(new Set(row.original.new.actions))

  if (rowActions.includes(ActionType.ADDED)) {
    return [badgeMap.ADDED]
  }

  if (rowActions.includes(ActionType.REMOVED)) {
    return [badgeMap.REMOVED]
  }

  return rowActions.map(action => badgeMap[action]).filter(Boolean)
}
