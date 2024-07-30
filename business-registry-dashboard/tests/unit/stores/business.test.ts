import { vi, describe, expect, it, beforeEach } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { useBusinessStore } from '#imports'
import {
  mockedBusinessNano,
  mockedBusinessFull,
  mockedArFilingResponse,
  mockedFilingTask,
  mockedTodoTask,
  mockedOrgs
} from '~/tests/mocks/mockedData'

registerEndpoint('/business/token/1', {
  method: 'GET',
  handler: () => (mockedBusinessNano)
})

registerEndpoint(`/business/${mockedBusinessNano.identifier}`, {
  method: 'GET',
  handler: () => ({ business: { ...mockedBusinessFull } })
})

registerEndpoint('/business/undefined/filings/12/payment', {
  method: 'PUT',
  handler: () => (mockedArFilingResponse)
})

const fakeApiCallBusinessDetails = vi.fn()
const fakeApiCallTasks = vi.fn()
registerEndpoint('/business/undefined/tasks', {
  method: 'GET',
  handler: fakeApiCallTasks
})

registerEndpoint('/business/undefined', {
  method: 'GET',
  handler: fakeApiCallBusinessDetails
})

registerEndpoint('/user/accounts', {
  method: 'GET',
  handler: () => (
    mockedOrgs
  )
})

describe('Business Store Tests', () => {
  let addAlertSpy: any
  beforeEach(() => {
    setActivePinia(createPinia())
    const alertStore = useAlertStore()
    addAlertSpy = vi.spyOn(alertStore, 'addAlert')
  })

  it('inits the store with empty values', () => {
    const busStore = useBusinessStore()

    expect(busStore.loading).toEqual(true)
    expect(busStore.currentBusiness).toEqual({})
    expect(busStore.nextArDate).toEqual('')
    expect(busStore.payStatus).toEqual(null)
  })

  it('can get and assign business nano value', async () => {
    const busStore = useBusinessStore()
    await busStore.getBusinessByNanoId('1')

    expect(busStore.businessNano).toEqual(mockedBusinessNano)
  })

  describe('assignBusinessStoreValues', () => {
    it('assigns values correctly for a business with valid data', () => {
      const busStore = useBusinessStore()

      busStore.assignBusinessStoreValues(mockedBusinessFull.business)

      expect(busStore.currentBusiness).toEqual(mockedBusinessFull.business)
      expect(busStore.nextArDate).toEqual('2021-10-10') // Assuming addOneYear function adds 1 year to foundingDate
    })

    it('throws an error for a business with invalid nextARYear', () => {
      const busStore = useBusinessStore()
      const testBusiness = {
        ...mockedBusinessFull.business,
        nextARYear: -1
      }
      expect(() => busStore.assignBusinessStoreValues(testBusiness)).toThrowError('Test Business Inc is not eligible to file an Annual Report')
      expect(addAlertSpy).toHaveBeenCalledWith({
        severity: 'error',
        category: 'invalid-next-ar-year'
      })
    })

    it('throws an error if last ar date > or = to current date', () => {
      const busStore = useBusinessStore()
      const currentDate = new Date()
      const lastArDate = dateToString(currentDate, 'YYYY-MM-DD')
      const futureDate = addOneYear(lastArDate)
      const testBusiness = {
        ...mockedBusinessFull.business,
        lastArDate
      }
      expect(() => busStore.assignBusinessStoreValues(testBusiness)).toThrowError(`Annual Report not due until ${futureDate}`)
      expect(addAlertSpy).toHaveBeenCalledWith({
        severity: 'error',
        category: 'future-filing'
      })
    })

    it("throws an error if business corp state does not equal 'ACT'", () => {
      const busStore = useBusinessStore()
      const testBusiness = {
        ...mockedBusinessFull.business,
        corpState: 'HDA'
      }
      expect(() => busStore.assignBusinessStoreValues(testBusiness)).toThrowError(testBusiness.legalName + ' is not in an active state.')
      expect(addAlertSpy).toHaveBeenCalledWith({
        severity: 'error',
        category: 'inactive-corp-state'
      })
    })

    it('uses founding date for nextArDate if no lastArDate', () => {
      const busStore = useBusinessStore()
      const testBusiness = {
        ...mockedBusinessFull.business,
        lastArDate: null
      }
      busStore.assignBusinessStoreValues(testBusiness)

      expect(busStore.nextArDate).toEqual('2021-10-10')
    })

    it('throws an error for a business with future effective filings', () => {
      const busStore = useBusinessStore()
      const testBusiness = {
        ...mockedBusinessFull.business,
        hasFutureEffectiveFilings: true
      }
      expect(() => busStore.assignBusinessStoreValues(testBusiness)).toThrowError('Test Business Inc has future effective filings.')
      expect(addAlertSpy).toHaveBeenCalledWith({
        severity: 'error',
        category: 'future-effective-filings'
      })
    })
  })

  it('updates payment status', async () => {
    const busStore = useBusinessStore()

    await busStore.updatePaymentStatusForBusiness('12')

    // assert it assigns the response values
    expect(busStore.payStatus).toEqual('Submitted')
  })

  describe('getBusinessTask', () => {
    it('fetches business task with filing and assigns values', async () => {
      fakeApiCallTasks.mockImplementation(() => mockedFilingTask)
      fakeApiCallBusinessDetails.mockImplementation(() => mockedBusinessFull)
      const busStore = useBusinessStore()
      const arStore = useAnnualReportStore()
      const accountStore = useAccountStore()
      accountStore.userAccounts = mockedOrgs.orgs
      // console.log(mockedFilingTask.tasks[0].task)
      // console.log(accountStore.userAccounts)
      const { task, taskValue } = await busStore.getBusinessTask()

      expect(task).toEqual('filing')
      expect(taskValue).toEqual(mockedFilingTask.tasks[0].task)
      // side effects
      expect(busStore.payStatus).toBe('PAID')
      expect(arStore.arFiling).toEqual({ filing: { header: mockedFilingTask.tasks[0].task.filing.header, annualReport: mockedFilingTask.tasks[0].task.filing.annualReport } })
    })

    it('fetches business task with todo and assigns values', async () => {
      fakeApiCallTasks.mockImplementation(() => mockedTodoTask)
      fakeApiCallBusinessDetails.mockImplementation(() => mockedBusinessFull)
      const busStore = useBusinessStore()
      const arStore = useAnnualReportStore()
      const { task, taskValue } = await busStore.getBusinessTask()

      expect(task).toEqual('todo')
      expect(taskValue).toEqual(mockedTodoTask.tasks[0].task)
      // side effects
      expect(busStore.payStatus).toBe(null)
      expect(arStore.arFiling).toEqual({})
    })

    it('can reset the store values', () => {
      const busStore = useBusinessStore()
      busStore.loading = false
      busStore.currentBusiness = mockedBusinessFull.business
      busStore.businessNano = mockedBusinessNano
      busStore.nextArDate = '2020-10-10'
      busStore.payStatus = 'PAID'

      expect(Object.keys(busStore.currentBusiness).length).toBeGreaterThan(0)
      expect(Object.keys(busStore.businessNano).length).toBeGreaterThan(0)

      // reset store
      busStore.$reset()

      expect(Object.keys(busStore.currentBusiness).length).toBe(0)
      expect(Object.keys(busStore.businessNano).length).toBe(0)
      expect(busStore.loading).toEqual(true)
      expect(busStore.nextArDate).toEqual('')
      expect(busStore.payStatus).toEqual(null)
    })
  })
})
