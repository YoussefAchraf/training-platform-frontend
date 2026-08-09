import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Report } from '@/shared/types/domain'
import { reportsApi } from '../api/reportsApi'
import { ReportView } from './ReportView'

vi.mock('../api/reportsApi', () => ({
  reportsApi: {
    get: vi.fn(),
    generate: vi.fn(),
    downloadPdf: vi.fn(),
  },
}))

const mockedReportsApi = vi.mocked(reportsApi)

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const baseReport: Report = {
  id: 1,
  sessionId: 42,
  pdfUrl: null,
  averageScore: '0.00',
  npsAverage: '0.00',
  generatedAt: '2026-01-15T10:00:00.000Z',
}

describe('ReportView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the empty state, no generate button, when no report exists yet and the viewer cannot generate one', async () => {
    mockedReportsApi.get.mockResolvedValue(null)
    renderWithClient(<ReportView sessionId={42} canGenerate={false} />)

    expect(await screen.findByText('Report not generated yet')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /generate report now/i })).not.toBeInTheDocument()
  })

  it('shows a "Generate report now" button when the viewer can generate one', async () => {
    mockedReportsApi.get.mockResolvedValue(null)
    renderWithClient(<ReportView sessionId={42} canGenerate />)

    expect(await screen.findByRole('button', { name: /generate report now/i })).toBeInTheDocument()
  })

  it('renders a genuine 0/5 and 0/10 score, not mistaken for "no report"', async () => {
    mockedReportsApi.get.mockResolvedValue(baseReport)
    renderWithClient(<ReportView sessionId={42} canGenerate={false} />)

    expect(await screen.findByText('Average instructor score')).toBeInTheDocument()
    expect(screen.getByText('NPS average')).toBeInTheDocument()
    
    
    
    expect(screen.getAllByText('0.00')).toHaveLength(2)
    expect(screen.queryByText('Report not generated yet')).not.toBeInTheDocument()
  })

  it('renders real non-zero scores as returned by the API', async () => {
    mockedReportsApi.get.mockResolvedValue({ ...baseReport, averageScore: '4.50', npsAverage: '8.75' })
    renderWithClient(<ReportView sessionId={42} canGenerate={false} />)

    expect(await screen.findByText('4.50')).toBeInTheDocument()
    expect(screen.getByText('8.75')).toBeInTheDocument()
  })

  it('clicking "Generate report now" calls the API and then renders the returned scores', async () => {
    const user = userEvent.setup()
    mockedReportsApi.get.mockResolvedValue(null)
    mockedReportsApi.generate.mockResolvedValue({ ...baseReport, averageScore: '3.00', npsAverage: '6.00' })
    renderWithClient(<ReportView sessionId={42} canGenerate />)

    await user.click(await screen.findByRole('button', { name: /generate report now/i }))

    await waitFor(() => expect(mockedReportsApi.generate).toHaveBeenCalledWith(42))
    expect(await screen.findByText('3.00')).toBeInTheDocument()
    expect(screen.getByText('6.00')).toBeInTheDocument()
  })

  it('shows an error banner with retry when the report fails to load', async () => {
    mockedReportsApi.get.mockRejectedValue(new Error('network down'))
    renderWithClient(<ReportView sessionId={42} canGenerate={false} />)

    expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
