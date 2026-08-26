import { apiClient } from '@/shared/lib/apiClient';
import type { CalendarEvent } from '@/shared/types/domain';

export interface UpdateCalendarEventPayload {
  eventDate?: string;
  endDate?: string;
  title?: string;
}

export const calendarApi = {
  listGlobal: () => apiClient.get<CalendarEvent[]>('/calendar/global').then((res) => res.data),
  listMine: () => apiClient.get<CalendarEvent[]>('/calendar/mine').then((res) => res.data),
  update: (id: number, payload: UpdateCalendarEventPayload) =>
    apiClient.patch<CalendarEvent>(`/calendar/global/${id}`, payload).then((res) => res.data),
  remove: (id: number) => apiClient.delete<void>(`/calendar/global/${id}`).then((res) => res.data),
};
