import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  imageDataUrl?: string;
}

interface ChatState {
  isOpen: boolean;
  sessionId: string;
  messages: ChatMessage[];
  
  hasUnread: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  markRead: () => void;
  startNewConversation: () => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      sessionId: crypto.randomUUID(),
      messages: [],
      hasUnread: false,
      open: () => set({ isOpen: true, hasUnread: false }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen, hasUnread: state.isOpen ? state.hasUnread : false })),
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
          hasUnread: message.role === 'assistant' && !state.isOpen ? true : state.hasUnread,
        })),
      markRead: () => set({ hasUnread: false }),
      startNewConversation: () => set({ messages: [], sessionId: crypto.randomUUID(), hasUnread: false }),
      clear: () => set({ messages: [], sessionId: crypto.randomUUID(), isOpen: false, hasUnread: false }),
    }),
    {
      name: 'training-platform-chat',






      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages.map(({ imageDataUrl: _imageDataUrl, ...rest }) => rest),
        hasUnread: state.hasUnread,
      }),
    },
  ),
);
