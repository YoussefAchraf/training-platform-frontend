import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/shared/lib/queryKeys';
import { deleteOutboxEntry, markOutboxEntryFailed, putOutboxEntry } from '../outbox/outboxDb';
import { isRetryableError, uploadFileInChunks } from '../upload/chunkedUploader';
import type { MessageType } from '../types';
import type { OptimisticMessage } from './useSendMessage';

interface SendAttachmentVariables {
  type: MessageType;
  file: File | Blob;
  filename: string;
  previewUrl?: string;
  durationSeconds?: number;
  sizeBytes?: number;
  clientId: string;
  replyToMessageId?: number;
}

export function useSendAttachmentMessage(conversationId: number) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  function patchOptimisticMessage(clientId: string, patch: Partial<OptimisticMessage>) {
    queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
      existing?.map((item) => (item.clientId === clientId ? { ...item, ...patch } : item)),
    );
  }

  return useMutation({
    mutationFn: async ({ type, file, filename, replyToMessageId, clientId }: SendAttachmentVariables) => {
      await putOutboxEntry({
        clientId,
        kind: 'attachment',
        conversationId,
        type,
        file,
        filename,
        replyToMessageId,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
      try {
        const message = await uploadFileInChunks(
          { conversationId, type, file, originalName: filename, replyToMessageId },
          {
            onProgress: (uploadProgress) => patchOptimisticMessage(clientId, { uploadProgress }),
            onStatusChange: (uploadStatus) => patchOptimisticMessage(clientId, { uploadStatus }),
          },
        );
        await deleteOutboxEntry(clientId);
        return message;
      } catch (error) {
        if (!isRetryableError(error)) {
          await markOutboxEntryFailed(clientId);
        }
        throw error;
      }
    },
    onMutate: ({ type, filename, previewUrl, durationSeconds, sizeBytes, clientId }: SendAttachmentVariables) => {
      const optimisticMessage: OptimisticMessage = {
        id: -Date.now(),
        clientId,
        conversationId,
        senderId: user?.id ?? null,
        senderName: user ? `${user.firstname} ${user.lastname}` : null,
        type,
        body: null,
        attachmentKey: null,
        attachmentOriginalName: filename,
        attachmentMime: null,
        attachmentSizeBytes: sizeBytes ?? null,
        attachmentDurationSeconds: durationSeconds ?? null,
        replyToMessageId: null,
        createdAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
        pending: true,
        localPreviewUrl: previewUrl,
        uploadProgress: 0,
        uploadStatus: 'uploading',
      };
      queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) => [
        ...(existing ?? []),
        optimisticMessage,
      ]);
      return { clientId };
    },
    onSuccess: (message, variables, context) => {
      queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
        (existing ?? [])
          .filter((item) => item.clientId !== context?.clientId && item.id !== message.id)
          .concat({ ...message, clientId: context?.clientId ?? '', localPreviewUrl: variables.previewUrl })
          .sort((a, b) => a.id - b.id),
      );
    },
    onError: (error, _variables, context) => {
      if (isRetryableError(error)) return;
      queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
        existing?.map((item) =>
          item.clientId === context?.clientId ? { ...item, pending: false, failed: true } : item,
        ),
      );
    },
  });
}
