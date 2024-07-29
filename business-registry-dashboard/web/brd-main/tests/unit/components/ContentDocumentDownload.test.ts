import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { mockedArFilingResponse } from '~/tests/mocks/mockedData'
import DocumentDownload from '~/components/content/DocumentDownload.vue'

const pinia = createTestingPinia()

vi.mock('~/stores/annual-report.ts', async (originalImport) => {
  const mod = await originalImport() as any
  return {
    ...mod,
    useAnnualReportStore: () => {
      return mod.useAnnualReportStore(pinia)
    }
  }
})

describe('<DocumentDownload />', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders download buttons for documents', async () => {
    useAnnualReportStore().arFiling = {
      filing: {
        header: mockedArFilingResponse.filing.header,
        annualReport: mockedArFilingResponse.filing.annualReport,
        documents: [
          { name: 'Receipt', url: 'receipt-url' },
          { name: 'Report', url: 'report-url' }
        ]
      }
    }
    await renderSuspended(DocumentDownload)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(2)
    expect(buttons[0].innerHTML).toContain('Download Receipt')
    expect(buttons[1].innerHTML).toContain('Download Report')
  })

  it('only renders whats in the store', async () => {
    useAnnualReportStore().arFiling = {
      filing: {
        header: mockedArFilingResponse.filing.header,
        annualReport: mockedArFilingResponse.filing.annualReport,
        documents: [
          { name: 'Receipt', url: 'receipt-url' }
        ]
      }
    }
    await renderSuspended(DocumentDownload)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(1)
    expect(buttons[0].innerHTML).toContain('Download Receipt')
  })

  it('wont renders any buttons in an empty store', async () => {
    useAnnualReportStore().arFiling = mockedArFilingResponse
    await renderSuspended(DocumentDownload)
    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBe(0)
  })

  it('calls handleDocumentDownload on button click', async () => {
    useAnnualReportStore().arFiling = {
      filing: {
        header: mockedArFilingResponse.filing.header,
        annualReport: mockedArFilingResponse.filing.annualReport,
        documents: [
          { name: 'Receipt', url: 'receipt-url' },
          { name: 'Report', url: 'report-url' }
        ]
      }
    }
    await renderSuspended(DocumentDownload)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(2)

    await fireEvent.click(buttons[0])

    expect(useAnnualReportStore().handleDocumentDownload).toBeCalledTimes(1)
    expect(useAnnualReportStore().handleDocumentDownload).toBeCalledWith({ name: 'Receipt', url: 'receipt-url' })
  })
})
