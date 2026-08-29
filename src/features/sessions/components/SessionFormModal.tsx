import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
import { combineDateAndTime, computeSessionEndDay, hoursBetweenTimes } from '../utils/sessionDuration';
import styles from './SessionFormModal.module.css';

function todayLocal(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function nowFlooredToMinute(): Date {
  const now = new Date();
  now.setSeconds(0, 0);
  return now;
}

const sessionSchema = z
  .object({
    trainingId: z.coerce.number({ error: 'Select a training' }).int().positive('Select a training'),
    clientId: z.coerce.number({ error: 'Select a client' }).int().positive('Select a client'),
    startDate: z.string().min(1, 'Start date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    dailyEndTime: z.string().min(1, 'Daily end time is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => hoursBetweenTimes(data.startTime, data.dailyEndTime) !== null, {
    message: 'Daily end time must be after the start time',
    path: ['dailyEndTime'],
  })
  .refine(
    (data) => {
      const combined = combineDateAndTime(data.startDate, data.startTime);
      return combined ? new Date(combined) >= nowFlooredToMinute() : true;
    },
    { message: 'Start date and time cannot be in the past', path: ['startDate'] },
  )
  .refine(
    (data) => {
      const start = combineDateAndTime(data.startDate, data.startTime);
      const end = combineDateAndTime(data.endDate, data.dailyEndTime);
      return start && end ? new Date(end) > new Date(start) : true;
    },
    { message: 'End date must be on or after the start date', path: ['endDate'] },
  );

type SessionFormInput = z.input<typeof sessionSchema>;
type SessionFormOutput = z.output<typeof sessionSchema>;

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionFormModal({ isOpen, onClose }: SessionFormModalProps) {
  const trainingsQuery = useTrainings();
  const clientsQuery = useClients();
  const createSession = useCreateSession();
  const toast = useToast();
  const [includeWeekends, setIncludeWeekends] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<SessionFormInput, unknown, SessionFormOutput>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { startTime: '09:00', dailyEndTime: '17:00' },
  });

  const trainingId = watch('trainingId');
  const startDate = watch('startDate');
  const startTime = watch('startTime');
  const dailyEndTime = watch('dailyEndTime');
  const selectedTraining = trainingsQuery.data?.find((training) => String(training.id) === String(trainingId));

  
  
  
  
  
  
  useEffect(() => {
    if (dirtyFields.endDate) return;
    if (!startDate || !selectedTraining?.duration || !selectedTraining.durationUnit) return;
    const hoursPerDay = hoursBetweenTimes(startTime, dailyEndTime);
    if (!hoursPerDay) return;
    const endDay = computeSessionEndDay(
      startDate,
      selectedTraining.duration,
      selectedTraining.durationUnit,
      hoursPerDay,
      !includeWeekends,
    );
    if (endDay) setValue('endDate', format(endDay, 'yyyy-MM-dd'), { shouldValidate: true });
  }, [startDate, startTime, dailyEndTime, selectedTraining, includeWeekends, dirtyFields.endDate, setValue]);

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
      },
      {
        onSuccess: () => {
          toast.success('Session booked.');
          handleClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Book a session"
      description="Schedule a training for a client. You can assign an instructor afterwards."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="session-form" isLoading={createSession.isPending}>
            Book session
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id="session-form" className="stack" noValidate>
        {createSession.isError && <ErrorBanner error={createSession.error} />}

        <FormField label="Training" error={errors.trainingId?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('trainingId')} defaultValue="">
              <option value="" disabled>
                {trainingsQuery.isPending ? 'Loading trainings…' : 'Select a training'}
              </option>
              {trainingsQuery.data?.map((training) => (
                <option key={training.id} value={training.id}>
                  {training.name} ({training.providerName})
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Client" error={errors.clientId?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('clientId')} defaultValue="">
              <option value="" disabled>
                {clientsQuery.isPending ? 'Loading clients…' : 'Select a client'}
              </option>
              {clientsQuery.data?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <div className="stack">
          <FormField label="Start date" error={errors.startDate?.message} required>
            {(fieldProps) => <Input type="date" min={todayLocal()} {...fieldProps} {...register('startDate')} />}
          </FormField>

          <div className={styles.timeRow}>
            <FormField label="Start time" error={errors.startTime?.message} required>
              {(fieldProps) => <Input type="time" {...fieldProps} {...register('startTime')} />}
            </FormField>
            <FormField
              label="Daily end time"
              error={errors.dailyEndTime?.message}
              required
              hint="Same every day, e.g. 10:20 to 18:20"
            >
              {(fieldProps) => <Input type="time" {...fieldProps} {...register('dailyEndTime')} />}
            </FormField>
          </div>

          {selectedTraining?.durationUnit === 'days' && (
            <Checkbox
              checked={includeWeekends}
              onChange={(event) => setIncludeWeekends(event.target.checked)}
              label="Include weekends when calculating the end date"
            />
          )}

          <FormField
            label="End date"
            error={errors.endDate?.message}
            required
            hint={
              !dirtyFields.endDate && selectedTraining?.duration && selectedTraining.durationUnit
                ? 'Predicted from the training duration and daily hours - edit it directly to override'
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
