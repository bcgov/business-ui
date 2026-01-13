export interface TaskTodo {
  agmExtension?: unknown
  agmLocationChange?: unknown
  alteration?: unknown
  amalgamationApplication?: unknown
  annualReport?: unknown
  business: Partial<BusinessData>
  changeOfAddress?: unknown
  changeOfDirectors?: unknown
  changeOfOfficers?: unknown
  changeOfRegistration?: unknown
  consentContinuationOut?: unknown
  continuationIn?: unknown
  continuationOut?: unknown
  conversion?: unknown
  correction?: unknown
  courtOrder?: unknown
  displayName?: string // for app tasks only
  dissolution?: unknown
  documents?: Array<unknown>
  header: FilingHeaderResponse
  incorporationApplication?: unknown
  registrarsNotation?: unknown
  registrarsOrder?: unknown
  registration?: unknown
  restoration?: unknown
  specialResolution?: unknown
}

export type FilingTask = { filing: TaskTodo }
export type TodoTask = { todo: TaskTodo }

export interface TaskItem {
  enabled: boolean
  order: number
  task: FilingTask | TodoTask
}

export interface TaskGetResponse {
  tasks: TaskItem[]
}
