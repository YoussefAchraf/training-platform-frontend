import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';
import { useStandaloneDeviceClass } from '@/shared/hooks/useMediaQuery';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers';
import { useAdminSessionsOverview } from '@/features/admin/hooks/useAdminSessionsOverview';
import { useInstructors } from '@/features/instructors/hooks/useInstructors';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { roleNameOf, type CalendarEvent } from '@/shared/types/domain';
import { useViewportFillHeight } from '@/shared/hooks/useViewportFillHeight';
import { PwaCalendarGrid } from '@/pwa/components/PwaCalendarGrid';
import { useDeleteCalendarEvent, useGlobalCalendar, useMyCalendar } from '../hooks/useCalendar';
import { useNewAssignments } from '../hooks/useNewAssignments';
import { sessionIdsByCreator, sessionIdsByInstructor } from '../utils/calendarScope';
import { CalendarAgenda } from '../components/CalendarAgenda';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { EditCalendarEventModal } from '../components/EditCalendarEventModal';
import { NewAssignmentsModal } from '../components/NewAssignmentsModal';
import { CalendarScopePicker } from '../components/CalendarScopePicker';
import type { CalendarScopeRole } from '../components/CalendarScopePicker';
import styles from './CalendarPage.module.css';
import pwaStyles from './CalendarPage.pwa.module.css';

type ViewMode = 'agenda' | 'heatmap';

