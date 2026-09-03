import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { announcementsApi } from '../api/announcementsApi';


export function useAnnouncements() {
  return useQuery({
    queryKey: queryKeys.announcements.list(),
    queryFn: announcementsApi.list,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: announcementsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.announcements.list() }),
  });
}


export function useMyPendingAnnouncements(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.announcements.mine(),
    queryFn: announcementsApi.mine,
    enabled,
    
    
    
    
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useRateAnnouncement() {
  return useMutation({
    mutationFn: announcementsApi.rate,
  });
}
