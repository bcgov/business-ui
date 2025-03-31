export default {
  label: {
    address: 'Address',
    addressResidential: 'Residential Address',
    state: 'State',
    street: 'Street Address',
    streetAdditional: 'Additional Street Address (Optional)',
    streetName: 'Street Name',
    streetNumber: 'Street Number',
    unitNumber: 'Unit Number',
    unitNumberOpt: 'Unit Number (Optional)',
    country: 'Country',
    line1: 'Address Line 1',
    line2: 'Address Line 2 (Optional)',
    city: 'City',
    region: 'Region',
    regionOpt: 'Region (Optional)',
    province: 'Province',
    postalCode: 'Postal Code',
    zipCode: 'Zip Code',
    code: 'Code',
    mailingAddress: 'Mailing Address',
    deliveryAddress: 'Delivery Address',
    sameAsMailAddress: 'Same as Mailing Address',
    deliveryInstructions: 'Delivery Instructions',
    deliveryInstructionsOpt: 'Delivery Instructions (Optional)',
    locationDescription: 'Location Description',
    locationDescriptionOpt: 'Location Description (Optional)'
  },
  validation: {
    required: 'Required',
    address: {
      country: 'Please select a country',
      street: 'Please enter a street address',
      streetName: 'Please enter a street name',
      streetNumber: 'Please enter a street number',
      city: 'Please enter a city',
      region: 'Please select a region',
      postalCode: 'Please enter a postal code',
      requiredBC: {
        region: 'Please enter a BC address',
        country: 'Please enter a BC, Canada address'
      },
      unitNumber: 'Please enter a unit number'
    },
    brand: {
      name: 'Please enter a brand name',
      site: 'Please enter a valid full url for this brand (i.e. https://www.bcregistry.gov.bc.ca)'
    },
    business: {
      bn15: 'Please enter a valid 15-character business number (e.g., 123456789BC0001)',
      legalName: 'Please enter the legal name',
      jurisdiction: 'Please enter the business home jurisdiction',
      cpbc: 'Please enter a valid CPBC number'
    },
    email: 'Please enter a valid email',
    name: {
      first: 'Please enter a first name',
      last: 'Please enter a last name',
      full: 'Please enter a full legal name'
    },
    number: 'Please enter a number',
    phone: {
      code: 'Please select a country code',
      number: 'Please enter a phone number'
    },
    position: 'Please enter the position or job title for the representative',
    step: {
      false: 'Step did not pass validation',
      true: 'Step successfully validated'
    },
    confirm: 'Please confirm to continue',
    tos: {
      scroll: 'You must scroll to the bottom of this page to accept the Terms of Use',
      accept: 'You must accept the Terms of Use to continue'
    }
  },
  // components
  ConnectHeader: {
    title: 'BC Registries and Online Services'
  },
  ConnectBreadcrumb: {
    default: 'BC Registries and Online Services'
  }
}
