import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import type { Client } from '@/shared/types/domain';
import { useCreateClient, useUpdateClient } from '../hooks/useClients';

const clientSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(150),
  email: z.union([z.email('Enter a valid email address'), z.literal('')]).optional(),
  phone: z.string().trim().max(30).optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Client | null;
}

const FORM_ID = 'client-form';

export function ClientFormModal({ isOpen, onClose, editing = null }: ClientFormModalProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const toast = useToast();
  const mutation = editing ? updateClient : createClient;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    values: editing
      ? { companyName: editing.companyName, email: editing.email ?? '', phone: editing.phone ?? '' }
      : undefined,
  });

  const handleClose = () => {
    reset();
    mutation.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(editing ? `${values.companyName} was updated.` : `${values.companyName} was added to clients.`);
      handleClose();
    };

    if (editing) {
      updateClient.mutate({ id: editing.id, payload: values }, { onSuccess });
    } else {
      createClient.mutate(values, { onSuccess });
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editing ? 'Edit client' : 'Add client'}
      description="The company you're delivering a training session for."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending}>
            {editing ? 'Save changes' : 'Add client'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {mutation.isError && <ErrorBanner error={mutation.error} />}

        <FormField label="Company name" error={errors.companyName?.message} required>
          {(fieldProps) => <Input placeholder="Acme Corp" {...fieldProps} {...register('companyName')} />}
        </FormField>

        <FormField label="Email" error={errors.email?.message} hint="Optional">
          {(fieldProps) => (
            <Input type="email" placeholder="contact@acme.com" {...fieldProps} {...register('email')} />
          )}
        </FormField>

        <FormField label="Phone" error={errors.phone?.message} hint="Optional">
          {(fieldProps) => <Input type="tel" placeholder="+1 555 000 1234" {...fieldProps} {...register('phone')} />}
        </FormField>
      </form>
    </Modal>
  );
}
