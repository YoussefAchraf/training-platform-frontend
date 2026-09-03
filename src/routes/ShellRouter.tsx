import { useStandaloneDeviceClass } from '@/shared/hooks/useMediaQuery';
import { useAutoEnableNotifications } from '@/features/push/hooks/useAutoEnableNotifications';
import { FeatureAnnouncementPopup } from '@/features/announcements/components/FeatureAnnouncementPopup';
import { AppLayout } from '@/layouts/AppLayout';
import { PwaLayout } from '@/pwa/layouts/PwaLayout';
import { PwaTabletLayout } from '@/pwa/layouts/PwaTabletLayout';
import { PwaDesktopLayout } from '@/pwa/layouts/PwaDesktopLayout';













export function ShellRouter() {
  const deviceClass = useStandaloneDeviceClass();
  useAutoEnableNotifications();

  let layout;
  switch (deviceClass) {
    case 'phone':
      layout = <PwaLayout />;
      break;
    case 'tablet':
      layout = <PwaTabletLayout />;
      break;
    case 'desktop':
      layout = <PwaDesktopLayout />;
      break;
    default:
      layout = <AppLayout />;
  }

  return (
    <>
      {layout}
      {}
      <FeatureAnnouncementPopup />
    </>
  );
}
