export interface OfficeAddress {
  addressCity: string
  addressCountry: string
  addressRegion: string
  addressType: string
  deliveryInstructions: string
  id: number
  postalCode: string
  streetAddress: string
  streetAddressAdditional: string
}

export interface AddressesResponse {
  recordsOffice: {
    deliveryAddress: OfficeAddress
    mailingAddress: OfficeAddress
  }
  registeredOffice: {
    deliveryAddress: OfficeAddress
    mailingAddress: OfficeAddress
  }
}

export interface Office {
  officeType: string
  deliveryAddress: UiAddress
  mailingAddress: UiAddress
}

// const addressResponseExample = {
//   recordsOffice: {
//     deliveryAddress: {
//       addressCity: 'Toronto',
//       addressCountry: 'CA',
//       addressRegion: 'BC',
//       addressType: 'delivery',
//       deliveryInstructions: '',
//       id: 3164117,
//       postalCode: 'M4W 1K3',
//       streetAddress: 'Te-21 Dale Ave',
//       streetAddressAdditional: ''
//     },
//     mailingAddress: {
//       addressCity: 'Toronto',
//       addressCountry: 'CA',
//       addressRegion: 'BC',
//       addressType: 'mailing',
//       deliveryInstructions: '',
//       id: 3164116,
//       postalCode: 'M4W 1K3',
//       streetAddress: 'Te-21 Dale Ave',
//       streetAddressAdditional: ''
//     }
//   },
//   registeredOffice: {
//     deliveryAddress: {
//       addressCity: 'Toronto',
//       addressCountry: 'CA',
//       addressRegion: 'BC',
//       addressType: 'delivery',
//       deliveryInstructions: '',
//       id: 3164119,
//       postalCode: 'M4W 1K3',
//       streetAddress: 'Te-21 Dale Ave',
//       streetAddressAdditional: ''
//     },
//     mailingAddress: {
//       addressCity: 'Toronto',
//       addressCountry: 'CA',
//       addressRegion: 'BC',
//       addressType: 'mailing',
//       deliveryInstructions: '',
//       id: 3164118,
//       postalCode: 'M4W 1K3',
//       streetAddress: 'Te-21 Dale Ave',
//       streetAddressAdditional: ''
//     }
//   }
// }
