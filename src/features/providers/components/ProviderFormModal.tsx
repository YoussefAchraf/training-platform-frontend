import { useMemo } from 'react';
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
import { Textarea } from '@/shared/components/Textarea';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ProviderLogo } from '@/shared/components/ProviderLogo';
import { useToast } from '@/shared/hooks/useToast';
import type { Provider } from '@/shared/types/domain';
import { PROVIDER_ICONS, findProviderIcon } from '@/shared/data/providerIcons';
import { useCreateProvider, useUpdateProvider } from '../hooks/useProviders';

function buildProviderSchema(t: TFunction<'providers'>) {
  return z.object({
    name: z.string().trim().min(1, t('ProviderFormModal.errors.nameRequired')).max(150),
    description: z.string().trim().max(2000).optional(),
  });
}

const PROVIDER_NAME_OPTIONS: ComboboxOption[] = PROVIDER_ICONS.map((entry) => ({
  value: entry.name,
  label: entry.name,
  icon: <ProviderLogo name={entry.name} logoUrl={entry.iconUrl} size={20} />,
}));

type ProviderFormValues = z.infer<ReturnType<typeof buildProviderSchema>>;

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Provider | null;
}

const FORM_ID = 'provider-form';

export function ProviderFormModal({ isOpen, onClose, editing = null }: ProviderFormModalProps) {
  const { t } = useTranslation('providers');
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const toast = useToast();
  const mutation = editing ? updateProvider : createProvider;
  const providerSchema = useMemo(() => buildProviderSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    values: editing ? { name: editing.name, description: editing.description ?? '' } : undefined,
  });

  const nameValue = watch('name');
  
  
  
  const resolvedLogoUrl = useMemo(
    () => findProviderIcon(nameValue ?? '') ?? editing?.logoUrl ?? undefined,
    [nameValue, editing],
  );

  const handleClose = () => {
    reset();
    mutation.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(
        editing
          ? t('ProviderFormModal.providerUpdated', { name: values.name })
          : t('ProviderFormModal.providerAdded', { name: values.name }),
      );
      handleClose();
    };
    const payload = { ...values, logoUrl: resolvedLogoUrl };

    if (editing) {
      updateProvider.mutate({ id: editing.id, payload }, { onSuccess });
    } else {
      createProvider.mutate(payload, { onSuccess });
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editing ? t('ProviderFormModal.editTitle') : t('ProviderFormModal.addTitle')}
      description={t('ProviderFormModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('ProviderFormModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending}>
            {editing ? t('ProviderFormModal.saveChanges') : t('ProviderFormModal.addProvider')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {mutation.isError && <ErrorBanner error={mutation.error} />}

        <FormField label={t('ProviderFormModal.nameLabel')} error={errors.name?.message} required hint={t('ProviderFormModal.nameHint')}>
          {(fieldProps) => (
            <Combobox
              placeholder={t('ProviderFormModal.namePlaceholder')}
              options={PROVIDER_NAME_OPTIONS}
              value={nameValue ?? ''}
              onSelect={(value) => setValue('name', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
              {...fieldProps}
              {...register('name')}
            />
          )}
        </FormField>

        <FormField label={t('ProviderFormModal.descriptionLabel')} error={errors.description?.message} hint={t('ProviderFormModal.descriptionOptionalHint')}>
          {(fieldProps) => (
            <Textarea
              placeholder={t('ProviderFormModal.descriptionPlaceholder')}
              {...fieldProps}
              {...register('description')}
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
