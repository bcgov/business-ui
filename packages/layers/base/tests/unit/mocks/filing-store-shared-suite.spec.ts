import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineStore } from 'pinia'
import { z } from 'zod'
import { describeCommonFilingStoreBehaviour, getDraftFilingMock } from '#test-mocks/filing-store'

mockNuxtImport('useBusinessService', async () => (await import('#test-mocks/filing-store')).makeBusinessServiceMock)
mockNuxtImport('useConnectFeeStore', async () => (await import('#test-mocks/filing-store')).makeFeeStoreMock)
mockNuxtImport('useIsStaff', async () => (await import('#test-mocks/filing-store')).makeIsStaffMock)
mockNuxtImport('useFilingModals', async () => (await import('#test-mocks/filing-store')).makeFilingModalsMock)
mockNuxtImport('useConnectAuth', async () => (await import('#test-mocks/filing-store')).makeConnectAuthMock)
mockNuxtImport('useConnectAccountStore', async () => (await import('#test-mocks/filing-store')).makeAccountStoreMock)
mockNuxtImport('useFiling', async original => (await import('#test-mocks/filing-store')).makeFilingMock(original))
mockNuxtImport('useBusinessStore', async original =>
  (await import('#test-mocks/filing-store')).makeBusinessStoreMock(original))

const filingType = FilingType.CHANGE_OF_DIRECTORS
const bodyKey = 'changeOfDirectors'
const identifier = 'BC1234567'

const buildDraft = (overrides: { header?: Record<string, unknown>, body?: Record<string, unknown> } = {}) =>
  getDraftFilingMock<FilingDraftState<CODFiling>>({
    filingName: filingType,
    bodyKey,
    body: { relationships: [] },
    ...overrides
  })

/** The corps convention: a confirm authorization checkbox instead of a certify name, no fee re-sync. */
const useAuthorizationStore = defineStore('fixture-authorization-store', () => {
  const {
    applyAuthorizationCertify,
    createFilingPayload,
    getPaymentHeaderApi,
    hydratePaymentState,
    initFiling,
    saveOrSubmitFiling
  } = useFiling()
  const businessStore = useBusinessStore()
  const isStaff = useIsStaff()
  const draftFilingState = shallowRef<FilingDraftState<CODFiling>>({} as FilingDraftState<CODFiling>)

  const getDefaults = () => withPaymentSection(
    z.object({
      authorization: getConfirmAuthorizationSchema().default(() => ({ isAuthorized: false as unknown as true }))
    }),
    isStaff.value
  ).parse({}) as WithPaymentSections<z.ZodObject<{ authorization: z.ZodType<{ isAuthorized: boolean }> }>>

  const { formState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(getDefaults)

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    const { draftFiling } = await initFiling<CODFiling>(businessId, filingType, undefined, draftId)
    if (draftFiling?.filing?.changeOfDirectors) {
      draftFilingState.value = draftFiling as FilingDraftState<CODFiling>
      hydratePaymentState(draftFilingState.value.filing.header, formState, { syncFees: false })
    }
    await snapshotInitialState()
  }

  async function submit(isSubmission: boolean) {
    const filingPayload = createFilingPayload<CODFiling>(
      businessStore.business!,
      filingType,
      { changeOfDirectors: { relationships: [] } },
      {
        authorizationReceived: Boolean(formState.authorization?.isAuthorized),
        ...getPaymentHeaderApi(formState, isStaff.value)
      } as Partial<FilingHeaderSubmission>
    )
    applyAuthorizationCertify(filingPayload.filing.header as Record<string, unknown>, isSubmission)

    return saveOrSubmitFiling<CODFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
  }

  function $reset() {
    resetFormState()
    draftFilingState.value = {} as FilingDraftState<CODFiling>
  }

  return { draftFilingState, formState, initializing, init, submit, $reset }
})

/** The coops convention: always certified by the signed in user, fees re-synced on a staff resume. */
const useCertifiedByStore = defineStore('fixture-certified-by-store', () => {
  const { createFilingPayload, getPaymentHeaderApi, hydratePaymentState, initFiling, saveOrSubmitFiling } = useFiling()
  const businessStore = useBusinessStore()
  const isStaff = useIsStaff()
  const draftFilingState = shallowRef<FilingDraftState<CODFiling>>({} as FilingDraftState<CODFiling>)

  const getDefaults = () => withPaymentSection(z.object({}), isStaff.value)
    .parse({}) as WithPaymentSections<z.ZodObject>

  const { formState, initializing, snapshotInitialState, resetFormState } = useFilingFormState(getDefaults)

  async function init(businessId: string, draftId?: string) {
    initializing.value = true
    const { draftFiling } = await initFiling<CODFiling>(businessId, filingType, undefined, draftId)
    if (draftFiling?.filing?.changeOfDirectors) {
      draftFilingState.value = draftFiling as FilingDraftState<CODFiling>
      hydratePaymentState(draftFilingState.value.filing.header, formState)
    }
    await snapshotInitialState()
  }

  async function submit(isSubmission: boolean) {
    const filingPayload = createFilingPayload<CODFiling>(
      businessStore.business!,
      filingType,
      { changeOfDirectors: { relationships: [] } },
      getPaymentHeaderApi(formState, isStaff.value)
    )

    return saveOrSubmitFiling<CODFiling>(businessStore.businessIdentifier!, filingPayload, {
      isSubmission,
      draftId: draftFilingState.value?.filing?.header?.filingId
    })
  }

  function $reset() {
    resetFormState()
    draftFilingState.value = {} as FilingDraftState<CODFiling>
  }

  return { draftFilingState, formState, initializing, init, submit, $reset }
})

describeCommonFilingStoreBehaviour({
  name: 'authorization fixture store',
  useStore: useAuthorizationStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
    store.formState.authorization!.isAuthorized = true
  },
  payment: 'both',
  certify: 'authorization'
})

describeCommonFilingStoreBehaviour({
  name: 'certified by fixture store',
  useStore: useCertifiedByStore,
  filingType,
  bodyKey,
  buildDraft,
  initStore: async (store, draftId) => {
    await store.init(identifier, draftId)
  },
  payment: 'both',
  certify: 'certified-by',
  expectsFeeResync: true
})
