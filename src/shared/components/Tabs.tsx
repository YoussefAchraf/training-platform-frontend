import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import styles from './Tabs.module.css';

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
}

interface TabsProps<T extends string> {
  id: string;
  value: T;
  onChange: (value: T) => void;
  items: TabItem<T>[];
  variant?: 'underline' | 'pill';
  'aria-label': string;
  className?: string;
}

export function getTabId(id: string, value: string): string {
  return `${id}-tab-${value}`;
}

export function getTabPanelId(id: string, value: string): string {
  return `${id}-panel-${value}`;
}

// A real WAI-ARIA tabs widget (role="tablist"/"tab"/"tabpanel", left/right
// arrow-key roving focus) - the only existing toggle-style component in this
// app, ViewToggle, is a view-switcher (role="group"/aria-pressed), not
// content-switching tabs, so this is a genuine new primitive rather than a
// duplicate of something that already exists. `getTabId`/`getTabPanelId` are
// exported so callers can wire up matching `id`/`aria-labelledby` pairs on
// their own panel markup without this component needing to own the panels
// too (keeps it a plain, uncontrolled-content-free tablist).
export function Tabs<T extends string>({
  id,
  value,
  onChange,
  items,
  variant = 'underline',
  className,
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  const refs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({});

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const nextIndex = event.key === 'ArrowRight' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    const next = items[nextIndex];
    onChange(next.value);
    refs.current[next.value]?.focus();
  };

  return (
    <div
      className={cn(variant === 'pill' ? styles.tablistPill : styles.tablist, className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[item.value] = el;
            }}
            type="button"
            role="tab"
            id={getTabId(id, item.value)}
            aria-selected={isActive}
            aria-controls={getTabPanelId(id, item.value)}
            tabIndex={isActive ? 0 : -1}
            className={cn(
              variant === 'pill' ? styles.tabPill : styles.tab,
              isActive && (variant === 'pill' ? styles.tabPillActive : styles.tabActive),
            )}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
