import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('is dismissible by default: shows a close button, Escape closes, overlay click closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Title">
        <p>Body</p>
      </Modal>,
    )

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('dialog').parentElement!)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('clicking the close button calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="Title">
        <p>Body</p>
      </Modal>,
    )

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('dismissible=false hides the close button and blocks Escape/overlay-click, leaving only footer controls', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal
        isOpen
        onClose={onClose}
        title="New feature"
        dismissible={false}
        footer={<button type="button" onClick={onClose}>Done</button>}
      >
        <p>Rate this feature</p>
      </Modal>,
    )

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()

    await user.click(screen.getByRole('dialog').parentElement!)
    expect(onClose).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Title">
        <p>Body</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
