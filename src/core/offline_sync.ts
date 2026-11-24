/**
 * Offline transaction entry and two-way synchronizer for Where Did It Go.
 * Provides resilient offline caching, optimistic client updates, and conflict resolution.
 */

import { Transaction } from '../types';

export interface SyncPayload {
  clientTimestamp: number;
  transactionsToUpsert: Transaction[];
  deletedTransactionIds: string[];
}

export class OfflineSyncManager {
  private static QUEUE_KEY = 'wherediditgo_offline_queue_v1';
  private static TRANSACTIONS_KEY = 'wherediditgo_transactions_store_v1';
  private static inMemoryQueue: Transaction[] = [];
  private static inMemoryStore: Map<string, Transaction> = new Map();

  static enqueueOfflineTransaction(tx: Transaction): Transaction {
    const offlineTx: Transaction = {
      ...tx,
      isOfflineSync: true,
      syncStatus: 'pending',
      createdAt: tx.createdAt || Date.now()
    };

    this.inMemoryStore.set(offlineTx.id, offlineTx);
    this.inMemoryQueue.push(offlineTx);
    this.persistLocalStore();

    return offlineTx;
  }

  static getPendingSyncItems(): Transaction[] {
    this.hydrateFromStorage();
    return [...this.inMemoryQueue];
  }

  static markSynced(transactionIds: string[]): void {
    const idSet = new Set(transactionIds);
    this.inMemoryQueue = this.inMemoryQueue.filter(t => !idSet.has(t.id));

    for (const id of idSet) {
      const existing = this.inMemoryStore.get(id);
      if (existing) {
        existing.syncStatus = 'synced';
        existing.isOfflineSync = false;
        this.inMemoryStore.set(id, existing);
      }
    }

    this.persistLocalStore();
  }

  static resolveConflict(local: Transaction, remote: Transaction): Transaction {
    // Last-Write-Wins based on creation or update timestamp
    const localTime = local.createdAt || 0;
    const remoteTime = remote.createdAt || 0;

    if (remoteTime >= localTime) {
      return { ...remote, syncStatus: 'synced' };
    } else {
      return { ...local, syncStatus: 'pending' };
    }
  }

  static getAllLocalTransactions(): Transaction[] {
    this.hydrateFromStorage();
    return Array.from(this.inMemoryStore.values());
  }

  static clearQueue(): void {
    this.inMemoryQueue = [];
    this.inMemoryStore.clear();
    this.persistLocalStore();
  }

  private static persistLocalStore(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.inMemoryQueue));
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(Array.from(this.inMemoryStore.values())));
    } catch {}
  }

  private static hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const q = localStorage.getItem(this.QUEUE_KEY);
      if (q) this.inMemoryQueue = JSON.parse(q);

      const s = localStorage.getItem(this.TRANSACTIONS_KEY);
      if (s) {
        const list: Transaction[] = JSON.parse(s);
        this.inMemoryStore.clear();
        list.forEach(t => this.inMemoryStore.set(t.id, t));
      }
    } catch {}
  }
}
