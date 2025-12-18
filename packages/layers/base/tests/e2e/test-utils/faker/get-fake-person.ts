import { faker } from '@faker-js/faker'

export function getFakePerson() {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    firstName,
    middleName: faker.person.middleName(),
    lastName,
    preferredName: `${firstName} ${lastName}`
  }
}
