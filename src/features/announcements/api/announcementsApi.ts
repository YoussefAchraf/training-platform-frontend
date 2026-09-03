import { apiClient } from '@/shared/lib/apiClient';
import type { FeatureAnnouncement, FeatureAnnouncementWithRatings, TargetableRole } from '@/shared/types/domain';

export interface CreateAnnouncementPayload {
  title: string;
  description: string;
  targetRoles: TargetableRole[];
}

export interface RateAnnouncementPayload {
  id: number;
  stars: number;
}

export const announcementsApi = {
  
  create: (payload: CreateAnnouncementPayload) =>
    apiClient.post<FeatureAnnouncement>('/announcements', payload).then((res) => res.data),

  
  list: () => apiClient.get<FeatureAnnouncementWithRatings[]>('/announcements').then((res) => res.data),

  
  mine: () => apiClient.get<FeatureAnnouncement[]>('/announcements/mine').then((res) => res.data),

  
  rate: ({ id, stars }: RateAnnouncementPayload) =>
    apiClient.patch<{ message: string }>(`/announcements/${id}/rate`, { stars }).then((res) => res.data),
};
