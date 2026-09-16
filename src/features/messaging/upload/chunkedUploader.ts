import axios, { type AxiosError } from 'axios';
import { messagingApi } from '../api/messagingApi';
import type { Message, MessageType } from '../types';

export type ChunkedUploadStatus = 'uploading' | 'paused' | 'completing';

export interface ChunkedUploadInput {
  conversationId: number;
  type: MessageType;
  file: File | Blob;
  originalName: string;
  replyToMessageId?: number;
}

export interface ChunkedUploadCallbacks {
  onProgress?: (fraction: number) => void;
  onStatusChange?: (status: ChunkedUploadStatus) => void;
}

const MAX_CHUNK_ATTEMPTS = 4;
const RETRY_BASE_DELAY_MS = 500;
const CONCURRENCY = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return true;
  const status = (error as AxiosError).response?.status;
  return status === undefined || status >= 500;
}

function waitForOnline(): Promise<void> {
  if (navigator.onLine) return Promise.resolve();
  return new Promise((resolve) => {
    const handler = () => {
      window.removeEventListener('online', handler);
      resolve();
    };
    window.addEventListener('online', handler);
  });
}

export async function uploadFileInChunks(input: ChunkedUploadInput, callbacks: ChunkedUploadCallbacks = {}): Promise<Message> {
  const { conversationId, type, file, originalName, replyToMessageId } = input;
  const { onProgress, onStatusChange } = callbacks;

  const { uploadId, chunkSize, chunkCount } = await messagingApi.initiateUpload(
    conversationId,
    type,
    originalName,
    file.size,
  );

  const sentBytes = new Array(chunkCount).fill(0);
  const confirmed = new Set<number>();

  function chunkByteLength(index: number): number {
    return Math.min(chunkSize, file.size - index * chunkSize);
  }

  function reportProgress(): void {
    if (file.size === 0) {
      onProgress?.(1);
      return;
    }
    const sent = sentBytes.reduce((sum, value) => sum + value, 0);
    onProgress?.(Math.min(sent / file.size, 1));
  }

  async function uploadChunk(index: number): Promise<void> {
    if (confirmed.has(index)) return;
    const start = index * chunkSize;
    const blob = file.slice(start, start + chunkSize);

    for (let attempt = 1; attempt <= MAX_CHUNK_ATTEMPTS; attempt += 1) {
      if (!navigator.onLine) {
        onStatusChange?.('paused');
        await waitForOnline();
        const status = await messagingApi.uploadStatus(uploadId);
        status.receivedIndexes.forEach((received) => {
          confirmed.add(received);
          sentBytes[received] = chunkByteLength(received);
        });
        reportProgress();
        onStatusChange?.('uploading');
        if (confirmed.has(index)) return;
      }

      try {
        await messagingApi.uploadChunk(uploadId, index, blob, (event) => {
          sentBytes[index] = event.loaded;
          reportProgress();
        });
        confirmed.add(index);
        sentBytes[index] = chunkByteLength(index);
        reportProgress();
        return;
      } catch (error) {
        sentBytes[index] = 0;
        reportProgress();
        if (!isRetryableError(error) || attempt === MAX_CHUNK_ATTEMPTS) {
          throw error;
        }
        await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }

  onStatusChange?.('uploading');

  try {
    const queue = Array.from({ length: chunkCount }, (_, index) => index);
    let cursor = 0;
    async function worker(): Promise<void> {
      while (cursor < queue.length) {
        const index = queue[cursor];
        cursor += 1;
        await uploadChunk(index);
      }
    }
    await Promise.all(Array.from({ length: Math.max(1, Math.min(CONCURRENCY, chunkCount)) }, worker));

    onStatusChange?.('completing');
    return await messagingApi.completeUpload(uploadId, replyToMessageId);
  } catch (error) {
    await messagingApi.abortUpload(uploadId).catch(() => {});
    throw error;
  }
}
