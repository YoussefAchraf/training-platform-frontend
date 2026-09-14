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
import { useDeleteSessionNote, useSessionNotes } from '../hooks/useSessions';
import { SessionNoteFormModal } from './SessionNoteFormModal';
import styles from './SessionNotesSection.module.css';

interface SessionNotesSectionProps {
  sessionId: number;
  canWrite: boolean;
}

export function SessionNotesSection({ sessionId, canWrite }: SessionNotesSectionProps) {
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
    <div>
      {canWrite && (
        <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={openAdd} className={styles.addButton}>
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
        <ul className={styles.list}>
          {notes.map((note) => (
            <li key={note.id} className={styles.noteCard}>
              <p className={styles.body}>{note.body}</p>
              <div className={styles.footer}>
                <span className={styles.timestamp}>
                  {note.updatedAt !== note.createdAt
                    ? t('SessionNotesSection.editedAt', { time: formatRelative(note.updatedAt) })
                    : formatRelative(note.createdAt)}
                </span>
                {canWrite && (
                  <span className={styles.actions}>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t('SessionNotesSection.editNote')}
                      onClick={() => openEdit(note)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t('SessionNotesSection.deleteNote')}
                      onClick={() => setDeletingNote(note)}
                    >
                      <Trash2 size={14} />
                    </Button>
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
