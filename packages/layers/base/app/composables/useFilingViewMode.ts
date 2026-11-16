export function useFilingViewMode(
  filedByStaff: MaybeRefOrGetter<boolean | undefined>,
  hasDraft: MaybeRefOrGetter<boolean>,
  filingType: MaybeRefOrGetter<FilingType>
) {
  if (filedByStaff === undefined) {
    return computed(() => false)
  }

  const isStaff = useIsStaff()
  const { getFeatureFlag } = useConnectLaunchDarkly()
  const enabledFeatures = getFeatureFlag<string>(LDFlag.EnableNewFeature, '')
  const staffDraftFilingBypassTypes = getFeatureFlag<string[]>(LDFlag.EnableStaffDraftFilingBypass, [])

  return computed(() =>
    isStaff.value
    && toValue(hasDraft)
    && toValue(filedByStaff) === false
    && enabledFeatures.value.split(',').some(feature => feature.trim() === 'draft-rebase-checks')
    && staffDraftFilingBypassTypes.value.includes(toValue(filingType))
  )
}
