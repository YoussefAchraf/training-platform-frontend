import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { FormField } from './FormField';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  isLoading?: boolean;
  
  confirmPhrase?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  isLoading = false,
  confirmPhrase,
}: ConfirmDialogProps) {
  const { t } = useTranslation('common');
  const [typedValue, setTypedValue] = useState('');

  
  
  
  useEffect(() => {
    if (!isOpen) setTypedValue('');
  }, [isOpen]);

  const phraseMatched = !confirmPhrase || typedValue === confirmPhrase;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel ?? t('ConfirmDialog.cancel')}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={!phraseMatched}
          >
            {confirmLabel ?? t('ConfirmDialog.confirm')}
          </Button>
        </>
      }
    >
      {confirmPhrase && (
        <FormField label={t('ConfirmDialog.typeToConfirmLabel', { phrase: confirmPhrase })}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              value={typedValue}
              onChange={(event) => setTypedValue(event.target.value)}
              placeholder={t('ConfirmDialog.typeToConfirmPlaceholder')}
              autoComplete="off"
              autoFocus
            />
          )}
        </FormField>
      )}
    </Modal>
  );
}
