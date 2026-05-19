/**
 * Display-level label overrides for correction filing context.
 *
 * Used by Step 1 (edit) and Step 2 (review) to show "Correct" on edit buttons
 * and "CORRECTED" on badges instead of the default action labels (e.g. "Change", "CHANGED").
*/
export function getCorrectionLabelOverrides(): TableLabelOverrides {
  const { t } = useNuxtApp().$i18n

  return {
    editLabel: t('label.correct'),
    badges: {
      [ActionType.ADDRESS_CHANGED]: t('badge.corrected'),
      [ActionType.NAME_CHANGED]: t('badge.corrected'),
      [ActionType.ROLES_CHANGED]: t('badge.corrected'),
      [ActionType.CHANGED]: t('badge.corrected'),
      [ActionType.CORRECTED]: t('badge.corrected')
    }
  }
}
