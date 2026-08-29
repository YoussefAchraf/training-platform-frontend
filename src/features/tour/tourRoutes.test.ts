import { describe, expect, it } from 'vitest'
import type { TFunction } from 'i18next'
import { resolveTourSteps } from './tourRoutes'
import { navItems, visibleNavItems } from '@/layouts/components/navItems'
import { paths } from '@/routes/paths'
import type { Role } from '@/shared/types/domain'



const t = ((key: string) => key) as TFunction<'tour'>

const ROLES: Role[] = ['Sales', 'Manager', 'Instructor', 'SuperAdmin']

function ids(steps: ReturnType<typeof resolveTourSteps>): string[] {
  return (steps ?? []).map((s) => (typeof s.element === 'string' ? s.element : ''))
}

describe('resolveTourSteps', () => {
  it('returns null with no role', () => {
    expect(resolveTourSteps(paths.dashboard, undefined, t)).toBeNull()
  })

  it('returns null for a route with no tour defined', () => {
    expect(resolveTourSteps('/chat', 'Manager', t)).toBeNull()
    expect(resolveTourSteps('/reports/42', 'Manager', t)).toBeNull()
  })

  it('resolves every dashboard variant and always ends with the replay step', () => {
    for (const role of ROLES) {
      const steps = resolveTourSteps(paths.dashboard, role, t)
      expect(steps).not.toBeNull()
      expect(steps!.length).toBeGreaterThan(1)
      expect(ids(steps).at(-1)).toBe('#tour-guide-button')
    }
  })

  it('resolves the dynamic session detail route for every role', () => {
    for (const role of ROLES) {
      const steps = resolveTourSteps('/sessions/123', role, t)
      expect(steps).not.toBeNull()
      expect(ids(steps)).toContain('#tour-session-header')
    }
  })

  it('has no tour for Instructor on the Sessions list or Instructors list (not in their nav)', () => {
    expect(resolveTourSteps(paths.sessions, 'Instructor', t)).toBeNull()
    expect(resolveTourSteps(paths.instructors, 'Instructor', t)).toBeNull()
  })

  it('covers every nav-visible route for every role, plus Account', () => {
    for (const role of ROLES) {
      for (const item of visibleNavItems(role)) {
        const steps = resolveTourSteps(item.to, role, t)
        expect(steps, `expected a tour for ${role} on ${item.to}`).not.toBeNull()
      }
      expect(resolveTourSteps(paths.account, role, t)).not.toBeNull()
    }
  })

  it('cross-checks against the full nav item list (regression guard)', () => {
    // Every nav item's target is reachable by at least one role's tour -
    // if a new nav item is added without tour coverage, this fails.
    for (const item of navItems) {
      const coveringRole = ROLES.find((role) => !item.roles || item.roles.includes(role));
      expect(coveringRole, `no role covers nav item ${item.to}`).toBeDefined();
      expect(resolveTourSteps(item.to, coveringRole, t)).not.toBeNull();
    }
  })
})
