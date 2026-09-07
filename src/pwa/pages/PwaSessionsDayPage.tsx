import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { currentLocale } from '@/shared/utils/formatDate';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { SessionCardGrid } from '@/features/sessions/components/SessionCardGrid';
import { expandEventDays } from '@/features/calendar/utils/expandEventDays';
import type { CalendarEvent } from '@/shared/types/domain';
import { paths } from '@/routes/paths';
import styles from './PwaSessionsDayPage.module.css';














export function PwaSessionsDayPage() {
  const { t } = useTranslation('sessions');
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isInstructor } = useAuth();
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap, instructorMap } = useSessionLookups();

  const targetDate = date ? parseISO(date) : null;
  const validDate = targetDate && isValid(targetDate) ? targetDate : null;

  
  
  
  
  
  
  const scopedEvents = (location.state as { events?: CalendarEvent[] } | null)?.events;

  const daySessions = useMemo(() => {
    if (!date) return [];
    if (scopedEvents) {
      const sessionIds = new Set(scopedEvents.map((event) => event.sessionId));
      return (sessionsQuery.data ?? []).filter((session) => sessionIds.has(session.id));
    }
    return (sessionsQuery.data ?? []).filter((session) =>
      expandEventDays({
        eventDate: session.startDate,
        endDate: session.endDate,
        includeWeekends: session.includeWeekends,
      }).some((day) => format(day, 'yyyy-MM-dd') === date),
    );
  }, [sessionsQuery.data, date, scopedEvents]);

  const handleBack = () => navigate(paths.calendar);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleBack} aria-label={t('PwaSessionsDayPage.back')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerText}>
          <p className={styles.title}>
            {validDate ? format(validDate, 'EEEE d MMMM', { locale: currentLocale() }) : t('PwaSessionsDayPage.invalidDate')}
          </p>
          <p className={styles.subtitle}>{t('PwaSessionsDayPage.sessionCount', { count: daySessions.length })}</p>
        </div>
      </header>

      {sessionsQuery.isError ? (
        <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />
      ) : (
        <SessionCardGrid
          sessions={daySessions}
          trainingMap={trainingMap}
          clientMap={clientMap}
          instructorMap={instructorMap}
          showInstructor={!isInstructor}
          onCardClick={(session) => navigate(paths.sessionDetail(session.id))}
          isLoading={sessionsQuery.isPending}
          emptyTitle={t('PwaSessionsDayPage.emptyTitle')}
          emptyDescription={t('PwaSessionsDayPage.emptyDescription')}
        />
      )}
    </div>
  );
}
