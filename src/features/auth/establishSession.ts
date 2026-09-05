import { useChatStore } from '@/features/chatbot/chatStore';
import { setRoleCatalog, type User } from '@/shared/types/domain';
import { authApi } from './api/authApi';
import { useAuthStore } from './authStore';


export async function establishSession(user: User): Promise<void> {
  const roles = await authApi.listRoles();
  setRoleCatalog(roles);
  useAuthStore.getState().setUser(user);
  useChatStore.getState().clear();
}
