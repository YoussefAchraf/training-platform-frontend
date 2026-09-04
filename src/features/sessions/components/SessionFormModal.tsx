import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Checkbox } from '@/shared/components/Checkbox';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import { useClients } from '@/features/clients/hooks/useClients';
import { useCreateSession } from '../hooks/useSessions';
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

function buildSessionSchema(t: TFunction<'sessions'>) {
  return z
    .object({
      trainingId: z.coerce.number({ error: t('SessionFormModal.errors.trainingRequired') }).int().positive(t('SessionFormModal.errors.trainingRequired')),
      clientId: z.coerce.number({ error: t('SessionFormModal.errors.clientRequired') }).int().positive(t('SessionFormModal.errors.clientRequired')),
      startDate: z.string().min(1, t('SessionFormModal.errors.startDateRequired')),
      startTime: z.string().min(1, t('SessionFormModal.errors.startTimeRequired')),
      dailyEndTime: z.string().min(1, t('SessionFormModal.errors.dailyEndTimeRequired')),
      endDate: z.string().min(1, t('SessionFormModal.errors.endDateRequired')),
      locationType: z.enum(['onsite', 'remote']),
    })
    .refine((data) => hoursBetweenTimes(data.startTime, data.dailyEndTime) !== null, {
      message: t('SessionFormModal.errors.dailyEndTimeAfterStart'),
      path: ['dailyEndTime'],
    })
    .refine(
      (data) => {
        const combined = combineDateAndTime(data.startDate, data.startTime);
        return combined ? new Date(combined) >= nowFlooredToMinute() : true;
      },
      { message: t('SessionFormModal.errors.startNotInPast'), path: ['startDate'] },
    )
    .refine(
      (data) => {
        const start = combineDateAndTime(data.startDate, data.startTime);
        const end = combineDateAndTime(data.endDate, data.dailyEndTime);
        return start && end ? new Date(end) > new Date(start) : true;
      },
      { message: t('SessionFormModal.errors.endOnOrAfterStart'), path: ['endDate'] },
    );
}

type SessionFormInput = z.input<ReturnType<typeof buildSessionSchema>>;
type SessionFormOutput = z.output<ReturnType<typeof buildSessionSchema>>;

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionFormModal({ isOpen, onClose }: SessionFormModalProps) {
  const { t } = useTranslation('sessions');
  const trainingsQuery = useTrainings();
  const clientsQuery = useClients();
  const createSession = useCreateSession();
  const toast = useToast();
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const sessionSchema = useMemo(() => buildSessionSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<SessionFormInput, unknown, SessionFormOutput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { startTime: '09:00', dailyEndTime: '17:00', locationType: 'onsite' },
  });

  const trainingId = watch('trainingId');
  const startDate = watch('startDate');
  const startTime = watch('startTime');
  const dailyEndTime = watch('dailyEndTime');
  const selectedTraining = trainingsQuery.data?.find((training) => String(training.id) === String(trainingId));
  const hoursPerDay = hoursBetweenTimes(startTime, dailyEndTime);
  const daysNeeded =
    selectedTraining?.duration && selectedTraining.durationUnit && hoursPerDay
      ? computeDaysNeeded(selectedTraining.duration, selectedTraining.durationUnit, hoursPerDay)
      : null;
  
  
  
  
  const showIncludeWeekends = (daysNeeded ?? 0) > 1;

  useEffect(() => {
    if (dirtyFields.endDate) return;
    if (!startDate || !selectedTraining?.duration || !selectedTraining.durationUnit || !hoursPerDay) return;
    const endDay = computeSessionEndDay(
      startDate,
      selectedTraining.duration,
      selectedTraining.durationUnit,
      hoursPerDay,
      !includeWeekends,
    );
    if (endDay) setValue('endDate', format(endDay, 'yyyy-MM-dd'), { shouldValidate: true });
  }, [startDate, hoursPerDay, selectedTraining, includeWeekends, dirtyFields.endDate, setValue]);

  const handleClose = () => {
    reset();
    setIncludeWeekends(false);
    createSession.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const startIso = combineDateAndTime(values.startDate, values.startTime);
    const endIso = combineDateAndTime(values.endDate, values.dailyEndTime);
    if (!startIso || !endIso) return;

    createSession.mutate(
      {
        trainingId: values.trainingId,
        clientId: values.clientId,
        startDate: new Date(startIso).toISOString(),
        endDate: new Date(endIso).toISOString(),
        includeWeekends,
        locationType: values.locationType,
      },
      {
        onSuccess: () => {
          toast.success(t('SessionFormModal.sessionBooked'));
          handleClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('SessionFormModal.title')}
      description={t('SessionFormModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('SessionFormModal.cancel')}
          </Button>
          <Button type="submit" form="session-form" isLoading={createSession.isPending}>
            {t('SessionFormModal.bookSession')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id="session-form" className="stack" noValidate>
        {createSession.isError && <ErrorBanner error={createSession.error} />}

        <FormField label={t('SessionFormModal.trainingLabel')} error={errors.trainingId?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('trainingId')} defaultValue="">
              <option value="" disabled>
                {trainingsQuery.isPending ? t('SessionFormModal.loadingTrainings') : t('SessionFormModal.selectTraining')}
              </option>
              {trainingsQuery.data?.map((training) => (
                <option key={training.id} value={training.id}>
                  {training.name} ({training.providerName})
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label={t('SessionFormModal.clientLabel')} error={errors.clientId?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('clientId')} defaultValue="">
              <option value="" disabled>
                {clientsQuery.isPending ? t('SessionFormModal.loadingClients') : t('SessionFormModal.selectClient')}
              </option>
              {clientsQuery.data?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label={t('SessionFormModal.locationTypeLabel')} error={errors.locationType?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('locationType')}>
              <option value="onsite">{t('SessionFormModal.onsite')}</option>
              <option value="remote">{t('SessionFormModal.remote')}</option>
            </Select>
          )}
        </FormField>

        <div className="stack">
          <FormField label={t('SessionFormModal.startDateLabel')} error={errors.startDate?.message} required>
            {(fieldProps) => <Input type="date" min={todayLocal()} {...fieldProps} {...register('startDate')} />}
          </FormField>

          <div className={styles.timeRow}>
            <FormField label={t('SessionFormModal.startTimeLabel')} error={errors.startTime?.message} required>
              {(fieldProps) => <Input type="time" {...fieldProps} {...register('startTime')} />}
            </FormField>
            <FormField
              label={t('SessionFormModal.dailyEndTimeLabel')}
              error={errors.dailyEndTime?.message}
              required
              hint={t('SessionFormModal.dailyEndTimeHint')}
            >
              {(fieldProps) => <Input type="time" {...fieldProps} {...register('dailyEndTime')} />}
            </FormField>
          </div>

          {showIncludeWeekends && (
            <Checkbox
              checked={includeWeekends}
              onChange={(event) => setIncludeWeekends(event.target.checked)}
              label={t('SessionFormModal.includeWeekends')}
            />
          )}

          <FormField
            label={t('SessionFormModal.endDateLabel')}
            error={errors.endDate?.message}
            required
            hint={
              !dirtyFields.endDate && selectedTraining?.duration && selectedTraining.durationUnit
                ? t('SessionFormModal.endDateHint')
                : undefined
            }
          >
            {(fieldProps) => <Input type="date" min={startDate || todayLocal()} {...fieldProps} {...register('endDate')} />}
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
