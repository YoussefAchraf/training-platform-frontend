import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sessionsApi } from '../api/sessionsApi'
import { AttendeeImportForm } from './AttendeeImportForm'

vi.mock('../api/sessionsApi', () => ({
  sessionsApi: {
    importAttendees: vi.fn(),
  },
}))

const mockedSessionsApi = vi.mocked(sessionsApi)

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function makeFile(name = 'attendees.xlsx') {
  return new File(['dummy content'], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

describe('AttendeeImportForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads the selected file for the given session and shows the import summary', async () => {
    const user = userEvent.setup()
    mockedSessionsApi.importAttendees.mockResolvedValue({
      importedCount: 3,
      skippedCount: 1,
      attendees: [],
      skipped: [{ row: 4, name: 'Bad Row', email: 'not-an-email', reason: 'Invalid email format' }],
    })
    renderWithClient(<AttendeeImportForm sessionId={42} />)

    const file = makeFile()
    const input = screen.getByLabelText(/attendee spreadsheet file/i);
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: /import attendees/i }))

    await waitFor(() => expect(mockedSessionsApi.importAttendees).toHaveBeenCalledWith(42, file))
    expect(await screen.findByText('3 imported, 1 skipped')).toBeInTheDocument()
    expect(screen.getByText(/Row 4 \(Bad Row\): Invalid email format/)).toBeInTheDocument()
  })

  it('shows a plain count when nothing was skipped', async () => {
    const user = userEvent.setup()
    mockedSessionsApi.importAttendees.mockResolvedValue({
      importedCount: 2,
      skippedCount: 0,
      attendees: [],
      skipped: [],
    })
    renderWithClient(<AttendeeImportForm sessionId={42} />)

    await user.upload(screen.getByLabelText(/attendee spreadsheet file/i), makeFile())
    await user.click(screen.getByRole('button', { name: /import attendees/i }))

    expect(await screen.findByText('2 imported')).toBeInTheDocument()
  })

  it('shows an error banner when the import request fails', async () => {
    const user = userEvent.setup()
    mockedSessionsApi.importAttendees.mockRejectedValue(new Error('Could not read the uploaded file'))
    renderWithClient(<AttendeeImportForm sessionId={42} />)

    await user.upload(screen.getByLabelText(/attendee spreadsheet file/i), makeFile())
    await user.click(screen.getByRole('button', { name: /import attendees/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('disables the submit button until a file is chosen, and shows the picked filename', async () => {
    const user = userEvent.setup()
    renderWithClient(<AttendeeImportForm sessionId={42} />)

    expect(screen.getByRole('button', { name: /import attendees/i })).toBeDisabled()

    await user.upload(screen.getByLabelText(/attendee spreadsheet file/i), makeFile('roster.xlsx'))

    expect(screen.getByText('roster.xlsx')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import attendees/i })).toBeEnabled()
  })

  it('clearing the chosen file re-disables the submit button', async () => {
    const user = userEvent.setup()
    renderWithClient(<AttendeeImportForm sessionId={42} />)

    await user.upload(screen.getByLabelText(/attendee spreadsheet file/i), makeFile('roster.xlsx'))
    expect(screen.getByRole('button', { name: /import attendees/i })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: /remove selected file/i }))

    expect(screen.queryByText('roster.xlsx')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import attendees/i })).toBeDisabled()
  })
})
