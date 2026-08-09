import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { roleNameOf, type User } from '@/shared/types/domain';
import { useUpdateUserByAdmin } from '../hooks/useAdminUsers';

const editUserSchema = z.object({
  firstname: z.string().trim().min(1, 'First name is required').max(100),
  lastname: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.email('Enter a valid email address'),
  role: z.enum(['Sales', 'Manager', 'Instructor', 'SuperAdmin'], { error: 'Select a role' }),
  status: z.enum(['pending', 'approved', 'rejected', 'deactivated'], { error: 'Select a status' }),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
}

const FORM_ID = 'edit-user-form';

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const updateUser = useUpdateUserByAdmin();
  const toast = useToast();

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
          role: roleNameOf(user)!,
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
          toast.success(`${values.firstname} ${values.lastname} was updated.`);
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={Boolean(user)}
      onClose={onClose}
      title={`Edit ${user.firstname} ${user.lastname}`}
      description="Changes to role or status take effect immediately."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={updateUser.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id={FORM_ID} className="stack" noValidate>
        {updateUser.isError && <ErrorBanner error={updateUser.error} />}

        <div className="stack">
          <FormField label="First name" error={errors.firstname?.message} required>
            {(fieldProps) => <Input {...fieldProps} {...register('firstname')} />}
          </FormField>
          <FormField label="Last name" error={errors.lastname?.message} required>
            {(fieldProps) => <Input {...fieldProps} {...register('lastname')} />}
          </FormField>
        </div>

        <FormField label="Email" error={errors.email?.message} required>
          {(fieldProps) => <Input type="email" {...fieldProps} {...register('email')} />}
        </FormField>

        <FormField label="Role" error={errors.role?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('role')}>
              <option value="Sales">Sales</option>
              <option value="Manager">Manager</option>
              <option value="Instructor">Instructor</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </Select>
          )}
        </FormField>

        <FormField label="Status" error={errors.status?.message} required>
          {(fieldProps) => (
            <Select {...fieldProps} {...register('status')}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="deactivated">Deactivated</option>
            </Select>
          )}
        </FormField>
      </form>
    </Modal>
  );
}
