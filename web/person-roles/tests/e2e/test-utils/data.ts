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

export function getRandomRoles() {
  const roles = [
    'Chief Executive Officer',
    'Treasurer',
    'Chief Financial Officer',
    'Secretary',
    'President',
    'Assistant Secretary',
    'Vice President',
    'Other Office(s)',
    'Chair'
  ]

  const randomCount = Math.floor(Math.random() * roles.length) + 1

  return [...roles].sort(() => 0.5 - Math.random()).slice(0, randomCount)
}

export const provinceSubdivisions: Array<{ name: string, code: string }> = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' }
]
