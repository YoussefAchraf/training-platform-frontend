import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart } from 'recharts';
import { EmptyState } from '@/shared/components/EmptyState';
import { sessionStatusMeta, type Tone } from '@/shared/utils/statusMeta';
import type { SessionStatus } from '@/shared/types/domain';
import { cn } from '@/shared/utils/cn';
import styles from './SessionStatusDonut.module.css';





const TONE_VAR: Record<Tone, string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  neutral: 'var(--color-text-faint)',
};

const STATUS_ORDER: SessionStatus[] = ['completed', 'scheduled', 'ongoing', 'cancelled'];

interface SessionStatusDonutProps {
  counts: Record<SessionStatus, number>;
  emptyText: string;
  
  onDark?: boolean;
}

export function SessionStatusDonut({ counts, emptyText, onDark = false }: SessionStatusDonutProps) {
  const { t } = useTranslation('dashboard');
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);

  if (total === 0) {
    
    
    
    return onDark ? <p className={styles.emptyOnDark}>{emptyText}</p> : <EmptyState title={emptyText} />;
  }

  const data = STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => ({
    status,
    value: counts[status],
    color: TONE_VAR[sessionStatusMeta[status].tone],
  }));

  return (
    <div className={cn(styles.wrap, onDark && styles.onDark)}>
      <div className={styles.chartArea}>
        <PieChart width={120} height={120}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={54}
            startAngle={90}
            
            
            
            
            
            endAngle={-269.99}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className={styles.center}>
          <span className={styles.centerValue}>{total}</span>
          <span className={styles.centerLabel}>{t('SessionStatusDonut.sessions')}</span>
        </div>
      </div>
      <ul className={styles.legend}>
        {data.map((entry) => (
          <li key={entry.status} className={styles.legendItem}>
            <span className={styles.swatch} style={{ backgroundColor: entry.color }} aria-hidden="true" />
            {t(sessionStatusMeta[entry.status].labelKey)} · {Math.round((entry.value / total) * 100)}%
          </li>
        ))}
      </ul>
    </div>
  );
}
