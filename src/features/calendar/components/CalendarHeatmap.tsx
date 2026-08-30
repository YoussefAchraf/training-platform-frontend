import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { currentLocale, formatDate, formatTime } from '@/shared/utils/formatDate';
import { fadeIn, listItem, staggerContainer } from '@/shared/motion/variants';
import type { CalendarEvent } from '@/shared/types/domain';
import { paths } from '@/routes/paths';
import { expandEventDays } from '../utils/expandEventDays';
import styles from './CalendarHeatmap.module.css';

interface CalendarHeatmapProps {
  events: CalendarEvent[];
  isLoading: boolean;
  renderActions?: (event: CalendarEvent) => ReactNode;
}

function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}



function groupEventsByDayKey(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const days = expandEventDays(event);
    for (const day of days) {
      const key = dayKey(day);
      const existing = groups.get(key);
      if (existing) {
        existing.push(event);
      } else {
        groups.set(key, [event]);
      }
    }
  }
  return groups;
}




function formatEventWhen(event: CalendarEvent): string {
  if (!event.endDate || event.eventDate.slice(0, 10) === event.endDate.slice(0, 10)) {
    return formatTime(event.eventDate);
  }
  return `${formatDate(event.eventDate, 'MMM d')} – ${formatDate(event.endDate, 'MMM d')}`;
}

// Single "has sessions" state, not a graduated ramp - the count pill on the
// cell already shows exactly how many, so the color itself only needs to
// answer "anything scheduled today or not".
function heatLevel(count: number): 0 | 1 {
  return count > 0 ? 1 : 0;
}

export function CalendarHeatmap({ events, isLoading, renderActions }: CalendarHeatmapProps) {
  const { t } = useTranslation('calendar');
  const dowLabels = t('CalendarHeatmap.dow', { returnObjects: true }) as string[];
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const eventsByDay = useMemo(() => groupEventsByDayKey(events), [events]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Months span 5 or 6 weeks - pass the real count through as a CSS
  // variable so week rows can flex to fill the available height evenly
  // (grid-template-rows: repeat(var(--week-rows), 1fr)) instead of a
  // hardcoded 6 leaving a blank row on 5-week months.
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
          <p className={styles.detailDate}>{format(selectedDate, 'EEEE, MMM d', { locale: currentLocale() })}</p>
          <p className={styles.detailSub}>
            {selectedEvents.length === 0
              ? t('CalendarHeatmap.noTrainingsScheduled')
              : t('CalendarHeatmap.trainingsScheduled', { count: selectedEvents.length })}
          </p>
        </div>

        {selectedEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title={t('CalendarHeatmap.nothingThisDay')} description={t('CalendarHeatmap.pickAnotherDay')} />
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
                <button
                  type="button"
                  className={styles.eventCardMain}
                  onClick={() => navigate(paths.sessionDetail(event.sessionId))}
                >
                  <p className={styles.eventTitle}>{event.title}</p>
                  <p className={styles.eventTime}>
                    <Clock size={12} /> {formatEventWhen(event)}
                  </p>
                </button>
                {renderActions && <div className={styles.eventCardActions}>{renderActions(event)}</div>}
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
              aria-label={t('CalendarHeatmap.previousMonth')}
            >
              <ChevronLeft size={18} />
            </button>
            <span className={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy', { locale: currentLocale() })}</span>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
              aria-label={t('CalendarHeatmap.nextMonth')}
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
            {t('CalendarHeatmap.today')}
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
          {dowLabels.map((label) => (
            <div key={label} className={styles.dow}>
              {label}
            </div>
          ))}
          {gridDays.map((day, index) => {
            const key = dayKey(day);
            const dayEvents = eventsByDay.get(key) ?? [];
            const count = dayEvents.length;
            const inMonth = isSameMonth(day, currentMonth);
            // gridDays starts on Monday (weekStartsOn: 1), so index % 7 is
            // the column: 0 = leftmost, 6 = rightmost. A centered preview
            // would run past the grid's edge for either column, so anchor
            // it to the inside edge there instead.
            const column = index % 7;
            const row = Math.floor(index / 7);
            const previewEdge = column === 0 ? styles.previewLeft : column === 6 ? styles.previewRight : '';
            // The preview normally drops below the cell - in the grid's last
            // two rows that would run past the bottom of the viewport (this
            // is a plain absolutely-positioned popup, so nothing scrolls it
            // into view), so flip it to open upward there instead.
            const previewVertical = row >= weekRows - 2 ? styles.previewAbove : '';
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  // Clicking a greyed-out leading/trailing day (from the
                  // adjacent month) jumps the calendar to that month instead
                  // of just selecting a date the visible grid isn't showing.
                  if (!inMonth) setCurrentMonth(day);
                  setSelectedDate(day);
                }}
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

                {count > 0 && inMonth && (
                  <span
                    className={[styles.hoverPreview, previewEdge, previewVertical].filter(Boolean).join(' ')}
                    role="tooltip"
                  >
                    <span className={styles.hoverPreviewDate}>{format(day, 'EEEE, MMM d', { locale: currentLocale() })}</span>
                    {dayEvents.map((event) => (
                      <span key={event.id} className={styles.hoverPreviewEvent}>
                        <span className={styles.hoverPreviewTitle}>{event.title}</span>
                        <span className={styles.hoverPreviewTime}>{formatEventWhen(event)}</span>
                      </span>
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
