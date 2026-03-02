import { faker } from '@faker-js/faker'

export function getFakePerson() {
  const givenName = faker.person.firstName()
  const familyName = faker.person.lastName()
  return {
    givenName,
    middleInitial: faker.person.middleName(),
    familyName,
    alternateName: `${givenName} ${familyName}`
  }
}
