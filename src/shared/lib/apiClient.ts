import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/authStore';
import { paths } from '@/routes/paths';
import i18n from '@/shared/i18n';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  
  
  
  
  withCredentials: true,
});

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

apiClient.interceptors.request.use((config) => {
  // Double-submit CSRF: echo the (non-httpOnly) csrfToken cookie back as a
  // header on state-changing requests. A cross-site page can't read this
  // origin's cookies to learn the value, so it can't forge this header even
  // though the browser would still attach the session cookie automatically.
  if (config.method && UNSAFE_METHODS.has(config.method.toLowerCase())) {
    const csrfToken = readCookie('csrfToken');
    if (csrfToken) {
      config.headers.set('X-CSRF-Token', csrfToken);
    }
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/admin-login', '/auth/signup', '/auth/refresh'];

let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  // Plain axios, not `apiClient` - avoids re-entering these interceptors.
  await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    undefined,
    { withCredentials: true, headers: { 'X-CSRF-Token': readCookie('csrfToken') ?? '' } },
  );
}

export function refreshSessionOnce(): Promise<void> {
  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

// Every page - protected or not - runs the same session-bootstrap check on
// load (see useSessionBootstrap), so a "refresh failed" here just as often
// means "visitor was never logged in" as "session actually expired". Only
// force-navigate away from pages that require a session; guest-accessible
// pages (login, signup, the SuperAdmin login, pending-approval, the public
// survey form, the password-reset form) must be left alone, or a plain
// unauthenticated visit yanks the page out from under whoever's about to
// type their credentials in - `/superadmin/login` in particular doesn't
// start with `/login`, so it was falling through this check and bouncing
// straight to the regular /login. `/reset-password` matters even more than
// most: whoever's there almost certainly has a stale accessToken cookie
// from the session that the reset itself just revoked - the very next
// authenticated call bootstrap makes 401s, the refresh it tries fails
// (that's the whole point of revoking), and without this entry that would
// have bounced them off the one page meant to let them recover.
const GUEST_ACCESSIBLE_PREFIXES = [
  paths.login,
  paths.signup,
  paths.pendingApproval,
  paths.superAdminLogin,
  paths.developerLogin,
  paths.resetPassword,
  '/survey/',
];

// An intentional logout (see useLogout) already knows the correct
// destination - paths.superAdminLogin for a SuperAdmin, paths.login
// otherwise - and navigates there itself. Without this flag, a request
// that was already in flight when the user clicked "Log out" can still
// 401 after the server invalidates the session and land here, which has
// no idea the user was a SuperAdmin and would hard-redirect to the wrong
// (regular) login page, racing and sometimes beating the SPA navigation.
let intentionalLogoutInProgress = false;

export function setIntentionalLogoutInProgress(value: boolean): void {
  intentionalLogoutInProgress = value;
}

export function redirectToLoginAfterRefreshFailure(): void {
  useAuthStore.getState().clearSession();
  if (typeof window === 'undefined' || intentionalLogoutInProgress) return;
  const isGuestAccessible = GUEST_ACCESSIBLE_PREFIXES.some((prefix) => window.location.pathname.startsWith(prefix));
  if (!isGuestAccessible) {
    window.location.href = paths.login;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    const isRefreshable =
      originalRequest &&
      status === 401 &&
      !originalRequest._retry &&
      !AUTH_ENDPOINTS_WITHOUT_REFRESH.some((endpoint) => url.includes(endpoint));

    if (!isRefreshable) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSessionOnce();
      return apiClient(originalRequest);
    } catch (refreshError) {
      redirectToLoginAfterRefreshFailure();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = i18n.t('common:ApiError.fallback'),
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
