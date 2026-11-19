import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { LiquidatorAppointmentMethod } from '#business/app/enums/liquidator-appointment-method'
import { RoleType } from '#business/app/enums/role-type'

// fills the liquidator only sections of FormLiquidatorDetails - a no-op unless the liquidator role
// has appointment details to enter (meta or appointmentDate)
export async function fillOutLiquidatorAppointment(parentLocator: Page | Locator, roles: Role[]) {
  const liquidatorRole = roles.find(role => role.roleType === RoleType.LIQUIDATOR)
  if (!liquidatorRole || (!liquidatorRole.meta && !liquidatorRole.appointmentDate)) {
    return
  }

  const appointmentForm = parentLocator.getByTestId('liquidator-appointment-form')
  await expect(appointmentForm).toBeVisible()

  const { appointmentMethod, courtOrderNumber } = liquidatorRole.meta ?? {}
  if (appointmentMethod) {
    const label = appointmentMethod === LiquidatorAppointmentMethod.COURT ? 'By the Court' : 'By the Company'
    await appointmentForm.getByRole('radio', { name: label }).check()
  }
  if (courtOrderNumber) {
    await appointmentForm.getByTestId('liquidator-court-order-number').locator('input').fill(courtOrderNumber)
  }
  if (liquidatorRole.appointmentDate) {
    const dateInput = parentLocator.getByLabel('Enter or Select Date')
    await dateInput.fill(liquidatorRole.appointmentDate)
    await dateInput.blur()
  }
}
