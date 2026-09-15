import { apiClient } from '@/shared/lib/apiClient';
import type { Conversation, ConversationParticipant, DirectoryPerson, Message } from '../types';

export const messagingApi = {
  listDirectory: (search?: string) =>
    apiClient
      .get<DirectoryPerson[]>('/messaging/directory', { params: search ? { search } : undefined })
      .then((res) => res.data),

  listConversations: () => apiClient.get<Conversation[]>('/messaging/conversations').then((res) => res.data),

  createDirectConversation: (targetUserId: number) =>
    apiClient.post<Conversation>('/messaging/conversations/direct', { targetUserId }).then((res) => res.data),

  createGroupConversation: (name: string, memberUserIds: number[]) =>
    apiClient.post<Conversation>('/messaging/conversations/group', { name, memberUserIds }).then((res) => res.data),

  addParticipant: (conversationId: number, userId: number) =>
    apiClient
      .post<ConversationParticipant>(`/messaging/conversations/${conversationId}/participants`, { userId })
      .then((res) => res.data),

  removeParticipant: (conversationId: number, userId: number) =>
    apiClient.delete(`/messaging/conversations/${conversationId}/participants/${userId}`),

  markRead: (conversationId: number, messageId: number) =>
    apiClient
      .post<ConversationParticipant>(`/messaging/conversations/${conversationId}/read`, { messageId })
      .then((res) => res.data),

  listMessages: (conversationId: number, params?: { cursor?: number; limit?: number }) =>
    apiClient.get<Message[]>(`/messaging/conversations/${conversationId}/messages`, { params }).then((res) => res.data),

  sendTextMessage: (conversationId: number, body: string, replyToMessageId?: number) =>
    apiClient
      .post<Message>(`/messaging/conversations/${conversationId}/messages`, {
        type: 'text',
        body,
        replyToMessageId,
      })
      .then((res) => res.data),
};
