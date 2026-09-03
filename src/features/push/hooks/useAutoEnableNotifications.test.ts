import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAutoEnableNotifications } from './useAutoEnableNotifications'
import { usePushSubscription } from './usePushSubscription'
import type { PushSupportStatus } from './usePushSubscription'
import { useIsIos } from '@/shared/hooks/useMediaQuery'

vi.mock('./usePushSubscription')
vi.mock('@/shared/hooks/useMediaQuery', () => ({
  useIsIos: vi.fn(),
}))

const mockedUsePushSubscription = vi.mocked(usePushSubscription)
const mockedUseIsIos = vi.mocked(useIsIos)
const originalNotification = globalThis.Notification

function mockStatus(status: PushSupportStatus) {
  const subscribe = vi.fn().mockResolvedValue(true)
  mockedUsePushSubscription.mockReturnValue({
    status,
    isBusy: false,
    error: null,
    subscribe,
    unsubscribe: vi.fn().mockResolvedValue(true),
  })
  return subscribe
}

function setPermission(permission: NotificationPermission) {
  Object.defineProperty(globalThis, 'Notification', {
    value: { permission },
    configurable: true,
    writable: true,
  })
}

describe('useAutoEnableNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseIsIos.mockReturnValue(false)
  })

  afterEach(() => {
    if (originalNotification) {
      Object.defineProperty(globalThis, 'Notification', { value: originalNotification, configurable: true })
    } else {
      Reflect.deleteProperty(globalThis, 'Notification')
    }
  })

  it('subscribes automatically when unsubscribed and permission was never asked', () => {
    setPermission('default')
    const subscribe = mockStatus('unsubscribed')

    renderHook(() => useAutoEnableNotifications())

    expect(subscribe).toHaveBeenCalledTimes(1)
  })

  it('does not prompt again if the user already denied permission', () => {
    setPermission('denied')
    const subscribe = mockStatus('unsubscribed')

    renderHook(() => useAutoEnableNotifications())

    expect(subscribe).not.toHaveBeenCalled()
  })

  it('leaves an already-subscribed device alone', () => {
    setPermission('default')
    const subscribe = mockStatus('subscribed')

    renderHook(() => useAutoEnableNotifications())

    expect(subscribe).not.toHaveBeenCalled()
  })

  it('does nothing on a device that does not support push', () => {
    setPermission('default')
    const subscribe = mockStatus('unsupported')

    renderHook(() => useAutoEnableNotifications())

    expect(subscribe).not.toHaveBeenCalled()
  })

  it('never auto-attempts on iOS, even when otherwise eligible - iOS requires a real user gesture', () => {
    setPermission('default')
    mockedUseIsIos.mockReturnValue(true)
    const subscribe = mockStatus('unsubscribed')

    renderHook(() => useAutoEnableNotifications())

    expect(subscribe).not.toHaveBeenCalled()
  })

  it('never attempts more than once, even across re-renders', () => {
    setPermission('default')
    const subscribe = mockStatus('unsubscribed')

    const { rerender } = renderHook(() => useAutoEnableNotifications())
    rerender()
    rerender()

    expect(subscribe).toHaveBeenCalledTimes(1)
  })
})
