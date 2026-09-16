import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/shared/lib/queryKeys';
import { uploadFileInChunks } from '../upload/chunkedUploader';
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
    mutationFn: ({ type, file, filename, replyToMessageId, clientId }: SendAttachmentVariables) =>
      uploadFileInChunks(
        { conversationId, type, file, originalName: filename, replyToMessageId },
        {
          onProgress: (uploadProgress) => patchOptimisticMessage(clientId, { uploadProgress }),
          onStatusChange: (uploadStatus) => patchOptimisticMessage(clientId, { uploadStatus }),
        },
      ),
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
    onError: (_error, _variables, context) => {
      queryClient.setQueryData<OptimisticMessage[]>(queryKeys.messaging.messages(conversationId), (existing) =>
        existing?.map((item) =>
          item.clientId === context?.clientId ? { ...item, pending: false, failed: true } : item,
        ),
      );
    },
  });
}
