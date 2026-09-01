import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}
