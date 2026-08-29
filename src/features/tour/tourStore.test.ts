import { describe, expect, it, beforeEach } from 'vitest'
import { useTourStore } from './tourStore'

describe('tourStore', () => {
  beforeEach(() => {
    useTourStore.setState({ seenRoles: {}, pendingStart: false })
  })

  it('marks a role as seen without touching other roles', () => {
    useTourStore.getState().markSeen('Instructor')

    expect(useTourStore.getState().seenRoles).toEqual({ Instructor: true })

    useTourStore.getState().markSeen('Manager')
    expect(useTourStore.getState().seenRoles).toEqual({ Instructor: true, Manager: true })
  })

  it('requestStart/clearPendingStart toggle pendingStart', () => {
    expect(useTourStore.getState().pendingStart).toBe(false)

    useTourStore.getState().requestStart()
    expect(useTourStore.getState().pendingStart).toBe(true)

    useTourStore.getState().clearPendingStart()
    expect(useTourStore.getState().pendingStart).toBe(false)
  })

  it('persists seenRoles to localStorage under the expected key', () => {
    useTourStore.getState().markSeen('SuperAdmin')

    const raw = localStorage.getItem('training-platform-tour-seen')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.state.seenRoles).toEqual({ SuperAdmin: true })
    
    expect(parsed.state.pendingStart).toBeUndefined()
  })
})
