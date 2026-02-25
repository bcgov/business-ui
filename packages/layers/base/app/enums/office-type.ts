/* eslint-disable-next-line max-len */
// office types - // https://github.com/bcgov/lear/blob/7787f48bb59b52beb30466ab120ecffa95d0d81b/legal-api/src/legal_api/models/office.py#L51

export enum OfficeType {
  REGISTERED = 'registeredOffice',
  RECORDS = 'recordsOffice',
  CUSTODIAL = 'custodialOffice',
  BUSINESS = 'businessOffice',
  LIQUIDATION = 'liquidationRecordsOffice'
}
