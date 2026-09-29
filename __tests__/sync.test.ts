// Serves: R12, R16
import { SyncEngine } from '../src/sync/syncEngine';
import { Api, PushResult, PullResult, OfferResult, CounterResult } from '../src/services/api';
import { useOutboxStore } from '../src/store/useOutboxStore';
import { useLotStore } from '../src/store/useLotStore';
import { useAppStore } from '../src/store/useAppStore';
import { Lot, PriceRecord, Recycler } from '../src/domain/types';
import { LotSchema, safeParseArray } from '../src/domain/schemas';

class TestMockApi implements Api {
  public pushedLots: Lot[][] = [];
  public failNextPush = false;
  public failMidWay = false;
  public serverTime = '2026-09-30T10:00:00.000Z';
  public pullLotsToReturn: Partial<Lot>[] = [];

  async pushLots(lots: Lot[]): Promise<PushResult> {
    if (this.failNextPush) {
      throw new Error('Server connection error');
    }
    if (this.failMidWay && this.pushedLots.length >= 1) {
      throw new Error('Network drop mid-way');
    }
    this.pushedLots.push(lots);
    return {
      accepted: lots.map((l) => l.id),
      serverTime: this.serverTime,
    };
  }

  async pullChanges(_since?: string): Promise<PullResult> {
    return {
      lots: this.pullLotsToReturn,
      prices: [] as PriceRecord[],
      recyclers: [] as Recycler[],
      serverTime: this.serverTime,
    };
  }

  async sendOffer(_lotId: string, _recyclerId: string): Promise<OfferResult> {
    return { quoted: 1500 };
  }

  async counterOffer(_lotId: string, asked: number): Promise<CounterResult> {
    return { quoted: asked, accepted: true };
  }
}

