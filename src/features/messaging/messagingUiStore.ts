import { create } from 'zustand';

export type MessagingTab = 'conversations' | 'directory';

interface ReplyTarget {
  messageId: number;
  senderName: string;
  preview: string;
}

interface MessagingUiState {
  selectedConversationId: number | null;
  activeTab: MessagingTab;
  drafts: Record<number, string>;
  translations: Record<number, string>;
  openActionsMessageId: number | null;
  replyTargetByConversation: Record<number, ReplyTarget | null>;
  forwardMessageId: number | null;
  groupModalOpen: boolean;
  selectConversation: (conversationId: number | null) => void;
  setActiveTab: (tab: MessagingTab) => void;
  setDraft: (conversationId: number, text: string) => void;
  clearDraft: (conversationId: number) => void;
  setTranslation: (messageId: number, text: string) => void;
  setOpenActionsMessageId: (messageId: number | null) => void;
  setReplyTarget: (conversationId: number, target: ReplyTarget | null) => void;
  setForwardMessageId: (messageId: number | null) => void;
  setGroupModalOpen: (open: boolean) => void;
}

export const useMessagingUiStore = create<MessagingUiState>()((set) => ({
  selectedConversationId: null,
  activeTab: 'conversations',
  drafts: {},
  translations: {},
  openActionsMessageId: null,
  replyTargetByConversation: {},
  forwardMessageId: null,
  groupModalOpen: false,
  selectConversation: (conversationId) => set({ selectedConversationId: conversationId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDraft: (conversationId, text) =>
    set((state) => ({ drafts: { ...state.drafts, [conversationId]: text } })),
  clearDraft: (conversationId) =>
    set((state) => {
      const { [conversationId]: _removed, ...rest } = state.drafts;
      return { drafts: rest };
    }),
  setTranslation: (messageId, text) =>
    set((state) => ({ translations: { ...state.translations, [messageId]: text } })),
  setOpenActionsMessageId: (messageId) => set({ openActionsMessageId: messageId }),
  setReplyTarget: (conversationId, target) =>
    set((state) => ({
      replyTargetByConversation: { ...state.replyTargetByConversation, [conversationId]: target },
    })),
  setForwardMessageId: (messageId) => set({ forwardMessageId: messageId }),
  setGroupModalOpen: (open) => set({ groupModalOpen: open }),
}));
