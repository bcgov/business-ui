/**
 * Enums for action types, used by:
 * - Name Translations (Edit UI)
 * - People And Roles (Edit UI, Officers, Receivers, Liquidators)
 * - Share Structure (Edit UI)
 */
export enum ActionType {
  ADDED = 'ADDED',
  ADDRESS_CHANGED = 'ADDRESS_CHANGED',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  NAME_CHANGED = 'NAME_CHANGED',
  REMOVED = 'REMOVED',
  ROLES_CHANGED = 'ROLES_CHANGED',
  CHANGED = 'CHANGED'
}
