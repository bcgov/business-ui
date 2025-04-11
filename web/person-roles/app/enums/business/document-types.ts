export enum DocumentClass {
  CORP = 'CORP', // Corporations
  COOP = 'COOP', // Cooperatives
  FIRM = 'FIRM', // Firms
  LP_LLP = 'LP_LLP', // Limited Partnership/Limited Liability Partnership
  NR = 'NR', // Name Requests
  SOCIETY = 'SOCIETY', // Societies
  OTHER = 'OTHER', // Other
  MHR = 'MHR', // Manufactured Home Registry
  PPR = 'PPR' // Personal Property Registry
}

export enum DocumentType {
  DIRECTOR_AFFIDAVIT = 'DIRECTOR_AFFIDAVIT',
  CORP_AFFIDAVIT = 'CORP_AFFIDAVIT',
  COOP_MEMORANDUM = 'COOP_MEMORANDUM', // Memorandum
  COOP_RULES = 'COOP_RULES', // Rules
  COU = 'COU', // Court Order
  COOP_MISC = 'COOP_MISC', // Correction Filing
  COFI = 'COFI', // Cooperatives Miscellaneous Documents
  // Corporations
  CORP_MISC = 'CORP_MISC', // Corporations Miscellaneous Documents
  FILE = 'FILE', // COLIN Filing (CORP/FIRM/LP_LLP/COOP)
  DISD = 'DISD', // Dissolution Delays
  FRMA = 'FRMA', // Form 2\'s Address Change for Corps
  AMLG = 'AMLG', // Amalgamations
  CNTI = 'CNTI', // Continuation In
  CNTO = 'CNTO', // Continuation Out
  RSRI = 'RSRI', // Restoration/Reinstatement
  COFF = 'COFF', // CORPS Filed Forms
  COSD = 'COSD', // CORPS Supporting Documentation
  CNTA = 'CNTA', // Continuation in Authorization
  LPRG = 'LPRG', // LP and LLP Registration (CORP/LP_LLP)
  AMLO = 'AMLO', // Amalgamation Out
  ASNU = 'ASNU', // Assumed Name Undertaking
  AMAL = 'AMAL', // Update Due to Amalgamation
  ATTN = 'ATTN', // Attorney (CORP/LP_LLP)
  DISS = 'DISS', // Dissolution Due to Death
  // Firms
  FIRM_MISC = 'FIRM_MISC', // Firms miscellaneous documents
  CNVF = 'CNVF', // Conversion of Firm (FIRM/LP_LLP)
  COPN = 'COPN', // Change of Proprietor\'s Name
  // Limited Partnership/Limited Liability Partnership
  ADDR = 'ADDR', // Address (SOCIETY/CORP/LP_LLP/FIRM)
  ANNR = 'ANNR', // Annual Report (SOCIETY/CORP/LP_LLP)
  CHNM = 'CHNM', // Change Of Name (LP_LLP/OTHER)
  CONT = 'CONT', // Consent (CORP/SOCIETY/FIRM/LP_LLP/MHR/NR/COOP/PPR)
  CORSP = 'CORSP', // Correspondence
  // Name Requests
  NR_MISC = 'NR_MISC', // Name requests miscellaneous documents
  CONS = 'CONS', // NR Consent Letter
  // Society
  SOC_MISC = 'SOC_MISC', // Societies miscellaneous documents
  SOCF = 'SOCF', // Society Filing
  CORC = 'CORC', // Corrections (CORP/SOCIETY)
  CORR = 'CORR', // Correspondence
  DIRS = 'DIRS', // Directors
  // Other
  CERT = 'CERT', // Certificates
  LTR = 'LTR', // Letter Templates
  CLW = 'CLW', // Client Letters
  BYLW = 'BYLW', // Bylaw
  CNST = 'CNST', // Constitution
  SYSR = 'SYSR', // System is the record
  ADMN = 'ADMN', // Administration
  RSLN = 'RSLN', // Resolution Document
  AFDV = 'AFDV', // Affidavit Document
  SUPP = 'SUPP', // Supporting Documents
  MNOR = 'MNOR', // Minister\'s Order
  FINM = 'FINM', // Financial Management
  APCO = 'APCO', // Application to Correct the Registry
  RPTP = 'RPTP', // Report of Payments
  DAT = 'DAT', // DAT or CAT
  BYLT = 'BYLT', // Bylaw Alterations
  CNVS = 'CNVS', // Conversions
  CRTO = 'CRTO', // Court Orders
  MEM = 'MEM', // Membership
  PRE = 'PRE', // Pre Image Documents
  REGO = 'REGO', // Registrar\'s Order
  PLNA = 'PLNA', // Plan of Arrangements
  REGN = 'REGN', // Registrar\'s Notation
  FINC = 'FINC', // Financial
  BCGT = 'BCGT', // BC Gazette
  OTP = 'OTP', // OTP
  // Manufactured Home Registry
  MHR_MISC = 'MHR_MISC', // MHR Miscellaneous Documents
  FNCH = 'FNCH', // MH Supporting Documentation
  MHSP = 'MHSP', // Finance Change Statements/Partial Discharges
  REG_101 = 'REG_101', // Manufactured Home Registration
  REG_102 = 'REG_102', // Decal Replacement
  REG_103 = 'REG_103', // Transport Permit
  ABAN = 'ABAN', // Transfer Due To Abandonment And Sale
  ADDI = 'ADDI', // Addition
  AFFE = 'AFFE', // Transfer To Executor – Estate Under $25,000 With Will
  ATTA = 'ATTA', // Attachment
  BANK = 'BANK', // Transfer Due To Bankruptcy
  CAU = 'CAU', // Notice Of Caution
  CAUC = 'CAUC', // Continued Notice Of Caution
  CAUE = 'CAUE', // Extension To Notice Of Caution
  COMP = 'COMP', // Certificate Of Companies
  COUR = 'COUR', // Court Rescind Order
  DEAT = 'DEAT', // Transfer To Surviving Joint Tenant(s)
  DNCH = 'DNCH', // Declaration Of Name Change
  EXMN = 'EXMN', // Manufactured Exemption
  EXNR = 'EXNR', // Non-Residential Exemption
  EXRE = 'EXRE', // Manufactured Home Re-Registration
  EXRS = 'EXRS', // Residential Exemption
  FORE = 'FORE', // Transfer Due To Foreclosure Order
  FZE = 'FZE', // Registrars Freeze
  GENT = 'GENT', // Transfer Due To General Transmission
  LETA = 'LETA', // Transfer To Administrator – Grant Of Probate With No Will
  MAID = 'MAID', // Maiden Name
  MAIL = 'MAIL', // Mailing Address
  MARR = 'MARR', // Marriage Certificate
  NAMV = 'NAMV', // Certificate Of Vital Stats
  NCAN = 'NCAN', // Cancel Note
  NCON = 'NCON', // Confidential Note
  NPUB = 'NPUB', // Public Note
  NRED = 'NRED', // Notice Of Redemption
  PUBA = 'PUBA', // Public Amendment
  REBU = 'REBU', // Rebuilt
  REGC = 'REGC', // Registrar\'s Correction
  REIV = 'REIV', // Transfer Due To Repossession - Involuntary
  REPV = 'REPV', // Transfer Due To Repossession - Voluntary
  REST = 'REST', // Restraining Order
  STAT = 'STAT', // Registered Location Change
  SZL = 'SZL', // Transfer Due To Seizure Under Land Act
  TAXN = 'TAXN', // Notice Of Tax Sale
  TAXS = 'TAXS', // Transfer Due To Tax Sale
  THAW = 'THAW', // Remove Freeze
  TRAN = 'TRAN', // Transfer Due To Sale Or Gift
  VEST = 'VEST', // Transfer Due To Vesting Order
  WHAL = 'WHAL', // Warehouseman Lien
  WILL = 'WILL', // Transfer To Executor - Grant Of Probate With Will
  // Personal Property Registry
  PPR_MISC = 'PPR_MISC', // PPR miscellaneous documents
  PPRS = 'PPRS', // PPR Search
  PPRC = 'PPRC' // PPR Secure Party Codes
}

