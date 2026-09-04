import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Combobox } from '@/shared/components/Combobox';
import type { ComboboxOption } from '@/shared/components/Combobox';
import { Input } from '@/shared/components/Input';
import { Textarea } from '@/shared/components/Textarea';
import { Select } from '@/shared/components/Select';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { useProviders } from '@/features/providers/hooks/useProviders';
import type { Training } from '@/shared/types/domain';
import {
  TRAINING_CATALOG,
  findProviderNameForTraining,
  findTrainingDescription,
  getTrainingsForProvider,
} from '@/shared/data/trainingCatalog';
import { useCreateTraining, useUpdateTraining } from '../hooks/useTrainings';
import styles from './TrainingFormModal.module.css';

function buildTrainingSchema(t: TFunction<'trainings'>) {
  return z
    .object({
      name: z.string().trim().min(1, t('TrainingFormModal.errors.nameRequired')).max(150),
      providerId: z.coerce.number({ error: t('TrainingFormModal.errors.providerRequired') }).int().positive(t('TrainingFormModal.errors.providerRequired')),
      description: z.string().trim().max(2000).optional(),
      duration: z.preprocess(
        (value) => (value === '' || value === undefined || value === null ? undefined : value),
        z.coerce.number().int().positive(t('TrainingFormModal.errors.durationPositive')).optional(),
      ),
      durationUnit: z.preprocess(
        (value) => (value === '' || value === undefined || value === null ? undefined : value),
        z.enum(['days', 'hours']).optional(),
      ),
    })
    .refine((data) => (data.duration === undefined) === (data.durationUnit === undefined), {
      message: t('TrainingFormModal.errors.durationUnitRequired'),
      path: ['durationUnit'],
    });
}

type TrainingFormInput = z.input<ReturnType<typeof buildTrainingSchema>>;
type TrainingFormOutput = z.output<ReturnType<typeof buildTrainingSchema>>;

interface TrainingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProviderId?: number;
  editing?: Training | null;
}

const FORM_ID = 'training-form';





const ALL_TRAINING_OPTIONS: ComboboxOption[] = TRAINING_CATALOG.flatMap((entry) =>
  entry.trainings.map((training) => ({
    value: training.name,
    label: `${training.name} — ${entry.providerName}`,
  })),
);

