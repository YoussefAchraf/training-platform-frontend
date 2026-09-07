import { BadgeCheck } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import type { InstructorSkill } from '@/shared/types/domain';
import styles from './SkillChips.module.css';

interface SkillChipsProps {
  skills: InstructorSkill[];
  emptyText: string;
}




export function SkillChips({ skills, emptyText }: SkillChipsProps) {
  if (skills.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <div className={styles.row}>
      {skills.map((skill) => (
        <span key={skill.trainingId} className={styles.chip}>
          <BadgeCheck size={14} className={styles.icon} aria-hidden="true" />
          {skill.trainingName}
        </span>
      ))}
    </div>
  );
}