export const DOCUMENT_TYPES = {
  coopMemorandum: {
    class: DocumentClass.COOP,
    type: DocumentType.COOP_MEMORANDUM
  },
  coopMiscellaneous: {
    class: DocumentClass.COOP,
    type: DocumentType.COFI
  },
  coopRules: {
    class: DocumentClass.COOP,
    type: DocumentType.COOP_RULES
  },
  coopCorrectionFiling: {
    class: DocumentClass.COOP,
    type: DocumentType.COOP_MISC
  },
  corpsCorrections: {
    class: DocumentClass.COOP,
    type: DocumentType.CORC
  },
  corpAmalgamations: {
    class: DocumentClass.CORP,
    type: DocumentType.AMLG
  },
  corpAmalgamationOut: {
    class: DocumentClass.CORP,
    type: DocumentType.AMLO
  },
  corpAmalgamationUpdate: {
    class: DocumentClass.CORP,
    type: DocumentType.AMAL
  },
  corpAssumedNameUndertaking: {
    class: DocumentClass.CORP,
    type: DocumentType.ASNU
  },
  corpContInAuthorization: {
    class: DocumentClass.CORP,
    type: DocumentType.CNTA
  },
  corpContinuationIn: {
    class: DocumentClass.CORP,
    type: DocumentType.CNTI
  },
  corpContinuationOut: {
    class: DocumentClass.CORP,
    type: DocumentType.CNTO
  },
  corpAffidavit: {
    class: DocumentClass.CORP,
    type: DocumentType.CORP_AFFIDAVIT
  },
  corpAttorney: {
    class: DocumentClass.CORP,
    type: DocumentType.ATTN
  },
  corpColinFiling: {
    class: DocumentClass.CORP,
    type: DocumentType.FILE
  },
  corpLpLlpRegistration: {
    class: DocumentClass.CORP,
    type: DocumentType.LPRG
  },
  corpMiscellaneous: {
    class: DocumentClass.CORP,
    type: DocumentType.CORP_MISC
  },
  corpsAddressChange: {
    class: DocumentClass.CORP,
    type: DocumentType.FRMA
  },
  corpsFiledForms: {
    class: DocumentClass.CORP,
    type: DocumentType.COFF
  },
  corpsSupporting: {
    class: DocumentClass.CORP,
    type: DocumentType.COSD
  },
  courtOrder: {
    class: DocumentClass.CORP,
    type: DocumentType.COU
  },
  corpDirectorAffidavit: {
    class: DocumentClass.CORP,
    type: DocumentType.DIRECTOR_AFFIDAVIT
  },
  corpDissolutionDeath: {
    class: DocumentClass.CORP,
    type: DocumentType.DISS
  },
  corpDissolutionDelays: {
    class: DocumentClass.CORP,
    type: DocumentType.DISD
  },
  lpLlpchangeOfName: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.CHNM
  },
  lpLlpConsent: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.CONT
  },
  lpLlpconversionofFirm: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.CNVF
  },
  lpLlpAddress: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.ADDR
  },
  lpLlpAnnualReport: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.ANNR
  },
  lpLlpAttorney: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.ATTN
  },
  lpLlpColinFiling: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.FILE
  },
  lpLlpCorrespondence: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.CORSP
  },
  lpLlpRegistration: {
    class: DocumentClass.LP_LLP,
    type: DocumentType.LPRG
  },
  firmConversion: {
    class: DocumentClass.FIRM,
    type: DocumentType.CNVF
  },
  firmMiscellaneous: {
    class: DocumentClass.FIRM,
    type: DocumentType.FIRM_MISC
  },
  firmProprietorNameChange: {
    class: DocumentClass.FIRM,
    type: DocumentType.COPN
  },
  nrConsentLetter: {
    class: DocumentClass.NR,
    type: DocumentType.CONS
  },
  nrMiscellaneous: {
    class: DocumentClass.NR,
    type: DocumentType.CONS
  },
  societyAddress: {
    class: DocumentClass.SOCIETY,
    type: DocumentType.ADDR
  },
  societyAnnualReport: {
    class: DocumentClass.SOCIETY,
    type: DocumentType.ANNR
  },
  societyCorrespondence: {
    class: DocumentClass.SOCIETY,
    type: DocumentType.CORR
  },
  societyCorrections: {
    class: DocumentClass.SOCIETY,
    type: DocumentType.CORC
  },
  societyDirectors: {
    class: DocumentClass.SOCIETY,
    type: DocumentType.DIRS
  },
  societyFiling: {
    class: DocumentClass.SOCIETY,
    type: DocumentType.SOCF
  },
  societyMiscellaneous: {
    class: DocumentClass.SOCIETY,
    type: DocumentType.SOC_MISC
  },
  otherAdministration: {
    class: DocumentClass.OTHER,
    type: DocumentType.ADMN
  },
  otherAffidavit: {
    class: DocumentClass.OTHER,
    type: DocumentType.AFDV
  },
  otherApplicationCorrection: {
    class: DocumentClass.OTHER,
    type: DocumentType.APCO
  },
  otherBcGazette: {
    class: DocumentClass.OTHER,
    type: DocumentType.BCGT
  },
  otherBylaw: {
    class: DocumentClass.OTHER,
    type: DocumentType.BYLW
  },
  otherBylawAlterations: {
    class: DocumentClass.OTHER,
    type: DocumentType.BYLT
  },
  otherCertificates: {
    class: DocumentClass.OTHER,
    type: DocumentType.CERT
  },
  otherChangeOfName: {
    class: DocumentClass.OTHER,
    type: DocumentType.CHNM
  },
  otherClientLetters: {
    class: DocumentClass.OTHER,
    type: DocumentType.CLW
  },
  otherConstitution: {
    class: DocumentClass.OTHER,
    type: DocumentType.CNST
  },
  otherConsent: {
    class: DocumentClass.OTHER,
    type: DocumentType.CONT
  },
  otherConversions: {
    class: DocumentClass.OTHER,
    type: DocumentType.CNVS
  },
  otherCourtOrders: {
    class: DocumentClass.OTHER,
    type: DocumentType.CRTO
  },
  otherDatCat: {
    class: DocumentClass.OTHER,
    type: DocumentType.DAT
  },
  otherFinancial: {
    class: DocumentClass.OTHER,
    type: DocumentType.FINC
  },
  otherFinancialManagement: {
    class: DocumentClass.OTHER,
    type: DocumentType.FINM
  },
  otherLetterTemplates: {
    class: DocumentClass.OTHER,
    type: DocumentType.LTR
  },
  otherMembership: {
    class: DocumentClass.OTHER,
    type: DocumentType.MEM
  },
  otherMinistersOrder: {
    class: DocumentClass.OTHER,
    type: DocumentType.MNOR
  },
  otherOtp: {
    class: DocumentClass.OTHER,
    type: DocumentType.OTP
  },
  otherPaymentReport: {
    class: DocumentClass.OTHER,
    type: DocumentType.RPTP
  },
  otherPlanArrangement: {
    class: DocumentClass.OTHER,
    type: DocumentType.PLNA
  },
  otherPreImageDocs: {
    class: DocumentClass.OTHER,
    type: DocumentType.PRE
  },
  otherRegistrarNotation: {
    class: DocumentClass.OTHER,
    type: DocumentType.REGN
  },
  otherRegistrarOrder: {
    class: DocumentClass.OTHER,
    type: DocumentType.REGO
  },
  otherResolution: {
    class: DocumentClass.OTHER,
    type: DocumentType.RSLN
  },
  otherSupporting: {
    class: DocumentClass.OTHER,
    type: DocumentType.SUPP
  },
  otherSystemIsRecord: {
    class: DocumentClass.OTHER,
    type: DocumentType.SYSR
  },
  mhrMiscellaneous: {
    class: DocumentClass.MHR,
    type: DocumentType.MHR_MISC
  },
  mhrSupportingDocs: {
    class: DocumentClass.MHR,
    type: DocumentType.FNCH
  },
  mhrFinanceChange: {
    class: DocumentClass.MHR,
    type: DocumentType.MHSP
  },
  mhrRegistration: {
    class: DocumentClass.MHR,
    type: DocumentType.REG_101
  },
  mhrDecalReplacement: {
    class: DocumentClass.MHR,
    type: DocumentType.REG_102
  },
  mhrTransportPermit: {
    class: DocumentClass.MHR,
    type: DocumentType.REG_103
  },
  mhrAbandonmentTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.ABAN
  },
  mhrAddition: {
    class: DocumentClass.MHR,
    type: DocumentType.ADDI
  },
  mhrExecutorTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.AFFE
  },
  mhrAttachment: {
    class: DocumentClass.MHR,
    type: DocumentType.ATTA
  },
  mhrBankruptcyTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.BANK
  },
  mhrNoticeCaution: {
    class: DocumentClass.MHR,
    type: DocumentType.CAU
  },
  mhrContinuedCaution: {
    class: DocumentClass.MHR,
    type: DocumentType.CAUC
  },
  mhrCautionExtension: {
    class: DocumentClass.MHR,
    type: DocumentType.CAUE
  },
  mhrCertificateCompanies: {
    class: DocumentClass.MHR,
    type: DocumentType.COMP
  },
  mhrCourtRescindOrder: {
    class: DocumentClass.MHR,
    type: DocumentType.COUR
  },
  mhrSurvivingTenantTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.DEAT
  },
  mhrNameChangeDeclaration: {
    class: DocumentClass.MHR,
    type: DocumentType.DNCH
  },
  mhrManufacturedExemption: {
    class: DocumentClass.MHR,
    type: DocumentType.EXMN
  },
  mhrNonResidentialExemption: {
    class: DocumentClass.MHR,
    type: DocumentType.EXNR
  },
  mhrReRegistration: {
    class: DocumentClass.MHR,
    type: DocumentType.EXRE
  },
  mhrResidentialExemption: {
    class: DocumentClass.MHR,
    type: DocumentType.EXRS
  },
  mhrForeclosureTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.FORE
  },
  mhrRegistrarsFreeze: {
    class: DocumentClass.MHR,
    type: DocumentType.FZE
  },
  mhrGeneralTransmission: {
    class: DocumentClass.MHR,
    type: DocumentType.GENT
  },
  mhrAdministratorTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.LETA
  },
  mhrMaidenName: {
    class: DocumentClass.MHR,
    type: DocumentType.MAID
  },
  mhrMailingAddress: {
    class: DocumentClass.MHR,
    type: DocumentType.MAIL
  },
  mhrMarriageCertificate: {
    class: DocumentClass.MHR,
    type: DocumentType.MARR
  },
  mhrVitalStatsCertificate: {
    class: DocumentClass.MHR,
    type: DocumentType.NAMV
  },
  mhrCancelNote: {
    class: DocumentClass.MHR,
    type: DocumentType.NCAN
  },
  mhrConfidentialNote: {
    class: DocumentClass.MHR,
    type: DocumentType.NCON
  },
  mhrPublicNote: {
    class: DocumentClass.MHR,
    type: DocumentType.NPUB
  },
  mhrRedemptionNotice: {
    class: DocumentClass.MHR,
    type: DocumentType.NRED
  },
  mhrPublicAmendment: {
    class: DocumentClass.MHR,
    type: DocumentType.PUBA
  },
  mhrRebuilt: {
    class: DocumentClass.MHR,
    type: DocumentType.REBU
  },
  mhrRegistrarCorrection: {
    class: DocumentClass.MHR,
    type: DocumentType.REGC
  },
  mhrInvoluntaryRepossession: {
    class: DocumentClass.MHR,
    type: DocumentType.REIV
  },
  mhrVoluntaryRepossession: {
    class: DocumentClass.MHR,
    type: DocumentType.REPV
  },
  mhrRestrainingOrder: {
    class: DocumentClass.MHR,
    type: DocumentType.REST
  },
  mhrLocationChange: {
    class: DocumentClass.MHR,
    type: DocumentType.STAT
  },
  mhrSeizureTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.SZL
  },
  mhrTaxSaleNotice: {
    class: DocumentClass.MHR,
    type: DocumentType.TAXN
  },
  mhrTaxSaleTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.TAXS
  },
  mhrFreezeRemoval: {
    class: DocumentClass.MHR,
    type: DocumentType.THAW
  },
  mhrSaleGiftTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.TRAN
  },
  mhrVestingOrderTransfer: {
    class: DocumentClass.MHR,
    type: DocumentType.VEST
  },
  mhrWarehousemanLien: {
    class: DocumentClass.MHR,
    type: DocumentType.WHAL
  },
  mhrExecutorTransferProbate: {
    class: DocumentClass.MHR,
    type: DocumentType.WILL
  },
  pprMiscellaneous: {
    class: DocumentClass.PPR,
    type: DocumentType.PPR_MISC
  },
  pprSearch: {
    class: DocumentClass.PPR,
    type: DocumentType.PPRS
  },
  pprSecurePartyCodes: {
    class: DocumentClass.PPR,
    type: DocumentType.PPRC
  }
}
