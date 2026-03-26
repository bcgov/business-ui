export function getColumnMeta<T = unknown>(option: TableColumnMetaOption = 'default'): TableBusinessColumnMeta<T> {
  const config: Record<TableColumnMetaOption, TableBusinessColumnMeta<T>> = {
    default: {
      class: {
        th: '',
        td: 'px-2 py-4'
      }
    },
    first: {
      class: {
        th: 'pl-6',
        td: 'pl-6 pr-2 py-4'
      }
    },
    last: {
      class: {
        th: 'pr-6',
        td: 'pl-2 py-4 pr-6'
      }
    }
  }

  return config[option]
}
