import { memo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { Skeleton } from '@/shared/components/Skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { currentLocale, formatTime } from '@/shared/utils/formatDate';
import { fadeInUp, listItem, staggerContainer } from '@/shared/motion/variants';
import type { CalendarEvent } from '@/shared/types/domain';
import { expandEventDays } from '../utils/expandEventDays';
import styles from './CalendarAgenda.module.css';

interface CalendarAgendaProps {
  events: CalendarEvent[];
  isLoading: boolean;
  renderActions?: (event: CalendarEvent) => ReactNode;
}

interface DayGroup {
  key: string;
  date: Date;
  events: CalendarEvent[];
}




function groupByDay(events: CalendarEvent[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const event of events) {
    for (const day of expandEventDays(event)) {
      const key = format(day, 'yyyy-MM-dd');
      const existing = groups.get(key);
      if (existing) {
        existing.events.push(event);
      } else {
        groups.set(key, { key, date: day, events: [event] });
      }
    }
  }
  return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

function CalendarAgendaInner({ events, isLoading, renderActions }: CalendarAgendaProps) {
  const { t } = useTranslation('calendar');
  if (isLoading) {
    return (
      <div className={styles.skeletonList}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height={64} radius="var(--radius-md)" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={t('CalendarAgenda.nothingScheduled')}
        description={t('CalendarAgenda.nothingScheduledDescription')}
      />
    );
  }

  const groups = groupByDay(events);

  return (
    <motion.div className={styles.agenda} variants={staggerContainer(0.08)} initial="hidden" animate="show">
      {groups.map(({ key, date, events: dayEvents }) => (
        <motion.div key={key} className={styles.group} variants={fadeInUp}>
          <h3 className={styles.groupTitle}>{format(date, 'EEEE, MMM d, yyyy', { locale: currentLocale() })}</h3>
          <motion.ul
            className={styles.eventList}
            variants={staggerContainer(0.04)}
            initial="hidden"
            animate="show"
          >
            {dayEvents.map((event) => (
              <motion.li key={event.id} className={styles.event} variants={listItem}>
                <div className={styles.eventTime}>{formatTime(event.eventDate)}</div>
                <div className={styles.eventTitle}>{event.title}</div>
                {renderActions && <div className={styles.eventActions}>{renderActions(event)}</div>}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      ))}
    </motion.div>
  );
}

export const CalendarAgenda = memo(CalendarAgendaInner);
