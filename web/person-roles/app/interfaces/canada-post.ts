export interface CanadaPostResponseAddress {
  Id: string
  DomesticId: string
  Language: string
  LanguageAlternatives: string
  Department: string
  Company: string
  SubBuilding: string
  BuildingNumber: string
  BuildingName: string
  SecondaryStreet: string
  Street: string
  Block: string
  Neighbourhood: string
  District: string
  City: string
  Line1: string
  Line2: string
  Line3: string
  Line4: string
  Line5: string
  AdminAreaName: string
  AdminAreaCode: string
  Province: string
  ProvinceName: string
  ProvinceCode: string
  PostalCode: string
  CountryName: string
  CountryIso2: string
  CountryIso3: string
  CountryIsoNumber: number
  SortingNumber1: string
  SortingNumber2: string
  Barcode: string
  POBoxNumber: string
  Label: string
  DataLevel: CanadaPostAddressResponseDataLevel
}

export interface CountryItem {
  value: string
  name: string
}
