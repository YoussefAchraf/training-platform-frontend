import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { computeSessionEndDate } from '../utils/sessionDuration';

const sessionSchema = z
  .object({
    trainingId: z.coerce.number({ error: 'Select a training' }).int().positive('Select a training'),
    clientId: z.coerce.number({ error: 'Select a client' }).int().positive('Select a client'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after the start date',
    path: ['endDate'],
  });

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
  } = useForm<SessionFormInput, unknown, SessionFormOutput>({ resolver: zodResolver(sessionSchema) });

  const trainingId = watch('trainingId');
  const startDate = watch('startDate');
  const selectedTraining = trainingsQuery.data?.find((training) => String(training.id) === String(trainingId));

  
  
  
  useEffect(() => {
    if (dirtyFields.endDate) return;
    if (!startDate || !selectedTraining?.duration || !selectedTraining.durationUnit) return;
    const computed = computeSessionEndDate(
      startDate,
      selectedTraining.duration,
      selectedTraining.durationUnit,
      !includeWeekends,
    );
    if (computed) setValue('endDate', computed, { shouldValidate: true });
  }, [startDate, selectedTraining, includeWeekends, dirtyFields.endDate, setValue]);

  const handleClose = () => {
    reset();
    setIncludeWeekends(false);
    createSession.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    createSession.mutate(
      {
        trainingId: values.trainingId,
        clientId: values.clientId,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
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
          <FormField label="Start date & time" error={errors.startDate?.message} required>
            {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('startDate')} />}
          </FormField>

          <FormField
            label="End date & time"
            error={errors.endDate?.message}
            required
            hint={
              !dirtyFields.endDate && selectedTraining?.duration && selectedTraining.durationUnit
                ? 'Filled in from the training duration - edit it directly to override'
                : undefined
            }
          >
            {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('endDate')} />}
          </FormField>

          {selectedTraining?.durationUnit === 'days' && (
            <Checkbox
              checked={includeWeekends}
              onChange={(event) => setIncludeWeekends(event.target.checked)}
              label="Include weekends when calculating the end date"
            />
          )}
        </div>
      </form>
    </Modal>
  );
}
