import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Checkbox } from '@/shared/components/Checkbox';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import type { Training, TrainingSession } from '@/shared/types/domain';
import { useUpdateSession } from '../hooks/useSessions';
import { combineDateAndTime, computeDaysNeeded, computeSessionEndDay, hoursBetweenTimes } from '../utils/sessionDuration';


import styles from './SessionFormModal.module.css';

function todayLocal(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function nowFlooredToMinute(): Date {
  const now = new Date();
  now.setSeconds(0, 0);
  return now;
}

function buildEditSessionSchema(t: TFunction<'sessions'>) {
  return z
    .object({
      startDate: z.string().min(1, t('EditSessionModal.errors.startDateRequired')),
      startTime: z.string().min(1, t('EditSessionModal.errors.startTimeRequired')),
      dailyEndTime: z.string().min(1, t('EditSessionModal.errors.dailyEndTimeRequired')),
      endDate: z.string().min(1, t('EditSessionModal.errors.endDateRequired')),
    })
    .refine((data) => hoursBetweenTimes(data.startTime, data.dailyEndTime) !== null, {
      message: t('EditSessionModal.errors.dailyEndTimeAfterStart'),
      path: ['dailyEndTime'],
    })
    .refine(
      (data) => {
        const combined = combineDateAndTime(data.startDate, data.startTime);
        return combined ? new Date(combined) >= nowFlooredToMinute() : true;
      },
      { message: t('EditSessionModal.errors.startNotInPast'), path: ['startDate'] },
    )
    .refine(
      (data) => {
        const start = combineDateAndTime(data.startDate, data.startTime);
        const end = combineDateAndTime(data.endDate, data.dailyEndTime);
        return start && end ? new Date(end) > new Date(start) : true;
      },
      { message: t('EditSessionModal.errors.endOnOrAfterStart'), path: ['endDate'] },
    );
}

type EditSessionFormValues = z.infer<ReturnType<typeof buildEditSessionSchema>>;

interface EditSessionModalProps {
  session: TrainingSession | null;
  training: Training | null;
  onClose: () => void;
}

const FORM_ID = 'edit-session-form';

export function EditSessionModal({ session, training, onClose }: EditSessionModalProps) {
  const { t } = useTranslation('sessions');
  const updateSession = useUpdateSession();
  const toast = useToast();
  const editSessionSchema = useMemo(() => buildEditSessionSchema(t), [t]);
  const [includeWeekends, setIncludeWeekends] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<EditSessionFormValues>({
    resolver: zodResolver(editSessionSchema),
    values: session
      ? {
          startDate: format(parseISO(session.startDate), 'yyyy-MM-dd'),
          startTime: format(parseISO(session.startDate), 'HH:mm'),
          dailyEndTime: format(parseISO(session.endDate), 'HH:mm'),
          endDate: format(parseISO(session.endDate), 'yyyy-MM-dd'),
        }
      : undefined,
  });

  
  
  
  
  useEffect(() => {
    if (session) setIncludeWeekends(session.includeWeekends);
  }, [session]);

  const startDate = watch('startDate');
  const startTime = watch('startTime');
  const dailyEndTime = watch('dailyEndTime');
  const hoursPerDay = hoursBetweenTimes(startTime, dailyEndTime);
  const daysNeeded =
    training?.duration && training.durationUnit && hoursPerDay
      ? computeDaysNeeded(training.duration, training.durationUnit, hoursPerDay)
      : null;
  const showIncludeWeekends = (daysNeeded ?? 0) > 1;

  useEffect(() => {
    if (dirtyFields.endDate) return;
    if (!startDate || !training?.duration || !training.durationUnit || !hoursPerDay) return;
    const endDay = computeSessionEndDay(startDate, training.duration, training.durationUnit, hoursPerDay, !includeWeekends);
    if (endDay) setValue('endDate', format(endDay, 'yyyy-MM-dd'), { shouldValidate: true });
  }, [startDate, hoursPerDay, training, includeWeekends, dirtyFields.endDate, setValue]);

  if (!session) return null;

  const onSubmit = handleSubmit((values) => {
    const startIso = combineDateAndTime(values.startDate, values.startTime);
    const endIso = combineDateAndTime(values.endDate, values.dailyEndTime);
    if (!startIso || !endIso) return;

    updateSession.mutate(
      {
        id: session.id,
        payload: {
          startDate: new Date(startIso).toISOString(),
          endDate: new Date(endIso).toISOString(),
          includeWeekends,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('EditSessionModal.datesUpdated'));
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={Boolean(session)}
      onClose={onClose}
      title={t('EditSessionModal.title')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('EditSessionModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateSession.isPending}>
            {t('EditSessionModal.saveChanges')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {updateSession.isError && <ErrorBanner error={updateSession.error} />}

        <FormField label={t('EditSessionModal.startDateLabel')} error={errors.startDate?.message} required>
          {(fieldProps) => <Input type="date" min={todayLocal()} {...fieldProps} {...register('startDate')} />}
        </FormField>

        <div className={styles.timeRow}>
          <FormField label={t('EditSessionModal.startTimeLabel')} error={errors.startTime?.message} required>
            {(fieldProps) => <Input type="time" {...fieldProps} {...register('startTime')} />}
          </FormField>
          <FormField
            label={t('EditSessionModal.dailyEndTimeLabel')}
            error={errors.dailyEndTime?.message}
            required
            hint={t('EditSessionModal.dailyEndTimeHint')}
          >
            {(fieldProps) => <Input type="time" {...fieldProps} {...register('dailyEndTime')} />}
          </FormField>
        </div>

        {showIncludeWeekends && (
          <Checkbox
            checked={includeWeekends}
            onChange={(event) => setIncludeWeekends(event.target.checked)}
            label={t('EditSessionModal.includeWeekends')}
          />
        )}

        <FormField
          label={t('EditSessionModal.endDateLabel')}
          error={errors.endDate?.message}
          required
          hint={!dirtyFields.endDate && training?.duration && training.durationUnit ? t('EditSessionModal.endDateHint') : undefined}
        >
          {(fieldProps) => <Input type="date" min={startDate || todayLocal()} {...fieldProps} {...register('endDate')} />}
        </FormField>
      </form>
    </Modal>
  );
}
