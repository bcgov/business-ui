// import type { AccordionItem } from '#ui/types'

export const manageBusinessDetails = Symbol('manage-business-modal-details') as InjectionKey<Ref<{
  isFirm: boolean
  isCorporation: boolean
  isBenefit: boolean
  isCorpOrBenOrCoop: boolean
  isCoop: boolean
  name: string
  identifier: string
  // authOptions: AccordionItem[]
  // accounts: Array<{ branchName?: string, name: string, uuid: string }>
  // email: string
}>>
