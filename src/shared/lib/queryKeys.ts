export const queryKeys = {
  providers: {
    all: ['providers'] as const,
    list: () => [...queryKeys.providers.all, 'list'] as const,
  },
  trainings: {
    all: ['trainings'] as const,
    list: (providerId?: number) => [...queryKeys.trainings.all, 'list', providerId ?? null] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: () => [...queryKeys.clients.all, 'list'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    list: () => [...queryKeys.sessions.all, 'list'] as const,
    attendees: (sessionId: number) => [...queryKeys.sessions.all, 'attendees', sessionId] as const,
  },
  instructors: {
    all: ['instructors'] as const,
    list: () => [...queryKeys.instructors.all, 'list'] as const,
    me: () => [...queryKeys.instructors.all, 'me'] as const,
  },
  calendar: {
    all: ['calendar'] as const,
    global: () => [...queryKeys.calendar.all, 'global'] as const,
    mine: () => [...queryKeys.calendar.all, 'mine'] as const,
  },
  reports: {
    all: ['reports'] as const,
    detail: (sessionId: number) => [...queryKeys.reports.all, 'detail', sessionId] as const,
  },
  auth: {
    all: ['auth'] as const,
    pendingUsers: () => [...queryKeys.auth.all, 'pendingUsers'] as const,
  },
  survey: {
    all: ['survey'] as const,
    form: (sessionId: number) => [...queryKeys.survey.all, 'form', sessionId] as const,
    qrCode: (sessionId: number) => [...queryKeys.survey.all, 'qrCode', sessionId] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    sessions: () => [...queryKeys.admin.all, 'sessions'] as const,
    auditLog: (entityType?: string, entityId?: number, startDate?: string, endDate?: string, roleName?: string) =>
      [
        ...queryKeys.admin.all,
        'auditLog',
        entityType ?? null,
        entityId ?? null,
        startDate ?? null,
        endDate ?? null,
        roleName ?? null,
      ] as const,
  },
} as const;
