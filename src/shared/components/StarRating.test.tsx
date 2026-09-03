import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StarRating } from './StarRating'

describe('StarRating', () => {
  it('renders 5 radio stars by default and calls onChange with the number clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<StarRating value={0} onChange={onChange} label="Rate this" />)

    const stars = screen.getAllByRole('radio')
    expect(stars).toHaveLength(5)

    await user.click(stars[2])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('marks the current value as checked and nothing else', () => {
    render(<StarRating value={3} onChange={vi.fn()} label="Rate this" />)

    const stars = screen.getAllByRole('radio')
    expect(stars[2]).toHaveAttribute('aria-checked', 'true')
    expect(stars[0]).toHaveAttribute('aria-checked', 'false')
    expect(stars[4]).toHaveAttribute('aria-checked', 'false')
  })

  it('respects a custom max', () => {
    render(<StarRating value={0} max={10} onChange={vi.fn()} label="Rate this" />)
    expect(screen.getAllByRole('radio')).toHaveLength(10)
  })

  it('renders read-only (no radios) when onChange is omitted', () => {
    render(<StarRating value={4} label="Average rating" />)
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
    expect(screen.getByRole('img', { name: 'Average rating' })).toBeInTheDocument()
  })
})
