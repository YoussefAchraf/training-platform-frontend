import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { announcementsApi } from '../api/announcementsApi'
import { FeatureAnnouncementPopup } from './FeatureAnnouncementPopup'

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../api/announcementsApi', () => ({
  announcementsApi: {
    mine: vi.fn(),
    rate: vi.fn(),
  },
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedApi = vi.mocked(announcementsApi)

function renderWithClient() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <FeatureAnnouncementPopup />
    </QueryClientProvider>,
  )
}

const announcementA = {
  id: 1,
  createdBy: 9,
  title: 'Weekend scheduling',
  description: 'Sessions can now span weekends.',
  targetRoles: ['Sales' as const],
  createdAt: '2026-01-01T00:00:00.000Z',
}

const announcementB = {
  ...announcementA,
  id: 2,
  title: 'PDF reports',
  description: 'Reports export to PDF now.',
}

describe('FeatureAnnouncementPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isDeveloper: false } as ReturnType<typeof useAuth>)
  })

  it('renders nothing for a Developer, and never fetches the pending list', async () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isDeveloper: true } as ReturnType<typeof useAuth>)
    mockedApi.mine.mockResolvedValue([announcementA])

    renderWithClient()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockedApi.mine).not.toHaveBeenCalled()
  })

  it('renders nothing when there is nothing pending', async () => {
    mockedApi.mine.mockResolvedValue([])
    renderWithClient()

    await waitFor(() => expect(mockedApi.mine).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the first item with Next disabled until a star is picked, then walks the queue to Done', async () => {
    const user = userEvent.setup()
    mockedApi.mine.mockResolvedValue([announcementA, announcementB])
    mockedApi.rate.mockResolvedValue({ message: 'Rating recorded.' })

    renderWithClient()

    expect(await screen.findByText('Weekend scheduling')).toBeInTheDocument()
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()

    const stars = screen.getAllByRole('radio')
    await user.click(stars[3])

    await waitFor(() => expect(mockedApi.rate).toHaveBeenCalledWith({ id: 1, stars: 4 }, expect.anything()))
    await waitFor(() => expect(nextButton).toBeEnabled())

    await user.click(nextButton)

    expect(await screen.findByText('PDF reports')).toBeInTheDocument()
    const doneButton = screen.getByRole('button', { name: /done/i })
    expect(doneButton).toBeDisabled()

    const starsForSecond = screen.getAllByRole('radio')
    await user.click(starsForSecond[4])
    await waitFor(() => expect(mockedApi.rate).toHaveBeenCalledWith({ id: 2, stars: 5 }, expect.anything()))
    await waitFor(() => expect(doneButton).toBeEnabled())

    await user.click(doneButton)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
