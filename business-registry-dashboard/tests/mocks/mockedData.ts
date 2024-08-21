export const mockAffiliationResponse = {
  entities: [
    {
      draftStatus: 'DRAFT',
      draftType: 'ATMP',
      identifier: 'TcVfviwwf8',
      legalName: 'Numbered Limited Company',
      legalType: 'BC',
      nrNumber: 'NR 3819593',
      nameRequest: {
        actions: [
          {
            URL: null,
            entitiesFilingName: null,
            filingName: 'Incorporation',
            learTemplate: null
          },
          {
            URL: null,
            entitiesFilingName: null,
            filingName: 'Amalgamation',
            learTemplate: null
          }
        ],
        applicants: [
          {
            emailAddress: 'namesteamtesting@gmail.com',
            phoneNumber: '1112223333'
          }
        ],
        consentFlag: null,
        corpNum: null,
        entityTypeCd: 'CR',
        expirationDate: '2024-10-10T06:59:00+00:00',
        id: 2268804,
        legalType: 'BC',
        names: [
          {
            name: 'SOME TEST NAME 321',
            state: 'APPROVED'
          },
          {
            name: 'TESTS ARE US',
            state: 'NE'
          },
          {
            name: 'A TEST A DAY',
            state: 'NE'
          }
        ],
        natureBusinessInfo: 'Testing stuff',
        nrNum: 'NR 3819593',
        requestTypeCd: 'CR',
        requestActionCd: 'AML',
        stateCd: 'APPROVED',
        target: 'lear'
      }
    },
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
      draftStatus: 'DRAFT',
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
}
