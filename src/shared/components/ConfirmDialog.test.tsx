import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('without confirmPhrase, the confirm button is enabled immediately', () => {
    render(
      <ConfirmDialog isOpen onClose={vi.fn()} onConfirm={vi.fn()} title="Deactivate this account?" />,
    )
    expect(screen.getByRole('button', { name: /confirm/i })).toBeEnabled()
  })

  it('with confirmPhrase, the confirm button starts disabled and only enables on an exact match', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Permanently delete this account?"
        confirmLabel="Delete permanently"
        confirmPhrase="delete Jane Doe"
      />,
    )

    const confirmButton = screen.getByRole('button', { name: 'Delete permanently' })
    const input = screen.getByPlaceholderText(/type here/i)
    expect(confirmButton).toBeDisabled()

    await user.type(input, 'delete Jane')
    expect(confirmButton).toBeDisabled()

    await user.type(input, ' Doe')
    expect(confirmButton).toBeEnabled()

    await user.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('a near-miss (wrong case, extra text) does not enable the confirm button', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Permanently delete this account?"
        confirmPhrase="delete Jane Doe"
      />,
    )

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    const input = screen.getByPlaceholderText(/type here/i)

    await user.type(input, 'DELETE Jane Doe')
    expect(confirmButton).toBeDisabled()

    await user.clear(input)
    await user.type(input, 'delete Jane Doe!')
    expect(confirmButton).toBeDisabled()
  })

  it('closing and reopening clears a previously typed match, so it does not silently carry over to a different record', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ConfirmDialog
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Permanently delete this account?"
        confirmPhrase="delete Jane Doe"
      />,
    )

    await user.type(screen.getByPlaceholderText(/type here/i), 'delete Jane Doe')
    expect(screen.getByRole('button', { name: /confirm/i })).toBeEnabled()

    rerender(
      <ConfirmDialog
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Permanently delete this account?"
        confirmPhrase="delete Jane Doe"
      />,
    )
    rerender(
      <ConfirmDialog
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Permanently delete this account?"
        confirmPhrase="delete John Smith"
      />,
    )

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled()
    expect(screen.getByPlaceholderText(/type here/i)).toHaveValue('')
  })
})
