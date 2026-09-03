import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { roleMeta, userStatusMeta } from '@/shared/utils/statusMeta';
import { roleNameOf, type User } from '@/shared/types/domain';
import { useUpdateUserByAdmin } from '../hooks/useAdminUsers';

function buildEditUserSchema(t: TFunction<'admin'>) {
  return z.object({
    firstname: z.string().trim().min(1, t('EditUserModal.errors.firstnameRequired')).max(100),
    lastname: z.string().trim().min(1, t('EditUserModal.errors.lastnameRequired')).max(100),
    email: z.email(t('EditUserModal.errors.emailInvalid')),
    role: z.enum(['Sales', 'Manager', 'Instructor', 'SuperAdmin'], { error: t('EditUserModal.errors.roleRequired') }),
    status: z.enum(['pending', 'approved', 'rejected', 'deactivated'], { error: t('EditUserModal.errors.statusRequired') }),
  });
}

type EditUserFormValues = z.infer<ReturnType<typeof buildEditUserSchema>>;

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
}

const FORM_ID = 'edit-user-form';

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const { t } = useTranslation('admin');
  const updateUser = useUpdateUserByAdmin();
  const toast = useToast();
  const editUserSchema = useMemo(() => buildEditUserSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    values: user
      ? {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          
          
          
          
          role: roleNameOf(user) as EditUserFormValues['role'],
          status: user.status,
        }
      : undefined,
  });

  if (!user) return null;

  const onSubmit = handleSubmit((values) => {
    updateUser.mutate(
      { id: user.id, payload: values },
      {
        onSuccess: () => {
          toast.success(t('EditUserModal.userUpdated', { name: `${values.firstname} ${values.lastname}` }));
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={Boolean(user)}
      onClose={onClose}
      title={t('EditUserModal.title', { name: `${user.firstname} ${user.lastname}` })}
      description={t('EditUserModal.description')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('EditUserModal.cancel')}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateUser.isPending}>
            {t('EditUserModal.save')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {updateUser.isError && <ErrorBanner error={updateUser.error} />}

        <div className="stack">
          <FormField label={t('EditUserModal.fields.firstname')} error={errors.firstname?.message} required>
            {(fieldProps) => <Input {...fieldProps} {...register('firstname')} />}
          </FormField>
          <FormField label={t('EditUserModal.fields.lastname')} error={errors.lastname?.message} required>
            {(fieldProps) => <Input {...fieldProps} {...register('lastname')} />}
          </FormField>
        </div>

        <FormField label={t('EditUserModal.fields.email')} error={errors.email?.message} required>
          {(fieldProps) => <Input type="email" {...fieldProps} {...register('email')} />}
        </FormField>

        <FormField label={t('EditUserModal.fields.role')} error={errors.role?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('role')}>
              <option value="Sales">{t(roleMeta.Sales.labelKey)}</option>
              <option value="Manager">{t(roleMeta.Manager.labelKey)}</option>
              <option value="Instructor">{t(roleMeta.Instructor.labelKey)}</option>
              <option value="SuperAdmin">{t(roleMeta.SuperAdmin.labelKey)}</option>
            </Select>
          )}
        </FormField>

        <FormField label={t('EditUserModal.fields.status')} error={errors.status?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('status')}>
              <option value="pending">{t(userStatusMeta.pending.labelKey)}</option>
              <option value="approved">{t(userStatusMeta.approved.labelKey)}</option>
              <option value="rejected">{t(userStatusMeta.rejected.labelKey)}</option>
              <option value="deactivated">{t(userStatusMeta.deactivated.labelKey)}</option>
            </Select>
          )}
        </FormField>
      </form>
    </Modal>
  );
}
