import { createBrowserRouter } from 'react-router-dom';
import { ShellRouter } from './ShellRouter';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { SuperAdminAuthLayout } from '@/layouts/SuperAdminAuthLayout';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { GuestRoute } from './guards/GuestRoute';
import { RoleRoute } from './guards/RoleRoute';
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
    element: <PublicLayout />,
    children: [
      {
        path: '/survey/:sessionId',
        element: lazyPage(() =>
          import('@/features/survey/pages/SurveyFormPage').then((m) => ({ default: m.SurveyFormPage })),
        ),
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
          { path: paths.trainings, element: lazyPage(routeModules[paths.trainings]) },
          { path: paths.sessions, element: lazyPage(routeModules[paths.sessions]) },
          {
            path: '/sessions/:id',
            element: lazyPage(() =>
              import('@/features/sessions/pages/SessionDetailPage').then((m) => ({
                default: m.SessionDetailPage,
              })),
            ),
          },
          { path: paths.calendar, element: lazyPage(routeModules[paths.calendar]) },
          {
            path: '/reports/:sessionId',
            element: lazyPage(() =>
              import('@/features/reports/pages/ReportPage').then((m) => ({ default: m.ReportPage })),
            ),
          },
          {
            element: <RoleRoute allowed={['Sales', 'Manager', 'SuperAdmin']} />,
            children: [{ path: paths.instructors, element: lazyPage(routeModules[paths.instructors]) }],
          },
          {
            element: <RoleRoute allowed={['Instructor']} />,
            children: [
              { path: paths.myInstructorProfile, element: lazyPage(routeModules[paths.myInstructorProfile]) },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
