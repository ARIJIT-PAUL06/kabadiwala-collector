// Serves: R12, R16
import { Api } from '../services/api';
import { api } from '../services/mockApi';
import { useOutboxStore } from '../store/useOutboxStore';
import { useLotStore } from '../store/useLotStore';
import { getIsOnline } from './useOnline';
import { Lot, OutboxOp } from '../domain/types';

export type SyncStatus = 'allSent' | 'waitingToSend' | 'offlineSaved';

export interface SyncResult {
  success: boolean;
  pushedCount: number;
  error?: string;
}

export class SyncEngine {
  private apiInstance: Api;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private syncing = false;
  private lastSyncTime: string | null = null;
  private lastError: string | null = null;
  private statusListeners = new Set<(status: SyncStatus) => void>();

  constructor(customApi?: Api) {
    this.apiInstance = customApi || api;
  }

  setApi(customApi: Api) {
    this.apiInstance = customApi;
  }

  getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  isSyncing(): boolean {
    return this.syncing;
  }

  getStatus(): SyncStatus {
    const isOnline = getIsOnline();
    const pendingCount = useOutboxStore.getState().getPendingCount();

    if (!isOnline) {
      return 'offlineSaved';
    }
    if (pendingCount > 0) {
      return 'waitingToSend';
    }
    return 'allSent';
  }

  subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus() {
    const current = this.getStatus();
    this.statusListeners.forEach((fn) => fn(current));
  }

  /**
   * Starts background sync: runs immediately, then every 60 seconds.
   */
  start(): void {
    this.stop();
    // Immediate initial sync
    void this.sync();

    // 60-second recurring foreground interval
    this.syncTimer = setInterval(() => {
      void this.sync();
    }, 60_000);
  }

  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Main sync method: processes outbox queue in order, then pulls changes from server.
   * @param force If true, ignores backoff timing (used for manual "Send now").
   */
  async sync(force = false): Promise<SyncResult> {
    if (this.syncing) {
      return { success: false, pushedCount: 0, error: 'Sync already in progress' };
    }

    const isOnline = getIsOnline();
    if (!isOnline) {
      this.notifyStatus();
      return { success: false, pushedCount: 0, error: 'Device is offline' };
    }

    this.syncing = true;
    let pushedCount = 0;
    this.lastError = null;

    try {
      const pendingOps = useOutboxStore.getState().getPendingOps();
      const now = Date.now();

      // 1. Process outbox in strict order
      for (const op of pendingOps) {
        // Check exponential backoff (5s to 300s cap)
        if (!force && op.attempts > 0 && op.lastAttemptAt) {
          const lastAttemptTime = new Date(op.lastAttemptAt).getTime();
          const backoffDelay = Math.min(5000 * Math.pow(2, op.attempts - 1), 300_000);
          if (now - lastAttemptTime < backoffDelay) {
            // Still in backoff window, skip this and following ops to maintain order
            break;
          }
        }

        try {
          await this.processOp(op);
          useOutboxStore.getState().dequeue(op.id);
          pushedCount++;
        } catch (opErr: unknown) {
          const errMessage = opErr instanceof Error ? opErr.message : String(opErr);
          this.lastError = errMessage;
          useOutboxStore.getState().incrementAttempt(op.id, errMessage);
          // Stop on first failure to guarantee in-order delivery
          break;
        }
      }

      // 2. Pull changes from server
      const pullResult = await this.apiInstance.pullChanges(this.lastSyncTime || undefined);
      this.lastSyncTime = pullResult.serverTime || new Date().toISOString();

      // 3. Merge server changes
      if (pullResult.lots && pullResult.lots.length > 0) {
        this.mergeServerLots(pullResult.lots, pullResult.serverTime);
      }

      this.notifyStatus();
      return { success: true, pushedCount };
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      this.lastError = errMessage;
      this.notifyStatus();
      return { success: false, pushedCount, error: errMessage };
    } finally {
      this.syncing = false;
      this.notifyStatus();
    }
  }

  private async processOp(op: OutboxOp): Promise<void> {
    const lotStore = useLotStore.getState();

    switch (op.kind) {
      case 'UPSERT_LOT':
      case 'CREATE_LOT':
      case 'UPDATE_LOT':
      case 'HANDOVER':
      case 'PAYMENT': {
        const payloadLot = op.payload as Lot;
        const currentLot = lotStore.getLot(payloadLot.id) || payloadLot;
        await this.apiInstance.pushLots([currentLot]);
        break;
      }
      case 'OFFER_SENT': {
        const { lotId, recyclerId } = op.payload as { lotId: string; recyclerId: string };
        await this.apiInstance.sendOffer(lotId, recyclerId);
        break;
      }
      case 'COUNTER_OFFER': {
        const { lotId, asked } = op.payload as { lotId: string; asked: number };
        await this.apiInstance.counterOffer(lotId, asked);
        break;
      }
      default: {
        // Generic fallback for any other lot operation
        const fallbackLot = op.payload as Lot;
        if (fallbackLot?.id) {
          await this.apiInstance.pushLots([fallbackLot]);
        }
        break;
      }
    }
  }

  private mergeServerLots(serverLots: Partial<Lot>[], serverTime: string): void {
    const lotStore = useLotStore.getState();

    for (const serverLot of serverLots) {
      if (!serverLot.id) continue;

      const localLot = lotStore.getLot(serverLot.id);

      if (!localLot) {
        // If not in local store and complete enough, add it
        if (serverLot.ref && serverLot.items && serverLot.status) {
          lotStore.upsertLot(serverLot as Lot, false);
        }
        continue;
      }

      // Merge Rule from §11.3:
      // "the server wins on recycler-confirmed fields (confirmation, finalPrice, measuredQty).
      // The local copy wins on everything else. HANDED_OVER+ records are never overwritten locally."
      const updates: Partial<Lot> = {};
      let statusUpdated = false;

      if (serverLot.measuredQty !== undefined) {
        updates.measuredQty = serverLot.measuredQty;
      }
      if (serverLot.finalPrice !== undefined) {
        updates.finalPrice = serverLot.finalPrice;
      }

      // If server confirmed the handover:
      if (serverLot.status === 'CONFIRMED' && localLot.status === 'HANDED_OVER') {
        updates.status = 'CONFIRMED';
        statusUpdated = true;
      }

      if (Object.keys(updates).length > 0) {
        const nextHistory = statusUpdated
          ? [...localLot.history, { at: serverTime, status: 'CONFIRMED' as const, note: 'Confirmed by recycler' }]
          : localLot.history;

        lotStore.upsertLot(
          {
            ...localLot,
            ...updates,
            history: nextHistory,
            updatedAt: serverTime,
            syncedAt: serverTime,
          },
          false,
        );
      }
    }
  }
}

export const syncEngine = new SyncEngine();
