import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import i18n from '@/shared/i18n';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error rendering the app:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper}>
          <AlertOctagon size={40} className={styles.icon} />
          <h1>{i18n.t('common:ErrorBoundary.title')}</h1>
          <p>{i18n.t('common:ErrorBoundary.description')}</p>
          <Button onClick={() => window.location.reload()}>{i18n.t('common:ErrorBoundary.reload')}</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
