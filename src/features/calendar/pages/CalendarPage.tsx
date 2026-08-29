import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/Button';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import type { CalendarEvent } from '@/shared/types/domain';
import { useViewportFillHeight } from '@/shared/hooks/useViewportFillHeight';
import { useDeleteCalendarEvent, useGlobalCalendar, useMyCalendar } from '../hooks/useCalendar';
import { CalendarAgenda } from '../components/CalendarAgenda';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { EditCalendarEventModal } from '../components/EditCalendarEventModal';
import styles from './CalendarPage.module.css';

type ViewMode = 'agenda' | 'heatmap';

export function CalendarPage() {
  const { t } = useTranslation('calendar');
  const { canManageCatalog, isInstructor } = useAuth();
  const toast = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');

  const globalQuery = useGlobalCalendar({ enabled: canManageCatalog });
  const mineQuery = useMyCalendar({ enabled: isInstructor });
  const query = canManageCatalog ? globalQuery : mineQuery;

  
  
  
  
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

  return (
    <div>
      <PageHeader
        title={t('CalendarPage.title')}
        description={
          canManageCatalog
            ? t('CalendarPage.descriptionManage')
            : t('CalendarPage.descriptionOther')
        }
        actions={
          <div className={styles.viewToggle}>
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
        }
      />

      <div ref={bodyRef} className={styles.body} style={{ height: bodyHeight }}>
        {query.isError ? (
          <ErrorBanner error={query.error} onRetry={() => query.refetch()} />
        ) : viewMode === 'heatmap' ? (
          <CalendarHeatmap
            events={query.data ?? []}
            isLoading={query.isPending}
            renderActions={canManageCatalog ? renderActions : undefined}
          />
        ) : (
          <CalendarAgenda
            events={query.data ?? []}
            isLoading={query.isPending}
            
            
            
            
            renderActions={canManageCatalog ? renderActions : undefined}
          />
        )}
      </div>

      <EditCalendarEventModal event={editingEvent} onClose={handleCloseEdit} />

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
