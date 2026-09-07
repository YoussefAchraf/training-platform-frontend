import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { WeeklyVolumePoint } from '../../utils/dashboardMetrics';
import styles from './WeeklySessionsChart.module.css';

interface WeeklySessionsChartProps {
  data: WeeklyVolumePoint[];
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <strong>{payload[0].value}</strong> · {label}
    </div>
  );
}

export function WeeklySessionsChart({ data }: WeeklySessionsChartProps) {
  const { t } = useTranslation('dashboard');
  const isEmpty = data.every((point) => point.count === 0);

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap="24%">
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            tick={{ fill: 'var(--color-text-faint)', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <Tooltip cursor={{ fill: 'var(--color-bg-subtle)' }} content={<ChartTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--color-primary)" maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
      {isEmpty && <p className={styles.emptyNote}>{t('WeeklySessionsChart.noSessionsYet')}</p>}
    </div>
  );
}
