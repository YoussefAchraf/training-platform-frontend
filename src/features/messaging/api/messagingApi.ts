import { apiClient } from '@/shared/lib/apiClient';
import type { Conversation, ConversationParticipant, DirectoryPerson, Message, MessageType } from '../types';

function attachmentUrl(messageId: number): string {
  const apiUrl = (import.meta.env.VITE_API_URL as string) || '';
  return `${apiUrl}/messaging/attachments/${messageId}`;
}

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

  sendAttachmentMessage: (
    conversationId: number,
    type: MessageType,
    file: File | Blob,
    filename: string,
    replyToMessageId?: number,
  ) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file, filename);
    if (replyToMessageId) formData.append('replyToMessageId', String(replyToMessageId));

    return apiClient
      .post<Message>(`/messaging/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': undefined },
      })
      .then((res) => res.data);
  },

  translateMessage: (messageId: number, targetLanguage: string) =>
    apiClient
      .post<{ translatedText: string }>(`/messaging/messages/${messageId}/translate`, { targetLanguage })
      .then((res) => res.data),

  forwardMessage: (messageId: number, targetConversationId: number) =>
    apiClient
      .post<Message>(`/messaging/messages/${messageId}/forward`, { targetConversationId })
      .then((res) => res.data),

  editMessage: (messageId: number, body: string) =>
    apiClient.patch<Message>(`/messaging/messages/${messageId}`, { body }).then((res) => res.data),

  attachmentUrl,
};
