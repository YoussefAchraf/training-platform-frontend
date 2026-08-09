import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { CalendarDays } from 'lucide-react';
import { Skeleton } from '@/shared/components/Skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDate, formatTime } from '@/shared/utils/formatDate';
import { fadeInUp, listItem, staggerContainer } from '@/shared/motion/variants';
import type { CalendarEvent } from '@/shared/types/domain';
import styles from './CalendarAgenda.module.css';

interface CalendarAgendaProps {
  events: CalendarEvent[];
  isLoading: boolean;
  renderActions?: (event: CalendarEvent) => ReactNode;
}

function groupByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = formatDate(event.eventDate, 'EEEE, MMM d, yyyy');
    const existing = groups.get(key);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(key, [event]);
    }
  }
  return groups;
}

function CalendarAgendaInner({ events, isLoading, renderActions }: CalendarAgendaProps) {
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
        title="Nothing scheduled"
        description="Calendar events appear here once sessions are booked."
      />
    );
  }

  const groups = groupByDay(events);

  return (
    <motion.div className={styles.agenda} variants={staggerContainer(0.08)} initial="hidden" animate="show">
      {Array.from(groups.entries()).map(([day, dayEvents]) => (
        <motion.div key={day} className={styles.group} variants={fadeInUp}>
          <h3 className={styles.groupTitle}>{day}</h3>
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
