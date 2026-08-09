import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, BellOff } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { roleMeta, userStatusMeta } from '@/shared/utils/statusMeta';
import { paths } from '@/routes/paths';
import { useUpdateOwnProfile } from '../hooks/useUpdateOwnProfile';
import { usePushSubscription } from '@/features/push/hooks/usePushSubscription';
import styles from './AccountPage.module.css';

const profileSchema = z.object({
  firstname: z.string().trim().min(1, 'First name is required').max(100),
  lastname: z.string().trim().min(1, 'Last name is required').max(100),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function AccountPage() {
  const { user, isInstructor } = useAuth();
  const updateProfile = useUpdateOwnProfile();
  const push = usePushSubscription();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? { firstname: user.firstname, lastname: user.lastname } : undefined,
  });

  if (!user) return null;

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values, {
      onSuccess: () => toast.success('Your profile was updated.'),
    });
  });

  const handleTogglePush = async () => {
    if (push.status === 'subscribed') {
      const ok = await push.unsubscribe();
      if (ok) toast.info('Notifications disabled on this device.');
    } else {
      const ok = await push.subscribe();
      if (ok) toast.success('Notifications enabled on this device.');
    }
  };

  return (
    <div>
      <PageHeader title="Account settings" description="Your personal details." />

      <div className={styles.grid}>
        <Card>
          <h3 className={styles.cardTitle}>Profile</h3>
          <form onSubmit={onSubmit} className="stack" noValidate>
            {updateProfile.isError && <ErrorBanner error={updateProfile.error} />}

            <div className={styles.row}>
              <FormField label="First name" error={errors.firstname?.message} required>
                {(fieldProps) => <Input {...fieldProps} {...register('firstname')} />}
              </FormField>
              <FormField label="Last name" error={errors.lastname?.message} required>
                {(fieldProps) => <Input {...fieldProps} {...register('lastname')} />}
              </FormField>
            </div>

            <Button type="submit" isLoading={updateProfile.isPending}>
              Save changes
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className={styles.cardTitle}>Account</h3>
          <dl className={styles.detailList}>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>
                <Badge tone={roleMeta[user.role].tone}>{roleMeta[user.role].label}</Badge>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <Badge tone={userStatusMeta[user.status].tone}>{userStatusMeta[user.status].label}</Badge>
              </dd>
            </div>
          </dl>

          {isInstructor && (
            <Link to={paths.myInstructorProfile} className={styles.instructorLink}>
              Manage your bio and skills
              <ArrowRight size={15} />
            </Link>
          )}
        </Card>

        {push.status !== 'unsupported' && (
          <Card>
            <h3 className={styles.cardTitle}>Notifications</h3>
            {push.error && <ErrorBanner error={new Error(push.error)} />}
            <div className={styles.notificationRow}>
              <div className={styles.notificationText}>
                {push.status === 'subscribed' ? <Bell size={18} /> : <BellOff size={18} />}
                <div>
                  <p className={styles.notificationTitle}>Push notifications</p>
                  <p className={styles.notificationSubtitle}>
                    {push.status === 'subscribed'
                      ? 'Enabled on this device.'
                      : 'Get notified about assignments and approvals on this device.'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={push.status === 'subscribed' ? 'outline' : 'primary'}
                size="sm"
                isLoading={push.isBusy || push.status === 'checking'}
                onClick={handleTogglePush}
              >
                {push.status === 'subscribed' ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
