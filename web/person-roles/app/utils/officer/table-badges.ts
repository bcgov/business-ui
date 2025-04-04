import type { BadgeProps } from '@nuxt/ui'

export function getOfficerTableBadges(initialBadges: BadgeProps[], key: OfficerTableBadgeKey) {
  const t = useNuxtApp().$i18n.t

  const badgeMap: Record<OfficerTableBadgeKey, BadgeProps> = {
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

  // TODO: cleanup strategy
  const newBadge = badgeMap[key]
  const badgeExists = initialBadges.some(b => b.label === newBadge.label)
  const isAdded = initialBadges.some(b => b.label === t('badge.added'))

  if (key === 'removed' || key === 'added') {
    return [newBadge]
  }

  if (badgeExists || isAdded) {
    return initialBadges
  }

  return [...initialBadges, newBadge]
}
