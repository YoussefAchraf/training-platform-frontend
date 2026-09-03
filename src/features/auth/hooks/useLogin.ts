import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';


export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  });
}


export function useAdminLogin() {
  return useMutation({
    mutationFn: authApi.adminLogin,
  });
}


export function useDeveloperLogin() {
  return useMutation({
    mutationFn: authApi.developerLogin,
  });
}
