import { createBrowserRouter } from 'react-router-dom';
import { ShellRouter } from './ShellRouter';
import { AuthLayout } from '@/layouts/AuthLayout';
import { SuperAdminAuthLayout } from '@/layouts/SuperAdminAuthLayout';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { GuestRoute } from './guards/GuestRoute';
import { RootRedirect } from './guards/RootRedirect';
import { SuperAdminGuestRoute } from './guards/SuperAdminGuestRoute';
import { NotFoundPage } from './NotFoundPage';
import { lazyPage } from './lazyPage';
import { routeModules } from './routeModules';
import { paths } from './paths';

export const router = createBrowserRouter([
  { path: paths.home, element: <RootRedirect /> },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: paths.login, element: lazyPage(routeModules[paths.login]) },
          { path: paths.signup, element: lazyPage(routeModules[paths.signup]) },
          { path: paths.pendingApproval, element: lazyPage(routeModules[paths.pendingApproval]) },
        ],
      },
    ],
  },
  {
    element: <SuperAdminGuestRoute />,
    children: [
      {
        element: <SuperAdminAuthLayout />,
        children: [{ path: paths.superAdminLogin, element: lazyPage(routeModules[paths.superAdminLogin]) }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ShellRouter />,
        children: [
          { path: paths.account, element: lazyPage(routeModules[paths.account]) },
          { path: paths.chat, element: lazyPage(routeModules[paths.chat]) },
          { path: paths.pwaProfile, element: lazyPage(routeModules[paths.pwaProfile]) },
          { path: paths.providers, element: lazyPage(routeModules[paths.providers]) },
          { path: paths.clients, element: lazyPage(routeModules[paths.clients]) },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
