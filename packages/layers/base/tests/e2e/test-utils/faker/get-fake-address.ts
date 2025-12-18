import { faker, fakerEN_CA as fakerCa } from '@faker-js/faker'

export function getFakeAddress() {
  return {
    street: faker.location.streetAddress(),
    streetAdditional: '',
    city: fakerCa.location.city(),
    region: fakerCa.location.state(),
    postalCode: faker // create valid postal code from regex - https://github.com/faker-js/faker/issues/1416
      .helpers
      .fake('{{helpers.fromRegExp("[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]")}}'),
    country: 'CA',
    locationDescription: faker.lorem.words({ min: 3, max: 5 })
  }
}
