import { useTranslation } from 'react-i18next';
import { CalendarCheck2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { StatTile } from '@/shared/components/StatTile';
import { BentoGrid } from '@/shared/components/BentoGrid';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useSessions } from '@/features/sessions/hooks/useSessions';
import { useSessionLookups } from '@/features/sessions/hooks/useSessionLookups';
import { useMyInstructorProfile } from '@/features/instructors/hooks/useInstructors';
import { useAppBadge } from '@/pwa/hooks/useAppBadge';
import { SessionTimeline } from '@/features/dashboard/components/SessionTimeline';
import { HeroStatCard } from '@/features/dashboard/components/HeroStatCard';
import { SkillChips } from '@/features/dashboard/components/SkillChips';
import bentoStyles from '@/shared/components/BentoGrid.module.css';
import heroStyles from '@/features/dashboard/components/HeroStatCard.module.css';
import styles from '@/features/dashboard/components/Dashboard.module.css';
import { PwaStatScrollRow } from './PwaStatScrollRow';





export function PwaInstructorDashboard() {
  const { t } = useTranslation('dashboard');
  const sessionsQuery = useSessions();
  const { trainingMap, clientMap } = useSessionLookups();
  const profileQuery = useMyInstructorProfile();

  const badgeUpcomingCount =
    sessionsQuery.data?.filter(
      (session) => session.assignmentStatus === 'accepted' && (session.sessionStatus === 'scheduled' || session.sessionStatus === 'ongoing'),
    ).length ?? 0;
  useAppBadge(badgeUpcomingCount);

  if (sessionsQuery.isPending) return <Spinner />;
  if (sessionsQuery.isError) {
    return <ErrorBanner error={sessionsQuery.error} onRetry={() => sessionsQuery.refetch()} />;
  }

  const sessions = sessionsQuery.data ?? [];

  const completedAll = sessions.filter((session) => session.sessionStatus === 'completed');
  const upcomingAll = sessions.filter(
    (session) => session.assignmentStatus === 'accepted' && (session.sessionStatus === 'scheduled' || session.sessionStatus === 'ongoing'),
  );
  const completed = [...completedAll].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5);
  const upcoming = [...upcomingAll].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).slice(0, 5);

  const completedCount = completedAll.length;
  const upcomingCount = upcomingAll.length;
  const deliveredPct = sessions.length > 0 ? Math.round((completedCount / sessions.length) * 100) : 0;

  return (
    <BentoGrid>
      <HeroStatCard
        id="tour-stat-my-sessions"
        className={`${bentoStyles.span2} ${bentoStyles.rowSpan2}`}
        eyebrow={t('InstructorDashboard.allTimeLabel')}
        value={sessions.length}
        label={t('InstructorDashboard.mySessions')}
      >
        <div className={heroStyles.ringRow}>
          <ProgressRing
            pct={deliveredPct}
            color="var(--green-500)"
            label={t('InstructorDashboard.ringLabel', { completed: completedCount, total: sessions.length })}
          />
          <p className={heroStyles.ringNote}>
            {t('InstructorDashboard.ringNoteCompleted', { count: completedCount })}
            <br />
            {t('InstructorDashboard.ringNoteUpcoming', { count: upcomingCount })}
          </p>
        </div>
      </HeroStatCard>

      <PwaStatScrollRow>
        <StatTile id="tour-stat-completed" label={t('InstructorDashboard.completedSessions')} value={completedCount} icon={CheckCircle2} tone="success" />
        <StatTile id="tour-stat-upcoming-accepted" label={t('InstructorDashboard.upcomingAccepted')} value={upcomingCount} icon={CalendarCheck2} tone="info" />
      </PwaStatScrollRow>

      <Card className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('InstructorDashboard.skillsCardTitle')}</h3>
        <SkillChips skills={profileQuery.data?.skills ?? []} emptyText={t('InstructorDashboard.noSkillsYet')} />
      </Card>

      <Card id="tour-card-your-sessions" className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('InstructorDashboard.yourSessionsCardTitle')}</h3>
        <SessionTimeline sessions={upcoming} trainingMap={trainingMap} clientMap={clientMap} emptyText={t('InstructorDashboard.noScheduled')} />
      </Card>

      <Card id="tour-card-recently-completed" className={bentoStyles.span3}>
        <h3 className={styles.cardTitle}>{t('InstructorDashboard.recentlyCompletedCardTitle')}</h3>
        <SessionTimeline sessions={completed} trainingMap={trainingMap} clientMap={clientMap} emptyText={t('InstructorDashboard.noCompletedYet')} />
      </Card>
    </BentoGrid>
  );
}
