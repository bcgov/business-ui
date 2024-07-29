import { ErrorCategory } from '~/app/enums/error-category'
import { ErrorCode } from '~/app/enums/error-code'

export interface Error {
  category: ErrorCategory,
  detail?: string,
  message: string,
  statusCode: number,
  type?: ErrorCode
}

export interface FormPathError {
  path: string,
  message: string
}
