export type OfficerTableEditSection = 'name' | 'roles' | 'address'

export type OfficerTableBadgeKey = 'name' | 'roles' | 'address' | 'added' | 'removed'

export type OfficerFormAction = 'name' | 'roles' | 'address' | 'added' | 'removed'

export type OfficerTableEditState = {
  data: Partial<Officer>
  section: OfficerTableEditSection
}
