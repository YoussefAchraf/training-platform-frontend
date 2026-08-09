import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { cn } from '@/shared/utils/cn';
import { listItem, staggerContainer } from '@/shared/motion/variants';
import styles from './Table.module.css';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
}

function TableInner<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className={styles.skeletonList}>
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} height={52} radius="var(--radius-md)" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  const titleColumn = columns[0];
  const restColumns = columns.slice(1);
  const rowStagger = staggerContainer(0.035);

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(styles.th, column.align && styles[`align-${column.align}`])}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={rowStagger} initial="hidden" animate="show">
            {data.map((row) => (
              <motion.tr
                key={keyExtractor(row)}
                variants={listItem}
                className={cn(styles.tr, onRowClick && styles.clickable)}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(styles.td, column.align && styles[`align-${column.align}`])}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      <motion.ul className={styles.cardList} variants={rowStagger} initial="hidden" animate="show">
        {data.map((row) => (
          <motion.li
            key={keyExtractor(row)}
            variants={listItem}
            className={cn(styles.card, onRowClick && styles.clickable)}
            onClick={() => onRowClick?.(row)}
          >
            {titleColumn && <div className={styles.cardTitle}>{titleColumn.render(row)}</div>}
            {restColumns.length > 0 && (
              <dl className={styles.cardFields}>
                {restColumns.map((column) => (
                  <div key={column.key} className={styles.cardField}>
                    <dt className={styles.cardFieldLabel}>{column.header}</dt>
                    <dd className={styles.cardFieldValue}>{column.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </>
  );
}

export const Table = memo(TableInner) as typeof TableInner;
