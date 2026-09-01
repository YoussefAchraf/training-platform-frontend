import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
}
