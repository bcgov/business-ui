export const tableData: TableBusinessState<PartySchema>[] = [
  {
    new: {
      id: '',
      actions: [ActionType.ADDED],
      name: {
        partyType: PartyType.PERSON,
        firstName: 'First New',
        middleName: 'Middle',
        lastName: 'Last'
      },
      address: {
        deliveryAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        mailingAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        sameAs: true
      },
      roles: [
        {
          roleType: RoleType.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: RoleClass.AGENT
        }
      ]
    }
  },
  {
    new: {
      id: '',
      actions: [ActionType.ADDED],
      name: {
        partyType: PartyType.PERSON,
        firstName: 'First Again',
        middleName: 'Middle',
        lastName: 'Last'
      },
      address: {
        deliveryAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        mailingAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        sameAs: true
      },
      roles: [
        {
          roleType: RoleType.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: RoleClass.AGENT
        }
      ]
    }
  },
  {
    new: {
      id: '123',
      actions: [ActionType.NAME_CHANGED],
      name: {
        partyType: PartyType.PERSON,
        firstName: 'First Edited',
        middleName: 'Middle',
        lastName: 'Last',
        businessName: ''
      },
      address: {
        deliveryAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        mailingAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        sameAs: true
      },
      roles: [
        {
          roleType: RoleType.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: RoleClass.AGENT
        }
      ]
    },
    old: {
      id: '123',
      actions: [],
      name: {
        partyType: PartyType.PERSON,
        firstName: 'First Original',
        middleName: 'Middle',
        lastName: 'Last',
        businessName: ''
      },
      address: {
        deliveryAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        mailingAddress: {
          street: '12345 Main St',
          streetAdditional: '',
          city: 'Victoria',
          region: 'BC',
          postalCode: 'V1X 1X1',
          country: 'CA',
          locationDescription: 'Location Description'
        },
        sameAs: true
      },
      roles: [
        {
          roleType: RoleType.LIQUIDATOR,
          appointmentDate: '2022-10-10',
          cessationDate: null,
          roleClass: RoleClass.AGENT
        }
      ]
    }
  }
]
