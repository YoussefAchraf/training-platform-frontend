import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import type { Training } from '@/shared/types/domain';
import { defaultInstructorFilters, hasActiveInstructorFilters, type InstructorFilters } from '../utils/instructorFilters';
import styles from './InstructorsFilterToolbar.module.css';

interface InstructorsFilterToolbarProps {
  filters: InstructorFilters;
  onChange: (filters: InstructorFilters) => void;
  trainings: Training[];
}

export function InstructorsFilterToolbar({ filters, onChange, trainings }: InstructorsFilterToolbarProps) {
  const { t } = useTranslation('instructors');
  const active = hasActiveInstructorFilters(filters);

  function set<K extends keyof InstructorFilters>(key: K, value: InstructorFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className={styles.toolbar} id="tour-instructors-filters">
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <Input
          type="search"
          value={filters.search}
          onChange={(event) => set('search', event.target.value)}
          placeholder={t('InstructorsFilterToolbar.searchPlaceholder')}
          aria-label={t('InstructorsFilterToolbar.searchPlaceholder')}
          className={styles.searchInput}
        />
      </div>

      <Select
        value={filters.trainingId}
        onChange={(event) => set('trainingId', event.target.value === 'all' ? 'all' : Number(event.target.value))}
        aria-label={t('InstructorsFilterToolbar.trainingLabel')}
        className={styles.select}
      >
        <option value="all">{t('InstructorsFilterToolbar.allTrainings')}</option>
        {trainings.map((training) => (
          <option key={training.id} value={training.id}>
            {training.name}
          </option>
        ))}
      </Select>

      {active && (
        <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={() => onChange(defaultInstructorFilters)}>
          {t('InstructorsFilterToolbar.clearFilters')}
        </Button>
      )}
    </div>
  );
}
