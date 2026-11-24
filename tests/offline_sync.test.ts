import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineSyncManager } from '../src/core/offline_sync';
import { Transaction } from '../src/types';

describe('OfflineSyncManager', () => {
  beforeEach(() => {
    OfflineSyncManager.clearQueue();
  });

  it('enqueues transactions during offline disconnection', () => {
    const tx: Transaction = {
      id: 'tx_offline_1',
      type: 'EXPENSE',
      amount: '45.00',
      currency: 'USD',
      categoryId: 'groceries',
      description: 'Farmers market',
      date: '2026-11-20'
    };

    const enqueued = OfflineSyncManager.enqueueOfflineTransaction(tx);
    expect(enqueued.isOfflineSync).toBe(true);
    expect(enqueued.syncStatus).toBe('pending');

    const pending = OfflineSyncManager.getPendingSyncItems();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe('tx_offline_1');
  });

  it('marks synchronized transactions upon network reconnection', () => {
    const tx: Transaction = {
      id: 'tx_offline_2',
      type: 'EXPENSE',
      amount: '30.00',
      currency: 'USD',
      categoryId: 'dining',
      description: 'Bakery',
      date: '2026-11-21'
    };

    OfflineSyncManager.enqueueOfflineTransaction(tx);
    OfflineSyncManager.markSynced(['tx_offline_2']);

    const pending = OfflineSyncManager.getPendingSyncItems();
    expect(pending.length).toBe(0);

    const all = OfflineSyncManager.getAllLocalTransactions();
    const syncedTx = all.find(t => t.id === 'tx_offline_2');
    expect(syncedTx?.syncStatus).toBe('synced');
  });

  it('resolves concurrent conflicts using last-write-wins timestamps', () => {
    const local: Transaction = {
      id: 'tx_conflict',
      type: 'EXPENSE',
      amount: '40.00',
      currency: 'USD',
      categoryId: 'groceries',
      description: 'Local update',
      date: '2026-11-20',
      createdAt: 1000
    };

    const remote: Transaction = {
      id: 'tx_conflict',
      type: 'EXPENSE',
      amount: '45.00',
      currency: 'USD',
      categoryId: 'groceries',
      description: 'Remote update (newer)',
      date: '2026-11-20',
      createdAt: 2000
    };

    const resolved = OfflineSyncManager.resolveConflict(local, remote);
    expect(resolved.amount).toBe('45.00');
    expect(resolved.description).toBe('Remote update (newer)');
    expect(resolved.syncStatus).toBe('synced');
  });
});
