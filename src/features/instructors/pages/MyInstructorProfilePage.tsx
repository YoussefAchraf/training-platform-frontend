import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Avatar } from '@/shared/components/Avatar';
import { useToast } from '@/shared/hooks/useToast';
import { useMyInstructorProfile, useUpdateMyInstructorProfile } from '../hooks/useInstructors';
import { InstructorProfileForm } from '../components/InstructorProfileForm';
import styles from './MyInstructorProfilePage.module.css';

export function MyInstructorProfilePage() {
  const { t } = useTranslation('instructors');
  const profileQuery = useMyInstructorProfile();
  const updateProfile = useUpdateMyInstructorProfile();
  const toast = useToast();

  return (
    <div>
      <PageHeader title={t('MyInstructorProfilePage.title')} description={t('MyInstructorProfilePage.description')} />

      {profileQuery.isPending && <Spinner />}

      {profileQuery.isError && (
        <ErrorBanner error={profileQuery.error} onRetry={() => profileQuery.refetch()} />
      )}

      {profileQuery.data && (
        <Card>
          <div className={styles.header}>
            <Avatar firstname={profileQuery.data.firstname} lastname={profileQuery.data.lastname} size={48} />
            <div className={styles.headerText}>
              <p className={styles.name}>
                {profileQuery.data.firstname} {profileQuery.data.lastname}
              </p>
              <p className={styles.email}>{profileQuery.data.email}</p>
            </div>
          </div>

          <InstructorProfileForm
            instructor={profileQuery.data}
            isSubmitting={updateProfile.isPending}
            submitError={updateProfile.isError ? updateProfile.error : undefined}
            onSubmit={(payload) =>
              updateProfile.mutate(payload, {
                onSuccess: () => toast.success(t('MyInstructorProfilePage.profileUpdated')),
              })
            }
          />
        </Card>
      )}
    </div>
  );
}
