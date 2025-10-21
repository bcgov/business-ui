/** Manages business data */
export const useBusinessStore = defineStore('business', () => {
  const { getBusiness } = useBusinessApi()
  const { getStoredFlag } = useConnectLaunchDarkly()

  const business = ref<BusinessDataSlim | BusinessData | undefined>(undefined)

  const businessIdentifier = computed(() => business.value?.identifier)

  const businessName = computed(() => {
    if (!business.value) {
      return undefined
    }
    const isSolePropOrGp = (
      business.value.legalType === CorpTypeCd.SOLE_PROP
      || business.value.legalType === CorpTypeCd.PARTNERSHIP
    )
    if (business.value.alternateNames && isSolePropOrGp) {
      const alternateName = business.value.alternateNames
        .find(alternateName => alternateName.identifier === businessIdentifier.value)
      return alternateName?.name || business.value.legalName
    }
    return business.value.legalName
  })

  async function loadBusiness(identifier: string, slim = false, force = false) {
    const businessCached = businessIdentifier.value && identifier === businessIdentifier.value

    if (!businessCached || force) {
      // @ts-expect-error ts doesn't capture slim true/false properly
      business.value = await getBusiness(identifier, slim)
    }
  }

  /** Whether the entity belongs to one of the passed-in legal types */
  function isLegalType(legalTypes: CorpTypeCd[]): boolean {
    return legalTypes.includes(business.value?.legalType as CorpTypeCd)
  }

  /** Whether the entity is a Sole Proprietorship or General Partnership. */
  function isFirm(): boolean {
    return isLegalType([CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP])
  }

  /** Whether the entity is a base company (BC/BEN/CC/ULC or C/CBEN/CCC/CUL). */
  function isBaseCompany(): boolean {
    return isLegalType([
      CorpTypeCd.BC_COMPANY,
      CorpTypeCd.BENEFIT_COMPANY,
      CorpTypeCd.BC_CCC,
      CorpTypeCd.BC_ULC_COMPANY,
      CorpTypeCd.CONTINUE_IN,
      CorpTypeCd.BEN_CONTINUE_IN,
      CorpTypeCd.CCC_CONTINUE_IN,
      CorpTypeCd.ULC_CONTINUE_IN
    ])
  }

  /**
   * Is True for any business in the FF list, else False.
   * Used to apply special pre-go-live functionality.
   */
  function isDisableNonBenCorps(): boolean {
    return !!business?.value?.identifier && getStoredFlag<string>(
      LDFlag.BusinessesToManageInColin).value?.includes(business.value.identifier)
  }

  return {
    business,
    businessIdentifier,
    businessName,
    loadBusiness,
    isLegalType,
    isFirm,
    isBaseCompany,
    isDisableNonBenCorps
  }
})
