import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/shared/lib/queryKeys';
import { connectMessagingSocket, disconnectMessagingSocket, getMessagingSocket } from '../api/socket';
import { useMessagingRealtimeStore } from '../messagingRealtimeStore';
import { useCanUseMessaging } from './useConversations';
import type { Conversation, Message } from '../types';

interface TypingOrRecordingPayload {
  conversationId: number;
  userId: number;
}

interface ConversationReadPayload {
  conversationId: number;
  lastReadMessageId: number;
}

export function useMessagingSocket(): void {
  const { user, isAuthenticated } = useAuth();
  const canUseMessaging = useCanUseMessaging();
  const queryClient = useQueryClient();
  const setTyping = useMessagingRealtimeStore((state) => state.setTyping);
  const setRecording = useMessagingRealtimeStore((state) => state.setRecording);

  const eligible = isAuthenticated && canUseMessaging;

  useEffect(() => {
    if (!eligible || !user) {
      disconnectMessagingSocket();
      return undefined;
    }

    connectMessagingSocket();
    const socket = getMessagingSocket();
    const currentUserId = user.id;

    function handleMessageNew({ message }: { message: Message }) {
      queryClient.setQueryData<Message[]>(queryKeys.messaging.messages(message.conversationId), (existing) => {
        if (!existing) return existing;
        return [...existing.filter((item) => item.id !== message.id), message].sort((a, b) => a.id - b.id);
      });

      queryClient.setQueryData<Conversation[]>(queryKeys.messaging.conversations(), (existing) => {
        if (!existing) return existing;
        const isMine = message.senderId === currentUserId;
        return existing
          .map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  lastMessage: {
                    id: message.id,
                    type: message.type,
                    body: message.body,
                    senderId: message.senderId,
                    createdAt: message.createdAt,
                  },
                  unreadCount: isMine ? conversation.unreadCount : conversation.unreadCount + 1,
                }
              : conversation,
          )
          .sort((a, b) => (b.lastMessage?.id ?? 0) - (a.lastMessage?.id ?? 0));
      });
    }

    function handleConversationsChanged() {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations() });
    }

    function handleConversationRead({ conversationId }: ConversationReadPayload) {
      queryClient.setQueryData<Conversation[]>(queryKeys.messaging.conversations(), (existing) =>
        existing?.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      );
    }

    function handleTypingStart({ conversationId, userId }: TypingOrRecordingPayload) {
      setTyping(conversationId, userId, true);
    }

    function handleTypingStop({ conversationId, userId }: TypingOrRecordingPayload) {
      setTyping(conversationId, userId, false);
    }

    function handleRecordingStart({ conversationId, userId }: TypingOrRecordingPayload) {
      setRecording(conversationId, userId, true);
    }

    function handleRecordingStop({ conversationId, userId }: TypingOrRecordingPayload) {
      setRecording(conversationId, userId, false);
    }

    socket.on('message:new', handleMessageNew);
    socket.on('conversation:new', handleConversationsChanged);
    socket.on('participant:added', handleConversationsChanged);
    socket.on('participant:removed', handleConversationsChanged);
    socket.on('conversation:read', handleConversationRead);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('recording:start', handleRecordingStart);
    socket.on('recording:stop', handleRecordingStop);

    return () => {
      socket.off('message:new', handleMessageNew);
      socket.off('conversation:new', handleConversationsChanged);
      socket.off('participant:added', handleConversationsChanged);
      socket.off('participant:removed', handleConversationsChanged);
      socket.off('conversation:read', handleConversationRead);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('recording:start', handleRecordingStart);
      socket.off('recording:stop', handleRecordingStop);
    };
  }, [eligible, user, queryClient, setTyping, setRecording]);
}
