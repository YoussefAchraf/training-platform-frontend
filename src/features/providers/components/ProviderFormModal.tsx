import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Textarea } from '@/shared/components/Textarea';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { ProviderLogo } from '@/shared/components/ProviderLogo';
import { useToast } from '@/shared/hooks/useToast';
import type { Provider } from '@/shared/types/domain';
import { useCreateProvider, useUpdateProvider } from '../hooks/useProviders';
import styles from './ProviderFormModal.module.css';

const providerSchema = z.object({
  name: z.string().trim().min(1, 'Provider name is required').max(150),
  description: z.string().trim().max(2000).optional(),
  
  
  
  logoUrl: z.union([z.string().trim().url('Must be a valid URL').max(500), z.literal('')]).optional(),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Provider | null;
}

const FORM_ID = 'provider-form';

export function ProviderFormModal({ isOpen, onClose, editing = null }: ProviderFormModalProps) {
  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const toast = useToast();
  const mutation = editing ? updateProvider : createProvider;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    values: editing
      ? { name: editing.name, description: editing.description ?? '', logoUrl: editing.logoUrl ?? '' }
      : undefined,
  });

  const nameValue = watch('name');
  const logoUrlValue = watch('logoUrl');

  const handleClose = () => {
    reset();
    mutation.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(editing ? `${values.name} was updated.` : `${values.name} was added to providers.`);
      handleClose();
    };
    const payload = { ...values, logoUrl: values.logoUrl || undefined };

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
      title={editing ? 'Edit provider' : 'Add provider'}
      description="Providers are certification bodies like Red Hat or CompTIA."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending}>
            {editing ? 'Save changes' : 'Add provider'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {mutation.isError && <ErrorBanner error={mutation.error} />}

        <FormField label="Name" error={errors.name?.message} required>
          {(fieldProps) => <Input placeholder="Red Hat" {...fieldProps} {...register('name')} />}
        </FormField>

        <FormField label="Description" error={errors.description?.message} hint="Optional">
          {(fieldProps) => (
            <Textarea
              placeholder="Enterprise Linux training and certification"
              {...fieldProps}
              {...register('description')}
            />
          )}
        </FormField>

        <FormField
          label="Logo URL"
          error={errors.logoUrl?.message}
          hint="Optional — shown next to the provider name"
        >
          {(fieldProps) => (
            <div className={styles.logoField}>
              <ProviderLogo name={nameValue || 'Provider'} logoUrl={logoUrlValue} size={44} />
              <Input
                type="url"
                placeholder="https://example.com/logo.svg"
                {...fieldProps}
                {...register('logoUrl')}
              />
            </div>
          )}
        </FormField>
      </form>
    </Modal>
  );
}
