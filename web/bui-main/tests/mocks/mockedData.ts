export const mockedOrgs = {
  orgs: [
    {
      accessType: 'accessType1',
      branchName: 'branchName1',
      created: 'created1',
      createdBy: 'createdBy1',
      hasApiAccess: true,
      id: 1,
      isBusinessAccount: true,
      mailingAddress: [{ city: 'City1', country: 'Country1', postalCode: 'PostalCode1', region: 'Region1', street: 'Street1', streetAdditional: 'StreetAdditional1' }],
      modified: 'modified1',
      name: 'Name1',
      orgStatus: 'orgStatus1',
      orgType: 'OrgType1',
      statusCode: 'statusCode1',
      uuid: 'uuid1'
    },
    {
      accessType: 'accessType2',
      branchName: 'branchName2',
      created: 'created2',
      createdBy: 'createdBy2',
      hasApiAccess: true,
      id: 2,
      isBusinessAccount: true,
      mailingAddress: [{ city: 'City2', country: 'Country2', postalCode: 'PostalCode2', region: 'Region2', street: 'Street2', streetAdditional: 'StreetAdditional2' }],
      modified: 'modified2',
      name: 'Name2',
      orgStatus: 'orgStatus2',
      orgType: 'OrgType2',
      statusCode: 'statusCode2',
      uuid: 'uuid2'
    },
    {
      accessType: 'accessType3',
      branchName: 'branchName3',
      created: 'created3',
      createdBy: 'createdBy3',
      hasApiAccess: true,
      id: 123,
      isBusinessAccount: true,
      mailingAddress: [{ city: 'City3', country: 'Country3', postalCode: 'PostalCode3', region: 'Region3', street: 'Street3', streetAdditional: 'StreetAdditional3' }],
      modified: 'modified3',
      name: 'Name3',
      orgStatus: 'orgStatus3',
      orgType: 'OrgType3',
      statusCode: 'statusCode3',
      uuid: 'uuid3'
    }
  ]
}

export const mockNewAccount = {
  accessType: 'accessType3',
  branchName: 'branchName3',
  created: 'created3',
  createdBy: 'createdBy3',
  hasApiAccess: true,
  id: 3,
  isBusinessAccount: true,
  mailingAddress: [{ city: 'City3', country: 'Country3', postalCode: 'PostalCode3', region: 'Region3', street: 'Street3', streetAdditional: 'StreetAdditional3' }],
  modified: 'modified3',
  name: 'Mock New Account',
  orgStatus: 'orgStatus3',
  orgType: 'OrgType3',
  statusCode: 'statusCode3',
  uuid: 'uuid3'
}

export const mockedArFilingResponse: ArFiling = {
  filing: {
    annualReport: {
      annualGeneralMeetingDate: '2024-04-30',
      annualReportDate: '2024-04-30',
      votedForNoAGM: false,
      unanimousResolutionDate: null
    },
    header: {
      certifiedBy: 'some user',
      certifiedByDisplayName: 'STING',
      colinIds: [123, 456, 789],
      date: '2024-04-30',
      completionDate: null,
      filingDateTime: '2024-04-30',
      filingYear: 2024,
      id: 1,
      name: 'Annual Report',
      paymentStatus: 'PAID',
      paymentAccount: '1',
      paymentToken: 123456,
      status: 'Submitted',
      submitter: null
    },
    documents: []
  }
}

export const mockedBusinessNano: BusinessNano = {
  identifier: '123456789',
  legalName: 'Test Business',
  legalType: 'BC',
  taxId: '986395507BC0001'
}

export const mockedBusinessFull: { business: BusinessFull } = {
  business: {
    taxId: '234653465',
    corpState: 'ACT',
    corpStateClass: 'some class',
    email: 'some email',
    foundingDate: '2020-10-10',
    goodStanding: true,
    hasFutureEffectiveFilings: false,
    homeCompanyName: null,
    homeJurisdictionNumber: null,
    homeRecognitionDate: null,
    identifier: '123456789',
    jurisdiction: 'BC',
    invitationEmail: 'test@example.com',
    lastAgmDate: null,
    lastArDate: '2020-10-10',
    lastLedgerTimestamp: '',
    legalName: 'Test Business Inc',
    legalType: 'BC',
    nextARYear: 2021,
    status: 'some status'
  }
}

export const mockedFilingTask = {
  tasks: [
    {
      task: {
        filing: {
          business: mockedBusinessFull.business,
          annualReport: {
            annualGeneralMeetingDate: null,
            annualReportDate: '2020-10-10',
            votedForNoAGM: false
          },
          header: {
            certifiedBy: null,
            colinIds: [],
            completionDate: null,
            date: '2024-10-10',
            filingDateTime: '2024-10-10',
            filingYear: '2024',
            id: '1',
            name: 'some name',
            paymentAccount: '123',
            paymentStatus: null,
            paymentToken: 123,
            status: 'PAID',
            submitter: null
          }
        }
      }
    }
  ]
}

export const mockedTodoTask = {
  tasks: [{
    task: {
      todo: {
        business: mockedBusinessFull.business,
        header: {
          ARFilingYear: 2021,
          name: 'Some Name',
          status: 'NEW'
        }
      }
    }
  }]
}

const mockTax: Tax = {
  gst: 5,
  pst: 7
}

export const mockFeeInfo: FeeInfo = {
  filingFees: 100,
  filingType: 'Example Filing Type',
  filingTypeCode: 'FTC001',
  futureEffectiveFees: 50,
  priorityFees: 25,
  processingFees: 30,
  serviceFees: 20,
  tax: mockTax,
  total: 260
}

export const mockFilingData: FilingData = {
  filingDescription: 'Example Filing Description',
  filingTypeCode: 'FTC001',
  entityType: 'Example Entity Type',
  waiveFees: false,
  priority: true,
  futureEffective: false
}

export const mockAddress: BusinessAddress = {
  actions: [],
  addressCity: 'Victoria',
  addressCountry: 'Canada',
  addressId: 1,
  addressRegion: 'BC',
  deliveryInstructions: '',
  postalCode: '123 456',
  streetAddress: '123 Test St',
  streetAddressAdditional: ''
}

export const mockBusiness: Business = {
  business: mockedBusinessFull.business,
  offices: {
    recordsOffice: {
      deliveryAddress: mockAddress,
      mailingAddress: mockAddress
    },
    registeredOffice: {
      deliveryAddress: mockAddress,
      mailingAddress: mockAddress
    }
  },
  parties: [
    {
      actions: [],
      appointmentDate: '2020-10-10',
      cessationDate: null,
      deliveryAddress: mockAddress,
      endEventId: '1',
      id: 1,
      mailingAddress: mockAddress,
      officer: {
        firstName: 'First Name',
        lastName: 'Last Name',
        middleInitial: 'T',
        orgName: 'Test Org 3000'
      },
      roles: [
        {
          appointmentDate: '2020-10-10',
          cessationDate: null,
          roleType: 'Director'
        }
      ],
      startEventId: '',
      title: 'Director'
    }
  ]
}