export function CalendarPage() {
  const { t } = useTranslation('calendar');
  const { user, canManageCatalog, isInstructor, isManager, isSuperAdmin } = useAuth();
  const toast = useToast();
  const isPwaPhone = useStandaloneDeviceClass() === 'phone';
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');

  const globalQuery = useGlobalCalendar({ enabled: canManageCatalog });
  const mineQuery = useMyCalendar({ enabled: isInstructor });
  const query = canManageCatalog ? globalQuery : mineQuery;

  const { newAssignments, markSeen } = useNewAssignments({ enabled: isInstructor });

  
  
  
  const [managerScope, setManagerScope] = useState<'general' | 'mine'>('general');
  const managerSessionsQuery = useSessions({ enabled: isManager });

  
  
  
  const [scopeRole, setScopeRole] = useState<CalendarScopeRole>('general');
  const [scopePersonId, setScopePersonId] = useState<number | null>(null);
  const adminUsersQuery = useAdminUsers({ enabled: isSuperAdmin });
  const instructorsQuery = useInstructors({ enabled: isSuperAdmin });
  const adminSessionsQuery = useAdminSessionsOverview({ enabled: isSuperAdmin });

  const scopePeople = useMemo(() => {
    if (scopeRole === 'Instructor') {
      return (instructorsQuery.data ?? []).map((instructor) => ({
        id: instructor.id,
        name: `${instructor.firstname} ${instructor.lastname}`,
      }));
    }
    if (scopeRole === 'Manager' || scopeRole === 'Sales') {
      return (adminUsersQuery.data ?? [])
        .filter((candidate) => roleNameOf(candidate) === scopeRole)
        .map((candidate) => ({ id: candidate.id, name: `${candidate.firstname} ${candidate.lastname}` }));
    }
    return [];
  }, [scopeRole, instructorsQuery.data, adminUsersQuery.data]);

  // Falls back to the first person in the newly-selected role's list so the
  // picker never sits on an empty selection - scopePersonId itself is only
  // set by an explicit choice (or reset to null on role change, below).
  const effectivePersonId = scopePersonId ?? scopePeople[0]?.id ?? null;

  const handleScopeRoleChange = useCallback((role: CalendarScopeRole) => {
    setScopeRole(role);
    setScopePersonId(null);
  }, []);

  const visibleEvents = useMemo(() => {
    const events = query.data ?? [];
    if (isManager && managerScope === 'mine' && user) {
      const ids = sessionIdsByCreator(managerSessionsQuery.data ?? [], user.id);
      return events.filter((event) => ids.has(event.sessionId));
    }
    if (isSuperAdmin && scopeRole !== 'general' && effectivePersonId != null) {
      const sessions = adminSessionsQuery.data ?? [];
      const ids =
        scopeRole === 'Instructor' ? sessionIdsByInstructor(sessions, effectivePersonId) : sessionIdsByCreator(sessions, effectivePersonId);
      return events.filter((event) => ids.has(event.sessionId));
    }
    return events;
  }, [
    query.data,
    isManager,
    managerScope,
    user,
    managerSessionsQuery.data,
    isSuperAdmin,
    scopeRole,
    effectivePersonId,
    adminSessionsQuery.data,
  ]);

  
  
  
  
  const { ref: bodyRef, height: bodyHeight } = useViewportFillHeight<HTMLDivElement>(24);

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CalendarEvent | null>(null);
  const deleteDialog = useDisclosure();
  const deleteEvent = useDeleteCalendarEvent();

  const handleCloseEdit = useCallback(() => setEditingEvent(null), []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingEvent) return;
    deleteEvent.mutate(deletingEvent.id, {
      onSuccess: () => {
        toast.success(t('CalendarPage.eventDeleted'));
        deleteDialog.close();
        setDeletingEvent(null);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }, [deletingEvent, deleteEvent, toast, deleteDialog, t]);

  const renderActions = useCallback(
    (event: CalendarEvent) => (
      <>
        <Button variant="ghost" size="sm" aria-label={t('CalendarPage.editEvent', { title: event.title })} onClick={() => setEditingEvent(event)}>
          <Pencil size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('CalendarPage.deleteEvent', { title: event.title })}
          onClick={() => {
            setDeletingEvent(event);
            deleteDialog.open();
          }}
        >
          <Trash2 size={15} />
        </Button>
      </>
    ),
    [deleteDialog, t],
  );

  // PWA phone: calendar-only, no heatmap/agenda toggle and no inline detail
  // panel - tapping a day drills into PwaSessionsDayPage instead. The
  // Manager mine/general toggle and SuperAdmin role+person picker stay
  // (they're genuine scope controls, not desktop-only chrome), so
  // visibleEvents - already correctly scoped above - just feeds the grid.
  // Editing/deleting a calendar event stays a desktop-only action; every
  // other shell (web, PWA tablet/desktop) keeps the full experience below.
  if (isPwaPhone) {
    return (
      <div className={pwaStyles.page}>
        <header className={pwaStyles.header}>
          <span className={pwaStyles.title}>{t('CalendarPage.title')}</span>
        </header>

        {isManager && (
          <div className={styles.viewToggle} id="tour-calendar-manager-scope">
            <button
              type="button"
              className={managerScope === 'mine' ? styles.viewToggleActive : styles.viewToggleButton}
              onClick={() => setManagerScope('mine')}
              aria-pressed={managerScope === 'mine'}
            >
              {t('CalendarPage.myCalendar')}
            </button>
            <button
              type="button"
              className={managerScope === 'general' ? styles.viewToggleActive : styles.viewToggleButton}
              onClick={() => setManagerScope('general')}
              aria-pressed={managerScope === 'general'}
            >
              {t('CalendarPage.generalCalendar')}
            </button>
          </div>
        )}

        {isSuperAdmin && (
          <CalendarScopePicker
            role={scopeRole}
            onRoleChange={handleScopeRoleChange}
            personId={effectivePersonId}
            onPersonChange={setScopePersonId}
            people={scopePeople}
          />
        )}

        {query.isError ? (
          <ErrorBanner error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <PwaCalendarGrid events={visibleEvents} isLoading={query.isPending} />
        )}

        <NewAssignmentsModal sessions={newAssignments} onClose={() => markSeen(newAssignments.map((session) => session.id))} />
      </div>
    );
  }

  return (
    <div>
      <div id="tour-calendar-header">
        <PageHeader
          title={t('CalendarPage.title')}
          description={
            canManageCatalog
              ? t('CalendarPage.descriptionManage')
              : t('CalendarPage.descriptionOther')
          }
          actions={
            <>
              {isManager && (
                <div className={styles.viewToggle} id="tour-calendar-manager-scope">
                  <button
                    type="button"
                    className={managerScope === 'mine' ? styles.viewToggleActive : styles.viewToggleButton}
                    onClick={() => setManagerScope('mine')}
                    aria-pressed={managerScope === 'mine'}
                  >
                    {t('CalendarPage.myCalendar')}
                  </button>
                  <button
                    type="button"
                    className={managerScope === 'general' ? styles.viewToggleActive : styles.viewToggleButton}
                    onClick={() => setManagerScope('general')}
                    aria-pressed={managerScope === 'general'}
                  >
                    {t('CalendarPage.generalCalendar')}
                  </button>
                </div>
              )}
              <div className={styles.viewToggle} id="tour-calendar-toggle">
                <button
                  type="button"
                  className={viewMode === 'heatmap' ? styles.viewToggleActive : styles.viewToggleButton}
                  onClick={() => setViewMode('heatmap')}
                  aria-pressed={viewMode === 'heatmap'}
                >
                  <LayoutGrid size={14} /> {t('CalendarPage.heatmap')}
                </button>
                <button
                  type="button"
                  className={viewMode === 'agenda' ? styles.viewToggleActive : styles.viewToggleButton}
                  onClick={() => setViewMode('agenda')}
                  aria-pressed={viewMode === 'agenda'}
                >
                  <List size={14} /> {t('CalendarPage.agenda')}
                </button>
              </div>
            </>
          }
        />
      </div>

      {isSuperAdmin && (
        <CalendarScopePicker
          role={scopeRole}
          onRoleChange={handleScopeRoleChange}
          personId={effectivePersonId}
          onPersonChange={setScopePersonId}
          people={scopePeople}
        />
      )}

      <div ref={bodyRef} id="tour-calendar-body" className={styles.body} style={{ height: bodyHeight }}>
        {query.isError ? (
          <ErrorBanner error={query.error} onRetry={() => query.refetch()} />
        ) : viewMode === 'heatmap' ? (
          <CalendarHeatmap
            events={visibleEvents}
            isLoading={query.isPending}
            renderActions={canManageCatalog ? renderActions : undefined}
          />
        ) : (
          <CalendarAgenda
            events={visibleEvents}
            isLoading={query.isPending}
            renderActions={canManageCatalog ? renderActions : undefined}
          />
        )}
      </div>

      <EditCalendarEventModal event={editingEvent} onClose={handleCloseEdit} />

      <NewAssignmentsModal sessions={newAssignments} onClose={() => markSeen(newAssignments.map((session) => session.id))} />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={handleDeleteConfirm}
        title={t('CalendarPage.deleteDialogTitle')}
        description={deletingEvent ? t('CalendarPage.deleteDialogDescription', { title: deletingEvent.title }) : undefined}
        confirmLabel={t('CalendarPage.delete')}
        tone="danger"
        isLoading={deleteEvent.isPending}
      />
    </div>
  );
}
