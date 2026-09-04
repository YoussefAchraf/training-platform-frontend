import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Training, TrainingSession } from '@/shared/types/domain'
import { sessionsApi } from '../api/sessionsApi'
import { EditSessionModal } from './EditSessionModal'

vi.mock('../api/sessionsApi', () => ({
  sessionsApi: {
    update: vi.fn(),
  },
}))

const mockedSessionsApi = vi.mocked(sessionsApi)

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}




const session: TrainingSession = {
  id: 5,
  trainingId: 1,
  clientId: 2,
  instructorId: null,
  startDate: new Date(2026, 8, 17, 9, 0).toISOString(), 
  endDate: new Date(2026, 8, 21, 17, 0).toISOString(), 
  sessionStatus: 'scheduled',
  assignmentStatus: 'unassigned',
  includeWeekends: true,
  locationType: 'onsite',
  createdBy: 1,
  createdAt: '2026-09-01T00:00:00.000Z',
}

const multiDayTraining: Training = {
  id: 1,
  name: 'RHCSA',
  providerId: 1,
  providerName: 'Red Hat',
  description: null,
  duration: 5,
  durationUnit: 'days',
  createdBy: 1,
  creatorName: 'Someone',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const singleDayTraining: Training = { ...multiDayTraining, duration: 1 }

describe('EditSessionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when session is null', () => {
    const { container } = renderWithClient(
      <EditSessionModal session={null} training={multiDayTraining} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('pre-fills every field from the session and training being edited', async () => {
    renderWithClient(<EditSessionModal session={session} training={multiDayTraining} onClose={vi.fn()} />)

    expect(await screen.findByDisplayValue('2026-09-17')).toBeInTheDocument() 
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument() 
    expect(screen.getByDisplayValue('17:00')).toBeInTheDocument() 
    expect(screen.getByDisplayValue('2026-09-21')).toBeInTheDocument() 
    expect(screen.getByRole('checkbox', { name: /include weekends/i })).toBeChecked()
  })

  it('does not show the include-weekends checkbox for a single-day training', async () => {
    renderWithClient(<EditSessionModal session={session} training={singleDayTraining} onClose={vi.fn()} />)

    await waitFor(() => expect(screen.getByLabelText(/^start date/i)).toHaveValue('2026-09-17'))
    expect(screen.queryByRole('checkbox', { name: /include weekends/i })).not.toBeInTheDocument()
  })

  it('recomputes the end date when the start date changes, respecting includeWeekends', async () => {
    const user = userEvent.setup()
    renderWithClient(<EditSessionModal session={session} training={multiDayTraining} onClose={vi.fn()} />)

    const startDateInput = await screen.findByLabelText(/^start date/i)
    await waitFor(() => expect(startDateInput).toHaveValue('2026-09-17'))
    await user.clear(startDateInput)
    await user.type(startDateInput, '2026-09-14') 

    await waitFor(() => expect(screen.getByLabelText(/^end date/i)).toHaveValue('2026-09-18'))
  })

  it('submits the updated dates and includeWeekends', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    mockedSessionsApi.update.mockResolvedValue({ ...session })
    renderWithClient(<EditSessionModal session={session} training={multiDayTraining} onClose={onClose} />)

    await screen.findByDisplayValue('2026-09-17')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() =>
      expect(mockedSessionsApi.update).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ includeWeekends: true }),
      ),
    )
  })
})
