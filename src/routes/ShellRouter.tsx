import { useStandaloneDeviceClass } from '@/shared/hooks/useMediaQuery';
import { AppLayout } from '@/layouts/AppLayout';
import { PwaLayout } from '@/pwa/layouts/PwaLayout';
import { PwaTabletLayout } from '@/pwa/layouts/PwaTabletLayout';
import { PwaDesktopLayout } from '@/pwa/layouts/PwaDesktopLayout';







export function ShellRouter() {
  const deviceClass = useStandaloneDeviceClass();

  switch (deviceClass) {
    case 'phone':
      return <PwaLayout />;
    case 'tablet':
      return <PwaTabletLayout />;
    case 'desktop':
      return <PwaDesktopLayout />;
    default:
      return <AppLayout />;
  }
}
