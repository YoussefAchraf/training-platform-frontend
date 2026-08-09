import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatTime } from '@/shared/utils/formatDate';
import { fadeIn, listItem, staggerContainer } from '@/shared/motion/variants';
import type { CalendarEvent } from '@/shared/types/domain';
import styles from './CalendarHeatmap.module.css';

interface CalendarHeatmapProps {
  events: CalendarEvent[];
  isLoading: boolean;
}

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function groupEventsByDayKey(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = event.eventDate.slice(0, 10);
    const existing = groups.get(key);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(key, [event]);
    }
  }
  return groups;
}



function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (count <= 0) return 0;
  if (count >= 5) return 5;
  return count as 1 | 2 | 3 | 4;
}

export function CalendarHeatmap({ events, isLoading }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const eventsByDay = useMemo(() => groupEventsByDayKey(events), [events]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  
  
  
  
  const weekRows = gridDays.length / 7;

  const selectedEvents = (eventsByDay.get(dayKey(selectedDate)) ?? [])
    .slice()
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  if (isLoading) {
    return <Skeleton height={520} radius="var(--radius-lg)" />;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.detail}>
        <div>
          <p className={styles.detailDate}>{format(selectedDate, 'EEEE, MMM d')}</p>
          <p className={styles.detailSub}>
            {selectedEvents.length === 0
              ? 'No trainings scheduled'
              : `${selectedEvents.length} training${selectedEvents.length === 1 ? '' : 's'} scheduled`}
          </p>
        </div>

        {selectedEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Nothing this day" description="Pick another day on the calendar." />
        ) : (
          <motion.div
            className={styles.eventList}
            variants={staggerContainer(0.04)}
            initial="hidden"
            animate="show"
            key={dayKey(selectedDate)}
          >
            {selectedEvents.map((event) => (
              <motion.div key={event.id} className={styles.eventCard} variants={listItem}>
                <p className={styles.eventTitle}>{event.title}</p>
                <p className={styles.eventTime}>
                  <Clock size={12} /> {formatTime(event.eventDate)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className={styles.main}>
        <div className={styles.toolbar}>
          <div className={styles.monthNav}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</span>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setCurrentMonth(today);
              setSelectedDate(today);
            }}
          >
            Today
          </Button>
        </div>

        <motion.div
          className={styles.grid}
          style={{ '--week-rows': weekRows } as CSSProperties}
          variants={fadeIn}
          initial="hidden"
          animate="show"
          key={format(currentMonth, 'yyyy-MM')}
        >
          {DOW_LABELS.map((label) => (
            <div key={label} className={styles.dow}>
              {label}
            </div>
          ))}
          {gridDays.map((day) => {
            const key = dayKey(day);
            const count = eventsByDay.get(key)?.length ?? 0;
            const inMonth = isSameMonth(day, currentMonth);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={[
                  styles.dayCell,
                  styles[`heat${heatLevel(count)}`],
                  !inMonth && styles.muted,
                  isToday(day) && styles.today,
                  isSameDay(day, selectedDate) && styles.selected,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles.dateNum}>{format(day, 'd')}</span>
                {count > 0 && <span className={styles.countPill}>{count}</span>}
              </button>
            );
          })}
        </motion.div>

        <div className={styles.legend}>
          <span>Fewer</span>
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <span key={level} className={[styles.legendSquare, styles[`heat${level}`]].join(' ')} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
