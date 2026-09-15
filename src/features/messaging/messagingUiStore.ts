import { create } from 'zustand';

export type MessagingTab = 'conversations' | 'directory';

interface MessagingUiState {
  selectedConversationId: number | null;
  activeTab: MessagingTab;
  drafts: Record<number, string>;
  selectConversation: (conversationId: number | null) => void;
  setActiveTab: (tab: MessagingTab) => void;
  setDraft: (conversationId: number, text: string) => void;
  clearDraft: (conversationId: number) => void;
}

export const useMessagingUiStore = create<MessagingUiState>()((set) => ({
  selectedConversationId: null,
  activeTab: 'conversations',
  drafts: {},
  selectConversation: (conversationId) => set({ selectedConversationId: conversationId }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDraft: (conversationId, text) =>
    set((state) => ({ drafts: { ...state.drafts, [conversationId]: text } })),
  clearDraft: (conversationId) =>
    set((state) => {
      const { [conversationId]: _removed, ...rest } = state.drafts;
      return { drafts: rest };
    }),
}));
