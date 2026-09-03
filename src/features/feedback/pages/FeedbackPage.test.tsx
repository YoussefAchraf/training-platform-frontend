import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { feedbackApi } from '../api/feedbackApi'
import { FeedbackPage } from './FeedbackPage'

vi.mock('../api/feedbackApi', () => ({
  feedbackApi: {
    submit: vi.fn(),
  },
}))

const mockedApi = vi.mocked(feedbackApi)

function renderWithClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <FeedbackPage />
    </QueryClientProvider>,
  )
}

describe('FeedbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors instead of submitting when nothing is filled in', async () => {
    const user = userEvent.setup()
    renderWithClient()

    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    expect(await screen.findByText('Category is required')).toBeInTheDocument()
    expect(screen.getByText('Enter a message')).toBeInTheDocument()
    expect(mockedApi.submit).not.toHaveBeenCalled()
  })

  it('submits the picked category and trimmed message, then resets the form', async () => {
    const user = userEvent.setup()
    mockedApi.submit.mockResolvedValue({
      id: 1,
      submittedBy: 1,
      submitterName: 'Jane Doe',
      submitterEmail: 'jane@example.com',
      submitterRole: 'Sales',
      category: 'enhancement',
      message: 'Add dark mode',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    renderWithClient()

    await user.selectOptions(screen.getByLabelText(/what's this about/i), 'enhancement')
    await user.type(screen.getByLabelText(/message/i), 'Add dark mode')
    await user.click(screen.getByRole('button', { name: /send feedback/i }))

    expect(mockedApi.submit).toHaveBeenCalledWith({ category: 'enhancement', message: 'Add dark mode' }, expect.anything())
    await waitFor(() => expect(screen.getByLabelText(/message/i)).toHaveValue(''))
  })
})
