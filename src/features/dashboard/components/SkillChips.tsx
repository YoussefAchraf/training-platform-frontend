import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/shared/components/EmptyState';
import { CertificationStatusPill } from '@/shared/components/CertificationStatusPill';
import { getCertificationExpiryStatus } from '@/shared/utils/certificationExpiry';
import type { InstructorSkill } from '@/shared/types/domain';
import styles from './SkillChips.module.css';

interface SkillChipsProps {
  skills: InstructorSkill[];
  emptyText: string;
}

export function SkillChips({ skills, emptyText }: SkillChipsProps) {
  const { t } = useTranslation('dashboard');

  if (skills.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <div className={styles.row}>
      {skills.map((skill) => {
        const status = getCertificationExpiryStatus(skill.certificateExpiresAt);
        return (
          <CertificationStatusPill
            key={skill.trainingId}
            status={status}
            title={
              status === 'expired'
                ? t('SkillChips.certificateExpired')
                : status === 'expiring'
                  ? t('SkillChips.certificateExpiringSoon')
                  : undefined
            }
          >
            {skill.trainingName}
          </CertificationStatusPill>
        );
      })}
    </div>
  );
}
