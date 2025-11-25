export const base = {
  shareClasses: [
      {
          currency: null,
          hasMaximumShares: false,
          hasParValue: false,
          hasRightsOrRestrictions: false,
          id: 474535,
          maxNumberOfShares: null,
          name: 'Sample Shares',
          parValue: null,
          priority: 1,
          series: []
      }
  ]
}

export const withSeries = {
  shareClasses: [
      {
          currency: null,
          hasMaximumShares: true,
          hasParValue: false,
          hasRightsOrRestrictions: true,
          id: 474535,
          maxNumberOfShares: 1000,
          name: 'Sample Shares',
          parValue: null,
          priority: 1,
          series: [
            {
              currency: null,
              hasMaximumShares: false,
              hasParValue: false,
              hasRightsOrRestrictions: true,
              id: 474535,
              maxNumberOfShares: null,
              name: 'Sample Series Shares',
              parValue: null,
              priority: 1
            }
          ]
      }
  ]
}

export const long = {
  shareClasses: [
    {
      currency: null,
      hasMaximumShares: true,
      hasParValue: false,
      hasRightsOrRestrictions: true,
      id: 474536,
      maxNumberOfShares: 1000,
      name: 'Sample Shares1',
      parValue: null,
      priority: 1,
      series: []
    },
    {
      currency: null,
      hasMaximumShares: true,
      hasParValue: false,
      hasRightsOrRestrictions: true,
      id: 474535,
      maxNumberOfShares: 1000,
      name: 'Sample Shares2',
      parValue: null,
      priority: 2,
      series: [
        {
          currency: null,
          hasMaximumShares: false,
          hasParValue: false,
          hasRightsOrRestrictions: true,
          id: 474535,
          maxNumberOfShares: null,
          name: 'Sample Series Shares',
          parValue: null,
          priority: 1
        }
      ]
    },
    {
      currency: null,
      hasMaximumShares: true,
      hasParValue: false,
      hasRightsOrRestrictions: true,
      id: 474539,
      maxNumberOfShares: 1000,
      name: 'Sample Shares3',
      parValue: null,
      priority: 3,
      series: []
    }
  ]
}

export const CP1002605 = base
export const BC0000001 = withSeries
export const BC0000002 = long
