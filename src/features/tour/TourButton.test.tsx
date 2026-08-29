import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TourButton } from './TourButton'
import { useTourStore } from './tourStore'

describe('TourButton', () => {
  beforeEach(() => {
    useTourStore.setState({ seenRoles: {}, pendingStart: false })
  })

  it('renders as an accessible button with an id the tour steps can target', () => {
    render(<TourButton />, { wrapper: MemoryRouter })

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('id', 'tour-guide-button')
    expect(button).toHaveAccessibleName()
  })

  it('requests a tour start on click without throwing', async () => {
    const user = userEvent.setup()
    render(<TourButton />, { wrapper: MemoryRouter })

    expect(useTourStore.getState().pendingStart).toBe(false)
    await user.click(screen.getByRole('button'))
    expect(useTourStore.getState().pendingStart).toBe(true)
  })
})
