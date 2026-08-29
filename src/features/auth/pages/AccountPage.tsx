import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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

function buildProfileSchema(t: TFunction<'auth'>) {
  return z.object({
    firstname: z.string().trim().min(1, t('AccountPage.errors.firstnameRequired')).max(100),
    lastname: z.string().trim().min(1, t('AccountPage.errors.lastnameRequired')).max(100),
  });
}

type ProfileFormValues = z.infer<ReturnType<typeof buildProfileSchema>>;

export function AccountPage() {
  const { t } = useTranslation('auth');
  const { user, isInstructor } = useAuth();
  const updateProfile = useUpdateOwnProfile();
  const push = usePushSubscription();
  const toast = useToast();
  const profileSchema = useMemo(() => buildProfileSchema(t), [t]);

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
      onSuccess: () => toast.success(t('AccountPage.profileUpdated')),
    });
  });

  const handleTogglePush = async () => {
    if (push.status === 'subscribed') {
      const ok = await push.unsubscribe();
      if (ok) toast.info(t('AccountPage.pushDisabledOnDevice'));
    } else {
      const ok = await push.subscribe();
      if (ok) toast.success(t('AccountPage.pushEnabledOnDevice'));
    }
  };

  return (
    <div>
      <div id="tour-account-header">
        <PageHeader title={t('AccountPage.title')} description={t('AccountPage.description')} />
      </div>

      <div className={styles.grid}>
        <Card id="tour-account-profile">
          <h3 className={styles.cardTitle}>{t('AccountPage.profileCardTitle')}</h3>
          <form onSubmit={onSubmit} className="stack" noValidate>
            {updateProfile.isError && <ErrorBanner error={updateProfile.error} />}

            <div className={styles.row}>
              <FormField label={t('AccountPage.firstnameLabel')} error={errors.firstname?.message} required>
                {(fieldProps) => <Input {...fieldProps} {...register('firstname')} />}
              </FormField>
              <FormField label={t('AccountPage.lastnameLabel')} error={errors.lastname?.message} required>
                {(fieldProps) => <Input {...fieldProps} {...register('lastname')} />}
              </FormField>
            </div>

            <Button type="submit" isLoading={updateProfile.isPending}>
              {t('AccountPage.saveChanges')}
            </Button>
          </form>
        </Card>

        <Card id="tour-account-details">
          <h3 className={styles.cardTitle}>{t('AccountPage.accountCardTitle')}</h3>
          <dl className={styles.detailList}>
            <div>
              <dt>{t('AccountPage.emailLabel')}</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>{t('AccountPage.roleLabel')}</dt>
              <dd>
                <Badge tone={roleMeta[user.role].tone}>{t(roleMeta[user.role].labelKey)}</Badge>
              </dd>
            </div>
            <div>
              <dt>{t('AccountPage.statusLabel')}</dt>
              <dd>
                <Badge tone={userStatusMeta[user.status].tone}>{t(userStatusMeta[user.status].labelKey)}</Badge>
              </dd>
            </div>
          </dl>

          {isInstructor && (
            <Link to={paths.myInstructorProfile} className={styles.instructorLink}>
              {t('AccountPage.manageBioAndSkills')}
              <ArrowRight size={15} />
            </Link>
          )}
        </Card>

        {push.status !== 'unsupported' && (
          <Card id="tour-account-notifications">
            <h3 className={styles.cardTitle}>{t('AccountPage.notificationsCardTitle')}</h3>
            {push.error && <ErrorBanner error={new Error(push.error)} />}
            <div className={styles.notificationRow}>
              <div className={styles.notificationText}>
                {push.status === 'subscribed' ? <Bell size={18} /> : <BellOff size={18} />}
                <div>
                  <p className={styles.notificationTitle}>{t('AccountPage.pushNotifications')}</p>
                  <p className={styles.notificationSubtitle}>
                    {push.status === 'subscribed'
                      ? t('AccountPage.pushEnabled')
                      : t('AccountPage.pushDisabledHint')}
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
                {push.status === 'subscribed' ? t('AccountPage.disable') : t('AccountPage.enable')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
