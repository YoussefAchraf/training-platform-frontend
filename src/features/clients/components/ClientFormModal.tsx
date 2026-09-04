import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { CountrySelect } from '@/shared/components/CountrySelect';
import { PhoneInput } from '@/shared/components/PhoneInput';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import type { Client } from '@/shared/types/domain';
import { COUNTRY_CODES } from '@/shared/data/countries';
import { useCreateClient, useUpdateClient } from '../hooks/useClients';

function buildClientSchema(t: TFunction<'clients'>) {
  return z
    .object({
      companyName: z.string().trim().min(1, t('ClientFormModal.errors.companyNameRequired')).max(150),
      email: z.union([z.email(t('ClientFormModal.errors.emailInvalid')), z.literal('')]).optional(),
      country: z.union([z.enum(COUNTRY_CODES as [string, ...string[]]), z.literal('')]).optional(),
      phone: z.string().trim().max(30).optional(),
    })
    .refine(
      (data) => {
        if (!data.phone || !data.country) return true;
        return isValidPhoneNumber(data.phone, data.country as CountryCode);
      },
      { message: t('ClientFormModal.errors.phoneInvalid'), path: ['phone'] },
    );
}

type ClientFormValues = z.infer<ReturnType<typeof buildClientSchema>>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing?: Client | null;
}

const FORM_ID = 'client-form';

export function ClientFormModal({ isOpen, onClose, editing = null }: ClientFormModalProps) {
  const { t } = useTranslation('clients');
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const toast = useToast();
  const mutation = editing ? updateClient : createClient;
  const clientSchema = useMemo(() => buildClientSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    values: editing
      ? {
          companyName: editing.companyName,
          email: editing.email ?? '',
          country: editing.country ?? '',
          phone: editing.phone ?? '',
        }
      : undefined,
  });

  const countryValue = watch('country') ?? '';
  const phoneValue = watch('phone') ?? '';

  const handleClose = () => {
    reset();
    mutation.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(
        editing
          ? t('ClientFormModal.clientUpdated', { name: values.companyName })
          : t('ClientFormModal.clientAdded', { name: values.companyName }),
      );
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
      title={editing ? t('ClientFormModal.editTitle') : t('ClientFormModal.addTitle')}
      description={t('ClientFormModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            {t('ClientFormModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={mutation.isPending}>
            {editing ? t('ClientFormModal.saveChanges') : t('ClientFormModal.addClient')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {mutation.isError && <ErrorBanner error={mutation.error} />}

        <FormField label={t('ClientFormModal.companyNameLabel')} error={errors.companyName?.message} required>
          {(fieldProps) => <Input placeholder={t('ClientFormModal.companyNamePlaceholder')} {...fieldProps} {...register('companyName')} />}
        </FormField>

        <FormField label={t('ClientFormModal.emailLabel')} error={errors.email?.message} hint={t('ClientFormModal.emailOptionalHint')}>
          {(fieldProps) => (
            <Input type="email" placeholder={t('ClientFormModal.emailPlaceholder')} {...fieldProps} {...register('email')} />
          )}
        </FormField>

        <FormField label={t('ClientFormModal.countryLabel')} error={errors.country?.message} hint={t('ClientFormModal.countryOptionalHint')}>
          {(fieldProps) => (
            <CountrySelect
              placeholder={t('ClientFormModal.countryPlaceholder')}
              value={countryValue}
              onChange={(code) => {
                setValue('country', code, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                
                
                
                setValue('phone', '', { shouldDirty: true });
              }}
              {...fieldProps}
            />
          )}
        </FormField>

        <FormField
          label={t('ClientFormModal.phoneLabel')}
          error={errors.phone?.message}
          hint={countryValue ? t('ClientFormModal.phoneOptionalHint') : t('ClientFormModal.phoneNoCountryHint')}
        >
          {(fieldProps) => (
            <PhoneInput
              country={countryValue}
              value={phoneValue}
              onChange={(value) => setValue('phone', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
              placeholder={countryValue ? t('ClientFormModal.phoneNationalPlaceholder') : t('ClientFormModal.phonePlaceholder')}
              {...fieldProps}
            />
          )}
        </FormField>
      </form>
    </Modal>
  );
}
