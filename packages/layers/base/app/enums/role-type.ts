// Should map to API role type
// https://github.com/bcgov/lear/blob/main/legal-api/src/legal_api/models/party_role.py#L31
export enum RoleType {
  APPLICANT = 'applicant',
  COMPLETING_PARTY = 'completing_party',
  CUSTODIAN = 'custodian',
  DIRECTOR = 'director',
  INCORPORATOR = 'incorporator',
  LIQUIDATOR = 'liquidator',
  PROPRIETOR = 'proprietor',
  PARTNER = 'partner',
  RECEIVER = 'receiver',
  OFFICER = 'officer',
  CEO = 'ceo',
  CFO = 'cfo',
  PRESIDENT = 'president',
  VICE_PRESIDENT = 'vice_president',
  CHAIR = 'chair',
  TREASURER = 'treasurer',
  SECRETARY = 'secretary',
  ASSISTANT_SECRETARY = 'assistant_secretary',
  OTHER = 'other'
}
