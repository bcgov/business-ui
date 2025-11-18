import type { ExpandedState } from '@tanstack/vue-table'

// TODO: do we even need this composable? Maybe only for adding, editing, undoing, etc actions for the table
export const useBusinessTable = () => {
  const expanded = useState<ExpandedState | undefined>('party-table-expanded-row', () => undefined)

  return {
    expanded
  }
}
