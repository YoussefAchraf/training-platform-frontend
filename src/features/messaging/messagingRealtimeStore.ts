import { create } from 'zustand';

interface MessagingRealtimeState {
  typingByConversation: Record<number, number[]>;
  recordingByConversation: Record<number, number[]>;
  setTyping: (conversationId: number, userId: number, isTyping: boolean) => void;
  setRecording: (conversationId: number, userId: number, isRecording: boolean) => void;
}

const EMPTY_IDS: number[] = [];

function toggleUserId(list: number[], userId: number, present: boolean): number[] {
  const withoutUser = list.filter((id) => id !== userId);
  return present ? [...withoutUser, userId] : withoutUser;
}

export const useMessagingRealtimeStore = create<MessagingRealtimeState>()((set) => ({
  typingByConversation: {},
  recordingByConversation: {},
  setTyping: (conversationId, userId, isTyping) =>
    set((state) => ({
      typingByConversation: {
        ...state.typingByConversation,
        [conversationId]: toggleUserId(state.typingByConversation[conversationId] ?? EMPTY_IDS, userId, isTyping),
      },
    })),
  setRecording: (conversationId, userId, isRecording) =>
    set((state) => ({
      recordingByConversation: {
        ...state.recordingByConversation,
        [conversationId]: toggleUserId(state.recordingByConversation[conversationId] ?? EMPTY_IDS, userId, isRecording),
      },
    })),
}));

export function useTypingUsers(conversationId: number): number[] {
  return useMessagingRealtimeStore((state) => state.typingByConversation[conversationId] ?? EMPTY_IDS);
}

export function useRecordingUsers(conversationId: number): number[] {
  return useMessagingRealtimeStore((state) => state.recordingByConversation[conversationId] ?? EMPTY_IDS);
}
