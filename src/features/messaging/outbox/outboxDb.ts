import { openDB, type IDBPDatabase } from 'idb';
import type { MessageType } from '../types';

const DB_NAME = 'messaging-outbox';
const DB_VERSION = 1;
const STORE_NAME = 'pendingSends';

export interface OutboxTextEntry {
  clientId: string;
  kind: 'text';
  conversationId: number;
  body: string;
  replyToMessageId?: number;
  createdAt: string;
  status: 'pending' | 'failed';
}

export interface OutboxAttachmentEntry {
  clientId: string;
  kind: 'attachment';
  conversationId: number;
  type: MessageType;
  file: Blob;
  filename: string;
  replyToMessageId?: number;
  createdAt: string;
  status: 'pending' | 'failed';
}

export type OutboxEntry = OutboxTextEntry | OutboxAttachmentEntry;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'clientId' });
    },
  });
  return dbPromise;
}

export async function putOutboxEntry(entry: OutboxEntry): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, entry);
}

export async function deleteOutboxEntry(clientId: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, clientId);
}

export async function markOutboxEntryFailed(clientId: string): Promise<void> {
  const db = await getDb();
  const existing = (await db.get(STORE_NAME, clientId)) as OutboxEntry | undefined;
  if (!existing) return;
  await db.put(STORE_NAME, { ...existing, status: 'failed' });
}

export async function markOutboxEntryPending(clientId: string): Promise<void> {
  const db = await getDb();
  const existing = (await db.get(STORE_NAME, clientId)) as OutboxEntry | undefined;
  if (!existing) return;
  await db.put(STORE_NAME, { ...existing, status: 'pending' });
}

export async function getOutboxEntry(clientId: string): Promise<OutboxEntry | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, clientId);
}

export async function listOutboxEntries(): Promise<OutboxEntry[]> {
  const db = await getDb();
  const all = (await db.getAll(STORE_NAME)) as OutboxEntry[];
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
