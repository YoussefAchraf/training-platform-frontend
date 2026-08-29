import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Paperclip, Upload, X } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useImportAttendees } from '../hooks/useSessions';
import styles from './AttendeeImportForm.module.css';

interface ImportFormValues {
  file: FileList | null;
}

interface AttendeeImportFormProps {
  sessionId: number;
}

export function AttendeeImportForm({ sessionId }: AttendeeImportFormProps) {
  const { t } = useTranslation('sessions');
  const importAttendees = useImportAttendees();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ImportFormValues>();

  const { ref: registerRef, ...fileField } = register('file', {
    required: t('AttendeeImportForm.fileRequired'),
  });

  const selectedFile = watch('file')?.[0] ?? null;

  const clearFile = () => {
    setValue('file', null, { shouldValidate: true });
    if (inputRef.current) inputRef.current.value = '';
  };

  const onSubmit = handleSubmit((values) => {
    const file = values.file?.[0];
    if (!file) return;
    importAttendees.mutate(
      { id: sessionId, file },
      { onSuccess: clearFile },
    );
  });

  return (
    <div className={styles.section}>
      <div className={styles.divider}>
        <span>{t('AttendeeImportForm.orImportFromFile')}</span>
      </div>

      <form onSubmit={onSubmit} className={styles.form} noValidate>
        {importAttendees.isError && <ErrorBanner error={importAttendees.error} />}

        <input
          type="file"
          accept=".csv,.xlsx"
          className={styles.hiddenInput}
          aria-label={t('AttendeeImportForm.fileFieldLabel')}
          {...fileField}
          ref={(el) => {
            registerRef(el);
            inputRef.current = el;
          }}
        />

        <div className={styles.pickerRow}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Paperclip size={15} />}
            onClick={() => inputRef.current?.click()}
          >
            {selectedFile ? t('AttendeeImportForm.changeFile') : t('AttendeeImportForm.chooseFile')}
          </Button>

          {selectedFile ? (
            <Badge tone="info" className={styles.fileChip}>
              {selectedFile.name}
              <button
                type="button"
                onClick={clearFile}
                aria-label={t('AttendeeImportForm.removeFile')}
                className={styles.chipClear}
              >
                <X size={12} />
              </button>
            </Badge>
          ) : (
            <span className={styles.pickerHint}>{t('AttendeeImportForm.pickerHint')}</span>
          )}
        </div>

        {errors.file && <p className={styles.error}>{errors.file.message}</p>}

        <Button
          type="submit"
          leftIcon={<Upload size={16} />}
          isLoading={importAttendees.isPending}
          disabled={!selectedFile}
        >
          {t('AttendeeImportForm.importAttendees')}
        </Button>
      </form>

      {importAttendees.isSuccess && (
        <div className={[styles.summary, importAttendees.data.skippedCount > 0 ? styles.summaryWarning : styles.summarySuccess].join(' ')}>
          <p className={styles.summaryHeadline}>
            <CheckCircle2 size={16} />
            {t('AttendeeImportForm.importedCount', { count: importAttendees.data.importedCount })}
            {importAttendees.data.skippedCount > 0 ? t('AttendeeImportForm.skippedCount', { count: importAttendees.data.skippedCount }) : ''}
          </p>
          {importAttendees.data.skipped.length > 0 && (
            <ul className={styles.skippedList}>
              {importAttendees.data.skipped.map((row) => (
                <li key={row.row}>
                  {t('AttendeeImportForm.rowSkipped', { row: row.row, name: row.name ? ` (${row.name})` : '', reason: row.reason })}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
