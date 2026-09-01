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
  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  startNewConversation: () => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      sessionId: crypto.randomUUID(),
      messages: [],
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      startNewConversation: () => set({ messages: [], sessionId: crypto.randomUUID() }),
      clear: () => set({ messages: [], sessionId: crypto.randomUUID(), isOpen: false }),
    }),
    {
      name: 'training-platform-chat',
      
      
      
      
      
      
      partialize: (state) => ({
        sessionId: state.sessionId,
        messages: state.messages.map(({ imageDataUrl: _imageDataUrl, ...rest }) => rest),
      }),
    },
  ),
);
