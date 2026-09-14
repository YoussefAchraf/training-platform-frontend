import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Textarea } from '@/shared/components/Textarea';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import type { SessionNote } from '@/shared/types/domain';
import { useAddSessionNote, useUpdateSessionNote } from '../hooks/useSessions';
import styles from './SessionNoteFormModal.module.css';

const MAX_LENGTH = 5000;
const FORM_ID = 'session-note-form';

interface SessionNoteFormModalProps {
  sessionId: number;
  isOpen: boolean;
  onClose: () => void;
  editing?: SessionNote | null;
}

export function SessionNoteFormModal({ sessionId, isOpen, onClose, editing = null }: SessionNoteFormModalProps) {
  const { t } = useTranslation('sessions');
  const [body, setBody] = useState('');
  const addNote = useAddSessionNote();
  const updateNote = useUpdateSessionNote();
  const toast = useToast();

  const mutation = editing ? updateNote : addNote;

  useEffect(() => {
    if (isOpen) {
      setBody(editing?.body ?? '');
      addNote.reset();
      updateNote.reset();
    }
    
  }, [isOpen, editing?.id]);

  const handleClose = () => {
    onClose();
  };

  const trimmed = body.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_LENGTH;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    if (editing) {
      updateNote.mutate(
        { sessionId, noteId: editing.id, body: trimmed },
        {
          onSuccess: () => {
            toast.success(t('SessionNoteFormModal.noteUpdated'));
            handleClose();
          },
        },
      );
    } else {
      addNote.mutate(
        { sessionId, body: trimmed },
        {
          onSuccess: () => {
            toast.success(t('SessionNoteFormModal.noteAdded'));
            handleClose();
          },
        },
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editing ? t('SessionNoteFormModal.editTitle') : t('SessionNoteFormModal.addTitle')}
      description={t('SessionNoteFormModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('SessionNoteFormModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending} disabled={!isValid}>
            {editing ? t('SessionNoteFormModal.saveChanges') : t('SessionNoteFormModal.addNote')}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} id={FORM_ID} className="stack" noValidate>
        {mutation.isError && <ErrorBanner error={mutation.error} />}

        <FormField label={t('SessionNoteFormModal.bodyLabel')} required>
          {(fieldProps) => (
            <Textarea
              {...fieldProps}
              rows={6}
              maxLength={MAX_LENGTH}
              placeholder={t('SessionNoteFormModal.bodyPlaceholder')}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              autoFocus
            />
          )}
        </FormField>
        <p className={styles.charCount} aria-live="polite">
          {t('SessionNoteFormModal.charCount', { count: trimmed.length, max: MAX_LENGTH })}
        </p>
      </form>
    </Modal>
  );
}
