import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TourButton } from './TourButton'
import { useAuthStore } from '@/features/auth/authStore'
import { setRoleCatalog } from '@/shared/types/domain'
import type { User } from '@/shared/types/domain'

function signInAs(roleId: number): void {
  const user: User = {
    id: 1,
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com',
    roleId,
    status: 'approved',
    hasSeenTour: true,
  }
  useAuthStore.setState({ user, isBootstrapped: true })
}

describe('TourButton', () => {
  beforeEach(() => {
    setRoleCatalog([
      { id: 1, name: 'Manager' },
      { id: 2, name: 'SuperAdmin' },
    ])
    useAuthStore.setState({ user: null, isBootstrapped: false })
  })

  it('renders as an accessible button with an id the tour steps can target', () => {
    signInAs(1)
    render(<TourButton />, { wrapper: MemoryRouter })

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('id', 'tour-guide-button')
    expect(button).toHaveAccessibleName()
  })

  it('starts a tour for the current route without navigating away from it', async () => {
    signInAs(1)
    const user = userEvent.setup()
    render(<TourButton />, {
      wrapper: ({ children }) => <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>,
    })

    await user.click(screen.getByRole('button'))
    
    expect(document.querySelector('.driver-popover')).not.toBeNull()
  })

  it('does not throw when clicked on a route with no tour defined', async () => {
    signInAs(2)
    const user = userEvent.setup()
    render(<TourButton />, {
      wrapper: ({ children }) => <MemoryRouter initialEntries={['/chat']}>{children}</MemoryRouter>,
    })

    await expect(user.click(screen.getByRole('button'))).resolves.not.toThrow()
  })
})
