import type { AnnualReport, FilingHeader, FilingDocument } from './ar-filing'

export interface BusinessFull {
  taxId: string
  corpState: string
  corpStateClass: string
  email: string | null
  foundingDate: string
  goodStanding: boolean | null
  identifier: string
  jurisdiction: string
  lastAgmDate: string | null
  lastArDate: string | null
  lastLedgerTimestamp: string
  legalName: string
  legalType: string
  nextARYear: number
  status: string
  invitationEmail: string
  hasFutureEffectiveFilings: boolean
  homeCompanyName: null | string
  homeJurisdictionNumber: null | string
  homeRecognitionDate: any
}

export interface BusinessNano {
  identifier: string
  legalName: string
  legalType: string
  taxId: string | null
}

export interface BusinessFilingTask {
  filing: {
    annualReport: AnnualReport
    business: BusinessFull
    header: FilingHeader
    documents: FilingDocument[]
  }
}

export interface BusinessTodoTask {
  todo: {
    business: BusinessFull
    header: {
      ARFilingYear: number
      name: string
      status: string
    }
  }
}

export interface BusinessTask {
  tasks: Array<{ task: BusinessTodoTask | BusinessFilingTask }>
}

export interface BusinessAddress {
  actions: any[]
  addressCity: string
  addressCountry: string
  addressId: number
  addressRegion: string
  deliveryInstructions: string
  postalCode: string
  streetAddress: string
  streetAddressAdditional: string
}

export interface Office {
  deliveryAddress: BusinessAddress
  mailingAddress: BusinessAddress
}

interface Officer {
  firstName: string
  lastName: string
  middleInitial: string
  orgName: string
}

interface Role {
  appointmentDate: string
  cessationDate: string | null
  roleType: string
}

export interface Party {
  actions: any[]
  appointmentDate: string
  cessationDate: string | null
  deliveryAddress: BusinessAddress
  endEventId: string
  id: number
  mailingAddress: BusinessAddress
  officer: Officer
  roles: Role[]
  startEventId: string
  title: string
}

export interface Business {
  business: BusinessFull
  offices: {
    recordsOffice: Office
    registeredOffice: Office
  }
  parties: Party[]
}
