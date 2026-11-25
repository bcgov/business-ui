import type { BadgeProps } from '@nuxt/ui'

/**
 * The DELETED "stamp" badge style - shared by the tables and the court order file list.
 *
 * Requirement: the DELETED badge is NOT greyed out with its deleted row - it keeps its own light grey
 * background and dark text, so only apply DELETED_CLASS to the label, never to a cell that contains the badge
 */
export const DELETED_BADGE_CLASS = 'bg-shade-secondary text-neutral-highlighted'

export function getTableBadges<T extends { actions: ActionType[] }>(
  row: TableBusinessRow<T>,
  badgeLabelOverrides?: Partial<Record<ActionType, string>>
): BadgeProps[] {
  const t = useNuxtApp().$i18n.t

  const badgeMap: Record<ActionType, BadgeProps> = {
    [ActionType.ADDED]: { label: t('badge.added') },
    [ActionType.REMOVED]: { label: t('badge.deleted'), class: DELETED_BADGE_CLASS },
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

  // a resumed draft row whose value a staff filing set (useDraftRebase): the user's own action replaces the badge
  // until they undo it (the tag stays on the row)
  if (!rowActions.length) {
    return row.original.modifiedByStaff ? [{ label: t('badge.modifiedByStaff') }] : []
  }

  if (rowActions.includes(ActionType.ADDED)) {
    return [badgeMap.ADDED]
  }

  if (rowActions.includes(ActionType.REMOVED)) {
    return [badgeMap.REMOVED]
  }

  const badges = rowActions.map(action => badgeMap[action]).filter(Boolean)
  // several actions can share a label (e.g. every change is CORRECTED in a correction) - only show each label once
  return badges.filter((badge, i) => badges.findIndex(b => b.label === badge.label) === i)
}
