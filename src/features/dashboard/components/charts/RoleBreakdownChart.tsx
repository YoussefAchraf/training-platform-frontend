import { useTranslation } from 'react-i18next';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '@/shared/components/EmptyState';
import { roleMeta, type Tone } from '@/shared/utils/statusMeta';
import type { RoleBreakdownEntry } from '../../utils/dashboardMetrics';
import styles from './RoleBreakdownChart.module.css';




const TONE_VAR: Record<Tone, string> = {
  info: 'var(--color-info)',
  success: 'var(--color-success)',
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  neutral: 'var(--color-neutral)',
};

interface ChartRow {
  label: string;
  count: number;
  color: string;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartRow }> }) {
  if (!active || !payload?.length) return null;
  const { label, count } = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <strong>{count}</strong> · {label}
    </div>
  );
}

interface RoleBreakdownChartProps {
  data: RoleBreakdownEntry[];
  emptyText: string;
}

export function RoleBreakdownChart({ data, emptyText }: RoleBreakdownChartProps) {
  const { t } = useTranslation('dashboard');

  if (data.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  const chartData: ChartRow[] = data.map((entry) => ({
    label: t(roleMeta[entry.role].labelKey),
    count: entry.count,
    color: TONE_VAR[roleMeta[entry.role].tone],
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(chartData.length * 36, 100)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap="28%">
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={90}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: 'var(--color-bg-subtle)' }} content={<ChartTooltip />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {chartData.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
