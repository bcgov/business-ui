import { LoginSource } from '~/enums/login-source'

export interface KCUser {
  firstName: string
  lastName: string
  fullName: string
  userName: string
  email: string
  keycloakGuid: string // sub
  loginSource: LoginSource
  roles: string[]
}
