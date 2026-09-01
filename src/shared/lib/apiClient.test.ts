import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/features/auth/authStore'
import { redirectToLoginAfterRefreshFailure, setIntentionalLogoutInProgress } from './apiClient'

function setPathname(pathname: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, pathname, href: pathname },
  })
}

describe('redirectToLoginAfterRefreshFailure', () => {
  const originalLocation = window.location

  beforeEach(() => {
    setIntentionalLogoutInProgress(false)
    vi.spyOn(useAuthStore.getState(), 'clearSession').mockImplementation(() => {})
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
    vi.restoreAllMocks()
  })

  it('does not redirect away from the reset-password page', () => {
    setPathname(paths.resetPassword)
    redirectToLoginAfterRefreshFailure()
    expect(window.location.href).toBe(paths.resetPassword)
  })

  it('does not redirect away from other guest-accessible pages (login, signup, superadmin login, survey)', () => {
    for (const path of [paths.login, paths.signup, paths.superAdminLogin, '/survey/42']) {
      setPathname(path)
      redirectToLoginAfterRefreshFailure()
      expect(window.location.href).toBe(path)
    }
  })

  it('redirects to /login from a page that requires a session', () => {
    setPathname(paths.dashboard)
    redirectToLoginAfterRefreshFailure()
    expect(window.location.href).toBe(paths.login)
  })

  it('does not redirect when an intentional logout is already navigating away', () => {
    setIntentionalLogoutInProgress(true)
    setPathname(paths.dashboard)
    redirectToLoginAfterRefreshFailure()
    expect(window.location.href).toBe(paths.dashboard)
  })

  it('always clears the session, regardless of the current page', () => {
    setPathname(paths.resetPassword)
    redirectToLoginAfterRefreshFailure()
    expect(useAuthStore.getState().clearSession).toHaveBeenCalled()
  })
})
