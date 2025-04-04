import type { BadgeProps } from '@nuxt/ui'

export function getOfficerTableBadges(actions: OfficerFormAction[]): BadgeProps[] {
  if (!actions.length) {
    return []
  }

  const t = useNuxtApp().$i18n.t

  const unique = [...new Set(actions)]

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

  if (unique.includes('removed')) {
    return [badgeMap['removed']]
  }

  if (unique.includes('added')) {
    return [badgeMap['added']]
  }

  const newBadges = unique.map(i => badgeMap[i])

  return newBadges
}
