import { faker, fakerEN_CA as fakerCa } from '@faker-js/faker'

export function getFakeAddress() {
  return {
    street: faker.location.streetAddress(),
    streetAdditional: '',
    city: fakerCa.location.city(),
    region: fakerCa.location.state(),
    postalCode: fakerCa.location.zipCode(),
    country: 'CA',
    locationDescription: faker.lorem.words({ min: 3, max: 5 })
  }
}

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
