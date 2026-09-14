import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ClipboardCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Avatar } from '@/shared/components/Avatar';
import { StatTile } from '@/shared/components/StatTile';
import { useToast } from '@/shared/hooks/useToast';
import { useStandaloneDeviceClass } from '@/shared/hooks/useMediaQuery';
import { getCertificationExpiryStatus } from '@/shared/utils/certificationExpiry';
import { staggerContainer } from '@/shared/motion/variants';
import { PwaMyInstructorProfilePage } from '@/pwa/pages/PwaMyInstructorProfilePage';
import { useMyInstructorProfile, useUpdateMyInstructorProfile } from '../hooks/useInstructors';
import { InstructorProfileForm } from '../components/InstructorProfileForm';
import type { UpdateInstructorPayload } from '../api/instructorsApi';
import styles from './MyInstructorProfilePage.module.css';

export function MyInstructorProfilePage() {
  const { t } = useTranslation('instructors');
  const isPwaPhone = useStandaloneDeviceClass() === 'phone';
  const profileQuery = useMyInstructorProfile();
  const updateProfile = useUpdateMyInstructorProfile();
  const toast = useToast();

  const handleSubmit = (payload: UpdateInstructorPayload) =>
    updateProfile.mutate(payload, {
      onSuccess: () => toast.success(t('MyInstructorProfilePage.profileUpdated')),
    });

  
  
  
  if (isPwaPhone) {
    return (
      <PwaMyInstructorProfilePage
        profileQuery={profileQuery}
        onSubmit={handleSubmit}
        isSubmitting={updateProfile.isPending}
        submitError={updateProfile.isError ? updateProfile.error : undefined}
      />
    );
  }

  const qualifiedCount = profileQuery.data?.skills.length ?? 0;
  const expiringCount = (profileQuery.data?.skills ?? []).filter(
    (skill) => getCertificationExpiryStatus(skill.certificateExpiresAt) !== 'none',
  ).length;

  return (
    <div>
      <div id="tour-myprofile-header">
        <PageHeader title={t('MyInstructorProfilePage.title')} description={t('MyInstructorProfilePage.description')} />
      </div>

      {profileQuery.isPending && <Spinner />}

      {profileQuery.isError && (
        <ErrorBanner error={profileQuery.error} onRetry={() => profileQuery.refetch()} />
      )}

      {profileQuery.data && (
        <Card id="tour-myprofile-card">
          <div className={styles.header}>
            <Avatar firstname={profileQuery.data.firstname} lastname={profileQuery.data.lastname} size={48} />
            <div className={styles.headerText}>
              <p className={styles.name}>
                {profileQuery.data.firstname} {profileQuery.data.lastname}
              </p>
              <p className={styles.email}>{profileQuery.data.email}</p>
            </div>
          </div>

          <motion.div className={styles.stats} variants={staggerContainer(0.06)} initial="hidden" animate="show">
            <StatTile label={t('MyInstructorProfilePage.statQualified')} value={qualifiedCount} icon={ClipboardCheck} tone="primary" />
            {expiringCount > 0 && (
              <StatTile label={t('MyInstructorProfilePage.statExpiring')} value={expiringCount} icon={AlertTriangle} tone="warning" />
            )}
          </motion.div>

          <InstructorProfileForm
            instructor={profileQuery.data}
            isSubmitting={updateProfile.isPending}
            submitError={updateProfile.isError ? updateProfile.error : undefined}
            onSubmit={handleSubmit}
          />
        </Card>
      )}
    </div>
  );
}
