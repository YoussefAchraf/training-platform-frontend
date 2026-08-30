import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { expandEventDays } from './expandEventDays'

function isoDates(days: Date[]): string[] {
  return days.map((day) => format(day, 'yyyy-MM-dd'))
}

describe('expandEventDays', () => {
  it('returns just the start day for a single-day event', () => {
    const days = expandEventDays({ eventDate: '2026-08-20T09:00:00Z', endDate: '2026-08-20T17:00:00Z', includeWeekends: false })
    expect(isoDates(days)).toEqual(['2026-08-20'])
  })

  it('falls back to the start day alone when endDate is missing', () => {
    const days = expandEventDays({ eventDate: '2026-08-20T09:00:00Z', endDate: null, includeWeekends: false })
    expect(isoDates(days)).toEqual(['2026-08-20'])
  })

  it('includes every day in range, weekends included, when includeWeekends is true', () => {
    
    const days = expandEventDays({ eventDate: '2026-08-20T09:00:00Z', endDate: '2026-08-24T17:00:00Z', includeWeekends: true })
    expect(isoDates(days)).toEqual(['2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24'])
  })

  it('skips Saturday and Sunday when includeWeekends is false, starting mid-week', () => {
    
    const days = expandEventDays({ eventDate: '2026-08-20T09:00:00Z', endDate: '2026-08-24T17:00:00Z', includeWeekends: false })
    expect(isoDates(days)).toEqual(['2026-08-20', '2026-08-21', '2026-08-24'])
  })

  it('still counts the start day even when the start date itself falls on a weekend', () => {
    
    
    const days = expandEventDays({ eventDate: '2026-08-22T09:00:00Z', endDate: '2026-08-25T17:00:00Z', includeWeekends: false })
    expect(isoDates(days)).toEqual(['2026-08-22', '2026-08-24', '2026-08-25'])
  })

  it('returns an empty array for an unparseable start date', () => {
    expect(expandEventDays({ eventDate: 'not-a-date', endDate: null, includeWeekends: false })).toEqual([])
  })
})
