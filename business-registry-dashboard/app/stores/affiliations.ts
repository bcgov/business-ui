import { type AlternateNameIF } from '@bcrs-shared-components/interfaces'

export const useAffiliationsStore = defineStore('brd-affiliations-store', () => {
  // store values
  const loading = ref<boolean>(true)
  const affiliations = ref({
    entities: [
      {
        adminFreeze: false,
        goodStanding: true,
        identifier: 'BC0871227',
        inDissolution: false,
        legalName: 'SEVERIN LIMITED COMPANY CORP.',
        legalType: 'BC',
        state: 'HISTORICAL'
      },
      {
        adminFreeze: false,
        goodStanding: true,
        identifier: 'BC0871274',
        inDissolution: false,
        legalName: 'AC BC 2022.DEC.6 18.24 TEST CORP.',
        legalType: 'BC',
        state: 'ACTIVE'
      },
      {
        adminFreeze: false,
        goodStanding: true,
        identifier: 'BC0814603',
        inDissolution: false,
        legalName: 'CLIMATE LAW CORPORATION - IMPORT_TEST',
        legalType: 'BC',
        state: 'HISTORICAL',
        taxId: '123'
      },
      {
        adminFreeze: false,
        goodStanding: true,
        identifier: 'BC0871505',
        inDissolution: false,
        legalName: '0871505 B.C. LTD.',
        legalType: 'BEN',
        state: 'ACTIVE'
      },
      {
        draftType: 'RTMP',
        identifier: 'T1ktKZPcOG',
        legalName: null,
        legalType: 'SP',
        nrNumber: 'NR 7114831',
        nameRequest: {
          actions: [
            {
              URL: null,
              entitiesFilingName: null,
              filingName: 'Registration',
              learTemplate: null
            }
          ],
          applicants: [
            {
              emailAddress: 'mihai.dinu@gov.bc.ca',
              phoneNumber: '7789967591'
            }
          ],
          consentFlag: null,
          corpNum: '',
          entityTypeCd: 'FR',
          expirationDate: '2023-11-29T07:59:00+00:00',
          id: 2267075,
          legalType: 'SP',
          names: [
            {
              name: 'TEST SP OCT 3',
              state: 'APPROVED'
            }
          ],
          natureBusinessInfo: 'Testing',
          nrNum: 'NR 7114831',
          requestTypeCd: 'FR',
          requestActionCd: 'NEW',
          stateCd: 'EXPIRED',
          target: 'lear'
        }
      }
    ]
  })

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
    loading,
    affiliations
  }
},
{ persist: true } // persist store values in session storage
)
