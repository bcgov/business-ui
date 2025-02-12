import { EntityStateStatus as SharedEntityStateStatus } from '@bcrs-shared-components/enums'

export const EntityStateStatus = {
  ...SharedEntityStateStatus,
  FUTURE_EFFECTIVE: 'Future Effective'
} as const

// Type to combine the shared enum with our local addition
export type EntityStateStatus = SharedEntityStateStatus | typeof EntityStateStatus.FUTURE_EFFECTIVE