describe('Milestone 9: Sync Engine 6 Scenarios', () => {
  let mockApi: TestMockApi;
  let sync: SyncEngine;

  const validLot: Lot = {
    id: 'test-lot-1',
    ref: 'KC-260930-A1B2',
    collectorId: 'coll-123',
    items: [
      {
        id: 'item-1',
        materialId: 'pcb',
        qty: 10,
        unit: 'kg',
        condition: 'whole',
      },
    ],
    photos: ['file:///photo1.jpg'],
    collectedAt: '2026-09-30T09:00:00.000Z',
    status: 'DRAFT',
    history: [{ at: '2026-09-30T09:00:00.000Z', status: 'DRAFT', note: 'Created' }],
    updatedAt: '2026-09-30T09:00:00.000Z',
  };

  beforeEach(() => {
    useAppStore.getState().resetAllData();
    useLotStore.getState().resetLots();
    useOutboxStore.getState().clearOutbox();
    useAppStore.getState().setSimulateOffline(false);

    mockApi = new TestMockApi();
    sync = new SyncEngine(mockApi);
  });

  // Scenario 1: create offline → go online → sent
  it('Scenario 1: create offline -> go online -> sent', async () => {
    // 1. App is offline
    useAppStore.getState().setSimulateOffline(true);
    expect(sync.getStatus()).toBe('offlineSaved');

    // 2. Create lot offline
    useLotStore.getState().upsertLot(validLot);
    expect(useOutboxStore.getState().getPendingCount()).toBe(1);

    // Sync while offline should abort and report offline
    const offlineResult = await sync.sync();
    expect(offlineResult.success).toBe(false);
    expect(mockApi.pushedLots.length).toBe(0);

    // 3. Go online
    useAppStore.getState().setSimulateOffline(false);
    expect(sync.getStatus()).toBe('waitingToSend');

    // 4. Sync succeeds and outbox is drained
    const onlineResult = await sync.sync();
    expect(onlineResult.success).toBe(true);
    expect(onlineResult.pushedCount).toBe(1);
    expect(mockApi.pushedLots.length).toBe(1);
    expect(mockApi.pushedLots[0][0].id).toBe(validLot.id);
    expect(useOutboxStore.getState().getPendingCount()).toBe(0);
    expect(sync.getStatus()).toBe('allSent');
  });

  // Scenario 2: two edits offline → one push, correct order
  it('Scenario 2: two edits offline -> pushes in exact sequential order', async () => {
    useAppStore.getState().setSimulateOffline(true);

    // First edit: Lot created
    useLotStore.getState().upsertLot(validLot);

    // Second edit: Lot offered to buyer
    useLotStore.getState().updateLotStatus(validLot.id, 'OFFERED', 'Offered to Recycler 1');

    const ops = useOutboxStore.getState().getPendingOps();
    expect(ops.length).toBe(2);
    expect(ops[0].kind).toBe('UPSERT_LOT');
    expect(ops[1].kind).toBe('UPDATE_LOT');

    // Go online & sync
    useAppStore.getState().setSimulateOffline(false);
    const result = await sync.sync();

    expect(result.success).toBe(true);
    expect(result.pushedCount).toBe(2);
    expect(mockApi.pushedLots.length).toBe(2);
    expect(useOutboxStore.getState().getPendingCount()).toBe(0);
  });

  // Scenario 3: push fails mid-way → retry without duplicates
  it('Scenario 3: push fails mid-way -> retry without duplicates', async () => {
    // Enqueue two ops
    useOutboxStore.getState().enqueue('UPSERT_LOT', validLot);
    const lot2: Lot = { ...validLot, id: 'test-lot-2', ref: 'KC-260930-C3D4' };
    const op2Id = useOutboxStore.getState().enqueue('UPSERT_LOT', lot2);

    expect(useOutboxStore.getState().getPendingCount()).toBe(2);

    // Configure mock API to fail mid-way on the 2nd push
    mockApi.failMidWay = true;

    // First sync attempt
    const result1 = await sync.sync(true);
    expect(result1.pushedCount).toBe(1);

    // Op 1 succeeded and was dequeued; Op 2 failed and remains
    const remainingOps = useOutboxStore.getState().getPendingOps();
    expect(remainingOps.length).toBe(1);
    expect(remainingOps[0].id).toBe(op2Id);
    expect(remainingOps[0].attempts).toBe(1);
    expect(remainingOps[0].lastError).toContain('Network drop mid-way');

    // Reset API error and retry
    mockApi.failMidWay = false;
    const result2 = await sync.sync(true);

    expect(result2.success).toBe(true);
    expect(result2.pushedCount).toBe(1);
    expect(useOutboxStore.getState().getPendingCount()).toBe(0);

    // Verify Op 1 was only pushed once across both sync calls
    const allPushedIds = mockApi.pushedLots.flat().map((l) => l.id);
    expect(allPushedIds.filter((id) => id === validLot.id).length).toBe(1);
    expect(allPushedIds.filter((id) => id === lot2.id).length).toBe(1);
  });

  // Scenario 4: app killed with a pending outbox → resumes
  it('Scenario 4: app killed with a pending outbox -> resumes and drains queue', async () => {
    // Enqueue op
    useOutboxStore.getState().enqueue('UPSERT_LOT', validLot);
    const persistedOps = useOutboxStore.getState().ops;
    expect(persistedOps.length).toBe(1);

    // Simulate app kill and state restore from persistent store
    const newSyncEngine = new SyncEngine(mockApi);
    expect(useOutboxStore.getState().getPendingCount()).toBe(1);

    // Resume sync on app launch
    const result = await newSyncEngine.sync();
    expect(result.success).toBe(true);
    expect(result.pushedCount).toBe(1);
    expect(useOutboxStore.getState().getPendingCount()).toBe(0);
    expect(mockApi.pushedLots.length).toBe(1);
  });

  // Scenario 5: server confirmation arrives → local status becomes CONFIRMED
  it('Scenario 5: server confirmation arrives -> local status becomes CONFIRMED', async () => {
    // Local lot is handed over
    const handedOverLot: Lot = {
      ...validLot,
      status: 'HANDED_OVER',
      quoted: 1400,
    };
    useLotStore.getState().upsertLot(handedOverLot, false);

    // Server returns confirmed data in pullChanges
    mockApi.pullLotsToReturn = [
      {
        id: handedOverLot.id,
        status: 'CONFIRMED',
        measuredQty: 10.5,
        finalPrice: 1470,
      },
    ];

    const result = await sync.sync();
    expect(result.success).toBe(true);

    const updatedLot = useLotStore.getState().getLot(handedOverLot.id);
    expect(updatedLot).toBeDefined();
    expect(updatedLot?.status).toBe('CONFIRMED');
    expect(updatedLot?.measuredQty).toBe(10.5);
    expect(updatedLot?.finalPrice).toBe(1470);
    expect(updatedLot?.history.some((h) => h.status === 'CONFIRMED')).toBe(true);
  });

  // Scenario 6: a corrupt stored record is dropped by zod without a crash
  it('Scenario 6: a corrupt stored record is dropped by zod without a crash', () => {
    const corruptRecords = [
      { id: 'corrupt-1' }, // Missing ref, items, status, etc.
      { id: 'corrupt-2', ref: 12345 }, // Invalid types
      null,
      undefined,
      validLot,
    ];

    // safeParseArray drops invalid records without throwing
    const cleanLots = safeParseArray(LotSchema, corruptRecords, 'Lot');
    expect(cleanLots.length).toBe(1);
    expect(cleanLots[0].id).toBe(validLot.id);
  });
});
