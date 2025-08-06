export type OfficerTableEditSection = 'name' | 'roles' | 'address'

export type OfficerFormAction = 'name' | 'roles' | 'address' | 'added' | 'removed'

export type OfficerTableEditState = {
  data: Partial<Officer>
  section: OfficerTableEditSection
}

export type OfficersDraftFiling = FilingPutResponse<{
  changeOfOfficers: OfficerTableState[]
}>
