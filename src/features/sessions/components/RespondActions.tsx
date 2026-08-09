import { Check, X } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { useRespondToSession } from '../hooks/useSessions';
import styles from './RespondActions.module.css';

interface RespondActionsProps {
  sessionId: number;
}

export function RespondActions({ sessionId }: RespondActionsProps) {
  const respond = useRespondToSession();
  const toast = useToast();

  const handleRespond = (decision: 'accept' | 'refuse') => {
    respond.mutate(
      { id: sessionId, decision },
      {
        onSuccess: () => toast.success(decision === 'accept' ? 'Session accepted.' : 'Session refused.'),
      },
    );
  };

  return (
    <div className={styles.wrapper}>
      {respond.isError && <ErrorBanner error={respond.error} />}
      <p className={styles.prompt}>This session was assigned to you. Do you want to deliver it?</p>
      <div className={styles.actions}>
        <Button
          variant="danger"
          leftIcon={<X size={16} />}
          onClick={() => handleRespond('refuse')}
          isLoading={respond.isPending && respond.variables?.decision === 'refuse'}
          disabled={respond.isPending}
        >
          Refuse
        </Button>
        <Button
          leftIcon={<Check size={16} />}
          onClick={() => handleRespond('accept')}
          isLoading={respond.isPending && respond.variables?.decision === 'accept'}
          disabled={respond.isPending}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
