import { Suspense, lazy } from 'react';
import type { ComponentType, JSX } from 'react';
import { Spinner } from '@/shared/components/Spinner';
import styles from './lazyPage.module.css';

type PageComponent = ComponentType<Record<string, never>>;

export function lazyPage(factory: () => Promise<{ default: PageComponent }>): JSX.Element {
  const LazyComponent = lazy(factory);
  return (
    <Suspense
      fallback={
        <div className={styles.fallback}>
          <Spinner size={28} />
        </div>
      }
    >
      <LazyComponent />
    </Suspense>
  );
}
