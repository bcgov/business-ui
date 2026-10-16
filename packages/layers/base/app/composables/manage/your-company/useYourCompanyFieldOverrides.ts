export function useManageYourCompanyFieldOverrides(
  overrides?: MaybeRefOrGetter<YourCompanyFieldOverrides | undefined>,
  isReadOnlyVariant?: MaybeRefOrGetter<boolean>
) {
  function getIsVisible(
    keys: Array<keyof YourCompanyFieldOverrides> | keyof YourCompanyFieldOverrides
  ): boolean {
    const or = toValue(overrides)
    const items = Array.isArray(keys) ? keys : [keys]
    return items.some(k => or?.[k] !== 'hide')
  }

  function getIsReadOnly(
    keys: Array<keyof YourCompanyFieldOverrides> | keyof YourCompanyFieldOverrides
  ): boolean {
    if (toValue(isReadOnlyVariant)) {
      return true
    }
    const or = toValue(overrides)
    const items = Array.isArray(keys) ? keys : [keys]
    return items.some(k => or?.[k] === 'readonly')
  }

  return {
    getIsVisible,
    getIsReadOnly
  }
}
