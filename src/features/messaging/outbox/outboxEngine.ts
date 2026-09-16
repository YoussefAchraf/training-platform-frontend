import { queryClient } from '@/shared/lib/queryClient';
import { queryKeys } from '@/shared/lib/queryKeys';
import { messagingApi } from '../api/messagingApi';
import { isRetryableError, uploadFileInChunks } from '../upload/chunkedUploader';
import type { Message } from '../types';
import type { OptimisticMessage } from '../hooks/useSendMessage';
import { deleteOutboxEntry, getOutboxEntry, markOutboxEntryFailed, markOutboxEntryPending, type OutboxEntry } from './outboxDb';

function patchCachedMessage(conversationId: number, clientId: string, patch: Partial<OptimisticMessage>): void {
  queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
    existing?.map((item) => (item.clientId === clientId ? { ...item, ...patch } : item)),
  );
}

function replaceCachedMessage(conversationId: number, clientId: string, message: Message): void {
  queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
    (existing ?? [])
      .filter((item) => item.clientId !== clientId && item.id !== message.id)
      .concat({ ...message, clientId })
      .sort((a, b) => a.id - b.id),
  );
}

export async function sendPendingEntry(entry: OutboxEntry): Promise<'sent' | 'failed'> {
  try {
    const message =
      entry.kind === 'text'
        ? await messagingApi.sendTextMessage(entry.conversationId, entry.body, entry.replyToMessageId)
        : await uploadFileInChunks(
            {
              conversationId: entry.conversationId,
              type: entry.type,
              file: entry.file,
              originalName: entry.filename,
              replyToMessageId: entry.replyToMessageId,
            },
            {
              onProgress: (uploadProgress) => patchCachedMessage(entry.conversationId, entry.clientId, { uploadProgress }),
              onStatusChange: (uploadStatus) => patchCachedMessage(entry.conversationId, entry.clientId, { uploadStatus }),
            },
          );

    replaceCachedMessage(entry.conversationId, entry.clientId, message);
    await deleteOutboxEntry(entry.clientId);
    return 'sent';
  } catch (error) {
    if (!isRetryableError(error)) {
      await markOutboxEntryFailed(entry.clientId);
      patchCachedMessage(entry.conversationId, entry.clientId, { pending: false, failed: true });
      return 'failed';
    }
    throw error;
  }
}

export async function retryOutboxEntry(clientId: string): Promise<'sent' | 'failed' | undefined> {
  const entry = await getOutboxEntry(clientId);
  if (!entry) return undefined;
  await markOutboxEntryPending(clientId);
  patchCachedMessage(entry.conversationId, clientId, { pending: true, failed: false });
  try {
    return await sendPendingEntry(entry);
  } catch {
    patchCachedMessage(entry.conversationId, clientId, { pending: true, failed: false });
    return undefined;
  }
}
