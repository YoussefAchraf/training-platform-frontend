import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../authStore';

export function useUpdateOwnProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (data) => updateUser(data),
  });
}
