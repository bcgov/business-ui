export function useFilingViewMode(
  filedByStaff: MaybeRefOrGetter<boolean | undefined>,
  hasDraft: MaybeRefOrGetter<boolean>
) {
  const isStaff = useIsStaff()

  return computed(() =>
    isStaff.value
    && toValue(hasDraft)
    && toValue(filedByStaff) === false
  )
}
