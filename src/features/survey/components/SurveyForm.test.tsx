import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SurveyForm } from './SurveyForm'

describe('SurveyForm', () => {
  it('shows validation errors instead of submitting when no scores are picked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /submit feedback/i }))

    expect(await screen.findByText('Rate the instructor')).toBeInTheDocument()
    expect(screen.getByText('Rate the training')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the exact scores picked, including a 0 instructor score', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SurveyForm onSubmit={onSubmit} isSubmitting={false} />)

    
    
    
    await user.click(screen.getAllByRole('radio', { name: '0' })[0])
    await user.click(screen.getByRole('radio', { name: '10' }))

    await user.type(screen.getByPlaceholderText(/anything you'd like to share/i), 'Great session')
    await user.click(screen.getByRole('button', { name: /submit feedback/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      { instructorScore: 0, npsScore: 10, comments: 'Great session' },
      expect.anything(),
    )
  })

  it('disables the submit button while isSubmitting is true', () => {
    render(<SurveyForm onSubmit={vi.fn()} isSubmitting />)
    expect(screen.getByRole('button', { name: /submit feedback/i })).toBeDisabled()
  })
})
