import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/shared/lib/queryClient';
import { ToastViewport } from '@/shared/components/ToastViewport';
import { Spinner } from '@/shared/components/Spinner';
import { router } from '@/routes/router';
import { useServiceWorkerRegistration } from '@/pwa/hooks/useServiceWorkerRegistration';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap';
import { ErrorBoundary } from './ErrorBoundary';

export function App() {
  useServiceWorkerRegistration();
  useTheme();
  const isBootstrapped = useSessionBootstrap();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {isBootstrapped ? (
          <RouterProvider router={router} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <Spinner size={28} />
          </div>
        )}
        <ToastViewport />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
