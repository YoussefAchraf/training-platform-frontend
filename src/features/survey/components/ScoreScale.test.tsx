import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScoreScale } from './ScoreScale'

describe('ScoreScale', () => {
  it('renders one option per value from 0 through max, inclusive', () => {
    render(<ScoreScale max={5} value={undefined} onChange={vi.fn()} minLabel="Poor" maxLabel="Excellent" />)

    const options = screen.getAllByRole('radio')
    expect(options).toHaveLength(6)
    expect(options.map((option) => option.textContent)).toEqual(['0', '1', '2', '3', '4', '5'])
  })

  it('marks the selected value as checked and nothing else', () => {
    render(<ScoreScale max={5} value={0} onChange={vi.fn()} minLabel="Poor" maxLabel="Excellent" />)

    expect(screen.getByRole('radio', { name: '0' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '5' })).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with the numeric value clicked, including 0', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ScoreScale max={10} value={undefined} onChange={onChange} minLabel="Not likely" maxLabel="Very likely" />)

    await user.click(screen.getByRole('radio', { name: '0' }))
    expect(onChange).toHaveBeenCalledWith(0)

    await user.click(screen.getByRole('radio', { name: '10' }))
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('renders the min/max labels', () => {
    render(<ScoreScale max={5} value={undefined} onChange={vi.fn()} minLabel="Poor" maxLabel="Excellent" />)

    expect(screen.getByText('Poor')).toBeInTheDocument()
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })
})
