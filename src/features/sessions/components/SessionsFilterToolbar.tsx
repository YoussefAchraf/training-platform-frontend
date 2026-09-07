import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { sessionStatusMeta } from '@/shared/utils/statusMeta';
import type { Instructor, SessionLocationType, SessionStatus } from '@/shared/types/domain';
import { defaultSessionFilters, hasActiveSessionFilters, type SessionFilters } from '../utils/sessionFilters';
import styles from './SessionsFilterToolbar.module.css';

const SESSION_STATUSES: SessionStatus[] = ['scheduled', 'ongoing', 'completed', 'cancelled'];
const LOCATION_TYPES: SessionLocationType[] = ['onsite', 'remote'];

interface SessionsFilterToolbarProps {
  filters: SessionFilters;
  onChange: (filters: SessionFilters) => void;
  instructors: Instructor[];
  showInstructorFilter: boolean;
}

export function SessionsFilterToolbar({ filters, onChange, instructors, showInstructorFilter }: SessionsFilterToolbarProps) {
  const { t } = useTranslation('sessions');
  const active = hasActiveSessionFilters(filters);

  function set<K extends keyof SessionFilters>(key: K, value: SessionFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className={styles.toolbar} id="tour-sessions-filters">
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <Input
          type="search"
          value={filters.search}
          onChange={(event) => set('search', event.target.value)}
          placeholder={t('SessionsFilterToolbar.searchPlaceholder')}
          aria-label={t('SessionsFilterToolbar.searchPlaceholder')}
          className={styles.searchInput}
        />
      </div>

      <Select
        value={filters.status}
        onChange={(event) => set('status', event.target.value as SessionFilters['status'])}
        aria-label={t('SessionsFilterToolbar.statusLabel')}
        className={styles.select}
      >
        <option value="all">{t('SessionsFilterToolbar.allStatuses')}</option>
        {SESSION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {t(sessionStatusMeta[status].labelKey)}
          </option>
        ))}
      </Select>

      <Select
        value={filters.location}
        onChange={(event) => set('location', event.target.value as SessionFilters['location'])}
        aria-label={t('SessionsFilterToolbar.locationLabel')}
        className={styles.select}
      >
        <option value="all">{t('SessionsFilterToolbar.allLocations')}</option>
        {LOCATION_TYPES.map((location) => (
          <option key={location} value={location}>
            {t(`SessionsPage.${location}`)}
          </option>
        ))}
      </Select>

      {showInstructorFilter && (
        <Select
          value={filters.instructorId}
          onChange={(event) => set('instructorId', event.target.value === 'all' ? 'all' : Number(event.target.value))}
          aria-label={t('SessionsFilterToolbar.instructorLabel')}
          className={styles.select}
        >
          <option value="all">{t('SessionsFilterToolbar.allInstructors')}</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.firstname} {instructor.lastname}
            </option>
          ))}
        </Select>
      )}

      {active && (
        <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={() => onChange(defaultSessionFilters)}>
          {t('SessionsFilterToolbar.clearFilters')}
        </Button>
      )}
    </div>
  );
}
