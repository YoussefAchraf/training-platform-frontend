import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { SessionAttendee } from '@/shared/types/domain'
import { sessionsApi } from '../api/sessionsApi'
import { AttendeeList } from './AttendeeList'

vi.mock('../api/sessionsApi', () => ({
  sessionsApi: {
    listAttendees: vi.fn(),
    markAttendance: vi.fn(),
  },
}))

const mockedSessionsApi = vi.mocked(sessionsApi)

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const attendee: SessionAttendee = {
  id: 1,
  sessionId: 42,
  name: 'Jane Attendee',
  email: 'jane@example.com',
  surveySubmitted: false,
  attendanceStatus: 'pending',
}

describe('AttendeeList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an empty-state note when there are no attendees', async () => {
    mockedSessionsApi.listAttendees.mockResolvedValue([])
    renderWithClient(<AttendeeList sessionId={42} canMarkAttendance={false} />)

    expect(await screen.findByText('No attendees added yet.')).toBeInTheDocument()
  })

  it('renders a read-only attendance badge when canMarkAttendance is false', async () => {
    mockedSessionsApi.listAttendees.mockResolvedValue([{ ...attendee, attendanceStatus: 'present' }])
    renderWithClient(<AttendeeList sessionId={42} canMarkAttendance={false} />)

    expect(await screen.findByText('Jane Attendee')).toBeInTheDocument()
    expect(screen.getByText('Present')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /present/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /absent/i })).not.toBeInTheDocument()
  })

  it('renders Present/Absent buttons when canMarkAttendance is true', async () => {
    mockedSessionsApi.listAttendees.mockResolvedValue([attendee])
    renderWithClient(<AttendeeList sessionId={42} canMarkAttendance />)

    expect(await screen.findByRole('button', { name: /present/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /absent/i })).toBeInTheDocument()
  })

  it('clicking Present calls markAttendance with the right session, attendee, and status', async () => {
    const user = userEvent.setup()
    mockedSessionsApi.listAttendees.mockResolvedValue([attendee])
    mockedSessionsApi.markAttendance.mockResolvedValue({ ...attendee, attendanceStatus: 'present' })
    renderWithClient(<AttendeeList sessionId={42} canMarkAttendance />)

    await user.click(await screen.findByRole('button', { name: /present/i }))

    await waitFor(() => expect(mockedSessionsApi.markAttendance).toHaveBeenCalledWith(42, 1, 'present'))
  })

  it('clicking Absent calls markAttendance with "absent"', async () => {
    const user = userEvent.setup()
    mockedSessionsApi.listAttendees.mockResolvedValue([attendee])
    mockedSessionsApi.markAttendance.mockResolvedValue({ ...attendee, attendanceStatus: 'absent' })
    renderWithClient(<AttendeeList sessionId={42} canMarkAttendance />)

    await user.click(await screen.findByRole('button', { name: /absent/i }))

    await waitFor(() => expect(mockedSessionsApi.markAttendance).toHaveBeenCalledWith(42, 1, 'absent'))
  })
})