export function TrainingFormModal({ isOpen, onClose, defaultProviderId, editing = null }: TrainingFormModalProps) {
  const { t } = useTranslation('trainings');
  const providersQuery = useProviders();
  const createTraining = useCreateTraining();
  const updateTraining = useUpdateTraining();
  const toast = useToast();
  const mutation = editing ? updateTraining : createTraining;
  const trainingSchema = useMemo(() => buildTrainingSchema(t), [t]);
  const [unresolvedProviderName, setUnresolvedProviderName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TrainingFormInput, unknown, TrainingFormOutput>({
    resolver: zodResolver(trainingSchema),
    values: editing
      ? {
          name: editing.name,
          providerId: editing.providerId,
          description: editing.description ?? '',
          duration: editing.duration ?? undefined,
          durationUnit: editing.durationUnit ?? undefined,
        }
      : undefined,
  });

  const nameValue = watch('name') ?? '';
  const providerIdValue = watch('providerId');
  const isProviderKnown = Boolean(providerIdValue);

  const selectedProvider = useMemo(
    () => providersQuery.data?.find((provider) => String(provider.id) === String(providerIdValue)),
    [providersQuery.data, providerIdValue],
  );

  // Reacts to the Name field itself (typed or picked) rather than only a
  // dropdown click, so typing an exact catalog match auto-fills the same
  // way selecting it would - same live-preview spirit as
  // ProviderFormModal's logo resolution.
  useEffect(() => {
    if (!nameValue) {
      setUnresolvedProviderName(null);
      return;
    }
    // Opening the edit modal shouldn't overwrite a since-customized
    // description just because the stored name happens to match (or no
    // longer matches) a catalog entry - only once the user actually
    // changes the name in this session.
    if (editing && nameValue === editing.name) return;

    if (selectedProvider) {
      const description = findTrainingDescription(selectedProvider.name, nameValue);
      if (description !== undefined) setValue('description', description, { shouldDirty: true });
      setUnresolvedProviderName(null);
      return;
    }

    const ownerProviderName = findProviderNameForTraining(nameValue);
    if (!ownerProviderName) {
      setUnresolvedProviderName(null);
      return;
    }
    const matchedProvider = providersQuery.data?.find(
      (provider) => provider.name.toLowerCase() === ownerProviderName.toLowerCase(),
    );
    if (matchedProvider) {
      setValue('providerId', matchedProvider.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      const description = findTrainingDescription(ownerProviderName, nameValue);
      if (description !== undefined) setValue('description', description, { shouldDirty: true });
      setUnresolvedProviderName(null);
    } else {
      setUnresolvedProviderName(ownerProviderName);
    }
  }, [nameValue, editing, selectedProvider, providersQuery.data, setValue]);

  const nameOptions = useMemo<ComboboxOption[]>(() => {
    if (!selectedProvider) return ALL_TRAINING_OPTIONS;
    return getTrainingsForProvider(selectedProvider.name).map((training) => ({
      value: training.name,
      label: training.name,
    }));
  }, [selectedProvider]);

  const nameHint = unresolvedProviderName
    ? t('TrainingFormModal.providerAddedHint', { provider: unresolvedProviderName })
    : selectedProvider
      ? t('TrainingFormModal.nameHintWithProvider', { provider: selectedProvider.name })
      : t('TrainingFormModal.nameHintNoProvider');

  const handleClose = () => {
    reset();
    mutation.reset();
    setUnresolvedProviderName(null);
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(
        editing
          ? t('TrainingFormModal.trainingUpdated', { name: values.name })
          : t('TrainingFormModal.trainingAdded', { name: values.name }),
      );
      handleClose();
    };

    if (editing) {
      updateTraining.mutate(
        {
          id: editing.id,
          payload: {
            name: values.name,
            description: values.description,
            duration: values.duration,
            durationUnit: values.durationUnit,
          },
        },
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
      title={editing ? t('TrainingFormModal.editTitle') : t('TrainingFormModal.addTitle')}
      description={t('TrainingFormModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('TrainingFormModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending}>
            {editing ? t('TrainingFormModal.saveChanges') : t('TrainingFormModal.addTraining')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {mutation.isError && <ErrorBanner error={mutation.error} />}

        <FormField
          label={t('TrainingFormModal.providerLabel')}
          error={errors.providerId?.message}
          hint={editing ? t('TrainingFormModal.providerLockedHint') : undefined}
          required
        >
          {(fieldProps) => {
            const providerField = register('providerId');
            return (
              <Select
                {...fieldProps}
                {...providerField}
                onChange={(event) => {
                  providerField.onChange(event);
                  setValue('name', '', { shouldDirty: true });
                  setValue('description', '', { shouldDirty: true });
                  setUnresolvedProviderName(null);
                }}
                defaultValue={defaultProviderId ?? ''}
                disabled={Boolean(editing)}
              >
                <option value="" disabled>
                  {providersQuery.isPending ? t('TrainingFormModal.loadingProviders') : t('TrainingFormModal.selectProvider')}
                </option>
                {providersQuery.data?.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </Select>
            );
          }}
        </FormField>

        <FormField label={t('TrainingFormModal.nameLabel')} error={errors.name?.message} required hint={nameHint}>
          {(fieldProps) => (
            <Combobox
              placeholder={t('TrainingFormModal.namePlaceholder')}
              options={nameOptions}
              value={nameValue}
              onSelect={(value) => setValue('name', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
              {...fieldProps}
              {...register('name')}
            />
          )}
        </FormField>

        <FormField
          label={t('TrainingFormModal.durationLabel')}
          error={errors.duration?.message ?? errors.durationUnit?.message}
          hint={isProviderKnown ? t('TrainingFormModal.durationOptionalHint') : t('TrainingFormModal.durationLockedHint')}
        >
          {(fieldProps) => (
            <div className={styles.durationRow}>
              <Input
                type="number"
                min={1}
                placeholder="40"
                className={styles.durationInput}
                disabled={!isProviderKnown}
                {...fieldProps}
                {...register('duration')}
              />
              <div className={styles.durationUnit}>
                <Select
                  aria-label={t('TrainingFormModal.durationUnitLabel')}
                  invalid={fieldProps.invalid}
                  defaultValue=""
                  disabled={!isProviderKnown}
                  {...register('durationUnit')}
                >
                  <option value="" disabled>
                    {t('TrainingFormModal.unit')}
                  </option>
                  <option value="days">{t('TrainingFormModal.days')}</option>
                  <option value="hours">{t('TrainingFormModal.hours')}</option>
                </Select>
              </div>
            </div>
          )}
        </FormField>

        <FormField
          label={t('TrainingFormModal.descriptionLabel')}
          error={errors.description?.message}
          hint={isProviderKnown ? t('TrainingFormModal.descriptionOptionalHint') : t('TrainingFormModal.descriptionLockedHint')}
        >
          {(fieldProps) => (
            <Textarea
              placeholder={t('TrainingFormModal.descriptionPlaceholder')}
              disabled={!isProviderKnown}
              {...fieldProps}
              {...register('description')}
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
