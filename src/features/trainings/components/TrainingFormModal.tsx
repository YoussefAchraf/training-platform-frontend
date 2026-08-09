import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Textarea } from '@/shared/components/Textarea';
import { Select } from '@/shared/components/Select';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { useProviders } from '@/features/providers/hooks/useProviders';
import type { Training } from '@/shared/types/domain';
import { useCreateTraining, useUpdateTraining } from '../hooks/useTrainings';

const trainingSchema = z.object({
  name: z.string().trim().min(1, 'Training name is required').max(150),
  providerId: z.coerce.number({ error: 'Select a provider' }).int().positive('Select a provider'),
  description: z.string().trim().max(2000).optional(),
  duration: z.preprocess(
    (value) => (value === '' || value === undefined || value === null ? undefined : value),
    z.coerce.number().int().positive('Duration must be a positive number').optional(),
  ),
});

type TrainingFormInput = z.input<typeof trainingSchema>;
type TrainingFormOutput = z.output<typeof trainingSchema>;

interface TrainingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProviderId?: number;
  editing?: Training | null;
}

const FORM_ID = 'training-form';

export function TrainingFormModal({ isOpen, onClose, defaultProviderId, editing = null }: TrainingFormModalProps) {
  const providersQuery = useProviders();
  const createTraining = useCreateTraining();
  const updateTraining = useUpdateTraining();
  const toast = useToast();
  const mutation = editing ? updateTraining : createTraining;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormInput, unknown, TrainingFormOutput>({
    resolver: zodResolver(trainingSchema),
    values: editing
      ? {
          name: editing.name,
          providerId: editing.providerId,
          description: editing.description ?? '',
          duration: editing.duration ?? undefined,
        }
      : undefined,
  });

  const handleClose = () => {
    reset();
    mutation.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(editing ? `${values.name} was updated.` : `${values.name} was added to trainings.`);
      handleClose();
    };

    if (editing) {
      updateTraining.mutate(
        { id: editing.id, payload: { name: values.name, description: values.description, duration: values.duration } },
        { onSuccess },
      );
    } else {
      createTraining.mutate(values, { onSuccess });
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editing ? 'Edit training' : 'Add training'}
      description="A specific certification course under a provider, e.g. RHCSA under Red Hat."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending}>
            {editing ? 'Save changes' : 'Add training'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {mutation.isError && <ErrorBanner error={mutation.error} />}

        <FormField label="Name" error={errors.name?.message} required>
          {(fieldProps) => <Input placeholder="RHCSA" {...fieldProps} {...register('name')} />}
        </FormField>

        <FormField
          label="Provider"
          error={errors.providerId?.message}
          hint={editing ? "Provider can't be changed after a training is created" : undefined}
          required
        >
          {(fieldProps) => (
            <Select
              {...fieldProps}
              {...register('providerId')}
              defaultValue={defaultProviderId ?? ''}
              disabled={Boolean(editing)}
            >
              <option value="" disabled>
                {providersQuery.isPending ? 'Loading providers…' : 'Select a provider'}
              </option>
              {providersQuery.data?.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Duration" error={errors.duration?.message} hint="Optional, in hours or days">
          {(fieldProps) => <Input type="number" min={1} placeholder="40" {...fieldProps} {...register('duration')} />}
        </FormField>

        <FormField label="Description" error={errors.description?.message} hint="Optional">
          {(fieldProps) => (
            <Textarea placeholder="Red Hat Certified System Administrator" {...fieldProps} {...register('description')} />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
