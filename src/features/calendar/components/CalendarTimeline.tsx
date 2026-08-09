import { memo } from 'react';
import { motion } from 'motion/react';
import { CalendarDays } from 'lucide-react';
import { Skeleton } from '@/shared/components/Skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDate, formatTime } from '@/shared/utils/formatDate';
import { fadeInUp, listItem, staggerContainer } from '@/shared/motion/variants';
import type { CalendarEvent } from '@/shared/types/domain';
import styles from './CalendarTimeline.module.css';

interface CalendarTimelineProps {
  events: CalendarEvent[];
  isLoading: boolean;
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

function CalendarTimelineInner({ events, isLoading }: CalendarTimelineProps) {
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
        description="Your assigned sessions appear here once they're booked."
      />
    );
  }

  const groups = groupByDay(events);

  return (
    <motion.div className={styles.timeline} variants={staggerContainer(0.08)} initial="hidden" animate="show">
      {Array.from(groups.entries()).map(([day, dayEvents]) => (
        <motion.div key={day} className={styles.day} variants={fadeInUp}>
          <h3 className={styles.dayHeader}>{day}</h3>
          <motion.ul className={styles.rail} variants={staggerContainer(0.04)} initial="hidden" animate="show">
            {dayEvents.map((event) => (
              <motion.li key={event.id} className={styles.railItem} variants={listItem}>
                <span className={styles.time}>{formatTime(event.eventDate)}</span>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.card}>{event.title}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      ))}
    </motion.div>
  );
}

export const CalendarTimeline = memo(CalendarTimelineInner);
