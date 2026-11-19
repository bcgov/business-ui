// Liquidator roles only - how the liquidator was appointed (business-schemas relationship.json `role.meta`).
// The api requires `appointmentMethod` for a Liquidator role, `courtOrderNumber` when appointed by the court,
// and rejects `meta` on any other role.
export interface LiquidatorRoleMeta {
  appointmentMethod?: LiquidatorAppointmentMethod
  courtOrderNumber?: string
}

export interface Role {
  roleType: RoleType
  appointmentDate?: IsoDatePacific
  cessationDate?: IsoDatePacific | null
  roleClass?: RoleClass
  // Liquidator roles only
  meta?: LiquidatorRoleMeta
}
