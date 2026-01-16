// FUTURE: extend for other dissolution types
export interface DissolutionPayload extends FilingPayloadData {
  dissolutionType: DissolutionType
  delayType?: DelayOption
  dissolutionDate?: IsoDatePacific
}
