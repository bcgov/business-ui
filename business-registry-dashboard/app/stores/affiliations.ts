import { type AlternateNameIF } from '@bcrs-shared-components/interfaces'

export const useAffiliationsStore = defineStore('brd-affiliations-store', () => {
  // store values
  const loading = ref<boolean>(true)
  const affiliations = ref([])

  function determineDisplayName (
    legalName: string,
    legalType: CorpTypes,
    identifier: string,
    alternateNames: AlternateNameIF[]
  ): string {
    // if (!LaunchDarklyService.getFlag(LDFlags.AlternateNamesMbr, false)) { // TODO: implement launch darkly
    //   return legalName
    // }
    if ([CorpTypes.SOLE_PROP, CorpTypes.PARTNERSHIP].includes(legalType)) {
      // Intentionally show blank, if the alternate name is not found. This is to avoid showing the legal name.
      return alternateNames?.find(alt => alt.identifier === identifier)?.name ?? legalName
    } else {
      return legalName
    }
  }

  /* Internal function to build the business object. */
  function buildBusinessObject (resp: AffiliationResponse): Business {
    // If a property exists in resp, add it to the business object. Otherwise, it won't appear.
    const addConditionalProperty = (condition, property) => (condition ? property : {})

    // Corp type is either the draft type (checked first) or the legal type.
    const addCorpType = (draftType, legalType) => (draftType || legalType ? { corpType: { code: draftType || legalType } } : {})

    // Boolean properties in the resp. If a property exists, add it to the business object. If not, it will have a default value.
    const addBooleanProperty = (value, defaultValue, propertyName) => ({ [propertyName]: value !== undefined ? value : defaultValue })

    return {
      businessIdentifier: resp.identifier,
      ...addConditionalProperty(resp.businessNumber, { businessNumber: resp.businessNumber }),
      ...addConditionalProperty(resp.businessNumber, { businessNumber: resp.businessNumber }),
      ...addConditionalProperty(resp.legalName, { name: determineDisplayName(resp.legalName, resp.legalType, resp.identifier, resp.alternateNames) }),
      ...addConditionalProperty(resp.contacts, { contacts: resp.contacts }),
      ...addCorpType(resp.draftType, resp.legalType),
      ...addConditionalProperty(resp.legalType, { corpSubType: { code: resp.legalType } }),
      ...addConditionalProperty(resp.folioNumber, { folioNumber: resp.folioNumber }),
      ...addConditionalProperty(resp.lastModified, { lastModified: resp.lastModified }),
      ...addConditionalProperty(resp.modified, { modified: resp.modified }),
      ...addConditionalProperty(resp.modifiedBy, { modifiedBy: resp.modifiedBy }),
      ...addConditionalProperty(resp.nrNumber, { nrNumber: resp.nrNumber }),
      ...addBooleanProperty(resp.adminFreeze, false, 'adminFreeze'),
      ...addBooleanProperty(resp.goodStanding, true, 'goodStanding'),
      ...addBooleanProperty(resp.inDissolution, false, 'inDissolution'),
      ...addConditionalProperty(resp.state, { status: resp.state })
    }
  }

  function $reset () {
    loading.value = true
    affiliations.value = []
  }

  return {
    $reset,
    loading
  }
},
{ persist: true } // persist store values in session storage
)
