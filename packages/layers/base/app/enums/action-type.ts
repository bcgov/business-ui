/**
 * Enums for action types, used by:
 * - Name Translations (Edit UI)
 * - People And Roles (Edit UI, Officers, Receivers, Liquidators)
 * - Share Structure (Edit UI)
 */
export enum ActionType {
  ADDED = 'ADDED',
  ADDRESS_CHANGED = 'ADDRESS CHANGED',
  CORRECTED = 'CORRECTED',
  EDITED = 'EDITED',
  EMAIL_CHANGED = 'EMAIL CHANGED',
  NAME_CHANGED = 'NAME CHANGED',
  REMOVED = 'REMOVED',
  REPLACED = 'REPLACED',
  ROLES_CHANGED = 'ROLES_CHANGED'
}
