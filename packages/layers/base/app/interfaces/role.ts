export interface Role {
  roleType: RoleType
  appointmentDate?: IsoDatePacific
  cessationDate?: IsoDatePacific | null
  roleClass?: RoleClass
}
