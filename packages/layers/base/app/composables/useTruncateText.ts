export const useTruncateText = (name: MaybeRefOrGetter<string>, secondHalfLength = 14) => {
  const instanceId = useId()
  const firstHalfRefKey = `first-half-ref-${instanceId}`
  const targetRef = useTemplateRef<HTMLElement>(firstHalfRefKey)
  const { width: spanWidth } = useElementBounding(targetRef)

  const rawName = computed(() => toValue(name))

  const isTruncated = computed(() => {
    if (!targetRef.value) {
      return false
    }
    return targetRef.value.scrollWidth > spanWidth.value
  })

  const firstHalf = computed(() => {
    const val = rawName.value
    if (val.length <= secondHalfLength) {
      return val
    }
    return val.slice(0, val.length - secondHalfLength)
  })

  const secondHalf = computed(() => {
    const val = rawName.value
    if (val.length <= secondHalfLength) {
      return ''
    }
    return val.slice(val.length - secondHalfLength)
  })

  return {
    firstHalfRefKey,
    isTruncated,
    firstHalf,
    secondHalf
  }
}
