import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

export function useSignup() {
  return useMutation({
    mutationFn: authApi.signup,
  });
}
