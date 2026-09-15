export type ConversationType = 'direct' | 'group';
export type ConversationRole = 'owner' | 'member';
export type MessageType = 'text' | 'image' | 'voice' | 'file';

export interface ConversationParticipant {
  conversationId: number;
  userId: number;
  role: ConversationRole;
  joinedAt: string;
  lastReadMessageId: number | null;
  lastReadAt: string | null;
  lastDeliveredMessageId: number | null;
  lastDeliveredAt: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  roleName: string | null;
}

export interface MessagePreview {
  id: number;
  type: MessageType;
  body: string | null;
  senderId: number | null;
  createdAt: string;
}

export interface Conversation {
  id: number;
  type: ConversationType;
  name: string | null;
  createdBy: number | null;
  createdAt: string;
  participants: ConversationParticipant[];
  lastMessage: MessagePreview | null;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number | null;
  senderName: string | null;
  type: MessageType;
  body: string | null;
  attachmentKey: string | null;
  attachmentOriginalName: string | null;
  attachmentMime: string | null;
  attachmentSizeBytes: number | null;
  attachmentDurationSeconds: number | null;
  replyToMessageId: number | null;
  createdAt: string;
  editedAt: string | null;
}

export interface DirectoryPerson {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roleName: string;
}
