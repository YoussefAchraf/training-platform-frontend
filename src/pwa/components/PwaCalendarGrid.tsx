import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/shared/components/Skeleton';
import { currentLocale } from '@/shared/utils/formatDate';
import { fadeIn } from '@/shared/motion/variants';
import { expandEventDays } from '@/features/calendar/utils/expandEventDays';
import { paths } from '@/routes/paths';
import type { CalendarEvent } from '@/shared/types/domain';
import styles from './PwaCalendarGrid.module.css';

interface PwaCalendarGridProps {
  events: CalendarEvent[];
  isLoading: boolean;
}

function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function groupEventsByDayKey(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    for (const day of expandEventDays(event)) {
      const key = dayKey(day);
      const existing = groups.get(key);
      if (existing) existing.push(event);
      else groups.set(key, [event]);
    }
  }
  return groups;
}



function heatLevel(count: number): 0 | 1 {
  return count > 0 ? 1 : 0;
}


export function PwaCalendarGrid({ events, isLoading }: PwaCalendarGridProps) {
  const { t } = useTranslation('calendar');
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const eventsByDay = useMemo(() => groupEventsByDayKey(events), [events]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekRows = gridDays.length / 7;
  const dowLabels = t('CalendarHeatmap.dow', { returnObjects: true }) as string[];

  if (isLoading) {
    return <Skeleton height={420} radius="var(--radius-lg)" />;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
          aria-label={t('CalendarHeatmap.previousMonth')}
        >
          <ChevronLeft size={20} />
        </button>
        <span className={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy', { locale: currentLocale() })}</span>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
          aria-label={t('CalendarHeatmap.nextMonth')}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <motion.div
        className={styles.grid}
        style={{ '--week-rows': weekRows } as CSSProperties}
        variants={fadeIn}
        initial="hidden"
        animate="show"
        key={format(currentMonth, 'yyyy-MM')}
      >
        {dowLabels.map((label) => (
          <div key={label} className={styles.dow}>
            {label}
          </div>
        ))}
        {gridDays.map((day) => {
          const key = dayKey(day);
          const dayEvents = eventsByDay.get(key) ?? [];
          const count = dayEvents.length;
          const inMonth = isSameMonth(day, currentMonth);
          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(paths.sessionsForDate(key), { state: { events: dayEvents } })}
              className={[styles.dayCell, styles[`heat${heatLevel(count)}`], !inMonth && styles.muted, isToday(day) && styles.today]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.dateNum}>{format(day, 'd')}</span>
              {count > 0 && <span className={styles.countPill}>{count}</span>}
            </button>
          );
        })}
      </motion.div>

      <p className={styles.hint}>{t('PwaCalendarGrid.hint')}</p>
    </div>
  );
}
