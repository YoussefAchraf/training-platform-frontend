import { useTranslation } from 'react-i18next';
import { Select } from '@/shared/components/Select';
import styles from './CalendarScopePicker.module.css';

export type CalendarScopeRole = 'general' | 'Manager' | 'Sales' | 'Instructor';

export interface CalendarScopePerson {
  id: number;
  name: string;
}

interface CalendarScopePickerProps {
  role: CalendarScopeRole;
  onRoleChange: (role: CalendarScopeRole) => void;
  personId: number | null;
  onPersonChange: (id: number) => void;
  people: CalendarScopePerson[];
}





export function CalendarScopePicker({ role, onRoleChange, personId, onPersonChange, people }: CalendarScopePickerProps) {
  const { t } = useTranslation('calendar');

  return (
    <div className={styles.row} id="tour-calendar-scope">
      <div className={styles.field}>
        <label className={styles.label} htmlFor="calendar-scope-role">
          {t('CalendarScopePicker.roleLabel')}
        </label>
        <Select
          id="calendar-scope-role"
          value={role}
          onChange={(event) => onRoleChange(event.target.value as CalendarScopeRole)}
        >
          <option value="general">{t('CalendarScopePicker.general')}</option>
          <option value="Manager">{t('CalendarScopePicker.manager')}</option>
          <option value="Sales">{t('CalendarScopePicker.sales')}</option>
          <option value="Instructor">{t('CalendarScopePicker.instructor')}</option>
        </Select>
      </div>

      {role !== 'general' && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="calendar-scope-person">
            {t('CalendarScopePicker.personLabel')}
          </label>
          {people.length === 0 ? (
            <p className={styles.noPeople}>{t('CalendarScopePicker.noPeople')}</p>
          ) : (
            <Select
              id="calendar-scope-person"
              value={personId ?? ''}
              onChange={(event) => onPersonChange(Number(event.target.value))}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
