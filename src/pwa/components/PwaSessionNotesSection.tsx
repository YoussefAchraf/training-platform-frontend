import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotebookPen, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { EmptyState } from '@/shared/components/EmptyState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { formatRelative } from '@/shared/utils/formatDate';
import type { SessionNote } from '@/shared/types/domain';
import { useDeleteSessionNote, useSessionNotes } from '@/features/sessions/hooks/useSessions';
import { SessionNoteFormModal } from '@/features/sessions/components/SessionNoteFormModal';
import styles from './PwaSessionNotesSection.module.css';

interface PwaSessionNotesSectionProps {
  sessionId: number;
  canWrite: boolean;
}

export function PwaSessionNotesSection({ sessionId, canWrite }: PwaSessionNotesSectionProps) {
  const { t } = useTranslation('sessions');
  const notesQuery = useSessionNotes(sessionId);
  const deleteNote = useDeleteSessionNote();
  const toast = useToast();
  const formModal = useDisclosure();
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<SessionNote | null>(null);

  const openAdd = () => {
    setEditingNote(null);
    formModal.open();
  };

  const openEdit = (note: SessionNote) => {
    setEditingNote(note);
    formModal.open();
  };

  const handleDeleteConfirm = () => {
    if (!deletingNote) return;
    deleteNote.mutate(
      { sessionId, noteId: deletingNote.id },
      {
        onSuccess: () => {
          toast.success(t('SessionNotesSection.noteDeleted'));
          setDeletingNote(null);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  if (notesQuery.isPending) return <Spinner />;

  if (notesQuery.isError) {
    return <ErrorBanner error={notesQuery.error} onRetry={() => notesQuery.refetch()} />;
  }

  const notes = notesQuery.data;

  return (
    <div className={styles.wrap}>
      {canWrite && (
        <Button leftIcon={<Plus size={16} />} onClick={openAdd} className={styles.addButton}>
          {t('SessionNotesSection.addNote')}
        </Button>
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title={t('SessionNotesSection.emptyTitle')}
          description={canWrite ? t('SessionNotesSection.emptyDescriptionWriter') : t('SessionNotesSection.emptyDescriptionReader')}
        />
      ) : (
        <ul className={styles.cardList}>
          {notes.map((note) => (
            <li key={note.id} className={styles.card}>
              <p className={styles.body}>{note.body}</p>
              <div className={styles.cardFooter}>
                <span className={styles.timestamp}>
                  {note.updatedAt !== note.createdAt
                    ? t('SessionNotesSection.editedAt', { time: formatRelative(note.updatedAt) })
                    : formatRelative(note.createdAt)}
                </span>
                {canWrite && (
                  <span className={styles.actions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label={t('SessionNotesSection.editNote')}
                      onClick={() => openEdit(note)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label={t('SessionNotesSection.deleteNote')}
                      onClick={() => setDeletingNote(note)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <SessionNoteFormModal
        sessionId={sessionId}
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        editing={editingNote}
      />

      <ConfirmDialog
        isOpen={deletingNote !== null}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteConfirm}
        title={t('SessionNotesSection.deleteDialogTitle')}
        description={t('SessionNotesSection.deleteDialogDescription')}
        confirmLabel={t('SessionNotesSection.deleteNote')}
        tone="danger"
        isLoading={deleteNote.isPending}
      />
    </div>
  );
}
