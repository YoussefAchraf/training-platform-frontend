import { Mail, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/components/Card';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { SkillChips } from '@/features/dashboard/components/SkillChips';
import { fadeInUp } from '@/shared/motion/variants';
import type { Instructor } from '@/shared/types/domain';
import styles from './InstructorCard.module.css';

interface InstructorCardProps {
  instructor: Instructor;
  canEdit: boolean;
  onEdit: () => void;
}

export function InstructorCard({ instructor, canEdit, onEdit }: InstructorCardProps) {
  const { t } = useTranslation('instructors');
  const fullName = `${instructor.firstname} ${instructor.lastname}`;

  return (
    <Card className={styles.card} variants={fadeInUp}>
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.editButton}
          onClick={onEdit}
          aria-label={t('InstructorsPage.editAria', { name: fullName })}
        >
          <Pencil size={14} />
        </Button>
      )}

      <div className={styles.header}>
        <Avatar firstname={instructor.firstname} lastname={instructor.lastname} size={56} />
        <div className={styles.identity}>
          <h3 className={styles.name}>{fullName}</h3>
          <p className={styles.email}>
            <Mail size={12} aria-hidden="true" />
            <span className={styles.emailText}>{instructor.email}</span>
          </p>
        </div>
      </div>

      {instructor.bio && <p className={styles.bio}>{instructor.bio}</p>}

      <div className={styles.skillsSection}>
        <p className={styles.skillsLabel}>{t('InstructorsPage.columnTrainings')}</p>
        {instructor.skills.length > 0 ? (
          <SkillChips skills={instructor.skills} emptyText="" />
        ) : (
          <p className={styles.noSkills}>{t('InstructorsPage.noSkills')}</p>
        )}
      </div>
    </Card>
  );
}
