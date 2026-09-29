// Serves: R03, R08
import {
  canTransition,
  assertTransition,
  transitionLot,
  assertMutable,
  updateLotItems,
  updateLotPhotos,
  LotStateError,
} from '../src/domain/lotMachine';
import { Lot } from '../src/domain/types';

describe('Lot State Machine Tests', () => {
  const baseLot: Lot = {
    id: 'lot-test',
    ref: 'KC-260930-TEST',
    collectorId: 'col-1',
    items: [{ id: 'i1', materialId: 'cable', qty: 5, unit: 'kg', condition: 'whole' }],
    photos: ['photo-1.jpg'],
    collectedAt: '2026-09-30T10:00:00Z',
    status: 'DRAFT',
    history: [{ at: '2026-09-30T10:00:00Z', status: 'DRAFT' }],
    updatedAt: '2026-09-30T10:00:00Z',
  };

  it('allows valid state progression sequence', () => {
    let current = baseLot;
    expect(canTransition('DRAFT', 'VALUED')).toBe(true);
    current = transitionLot(current, 'VALUED');
    expect(current.status).toBe('VALUED');

    expect(canTransition('VALUED', 'OFFERED')).toBe(true);
    current = transitionLot(current, 'OFFERED');
    expect(current.status).toBe('OFFERED');

    expect(canTransition('OFFERED', 'ACCEPTED')).toBe(true);
    current = transitionLot(current, 'ACCEPTED');
    expect(current.status).toBe('ACCEPTED');

    expect(canTransition('ACCEPTED', 'HANDED_OVER')).toBe(true);
    current = transitionLot(current, 'HANDED_OVER');
    expect(current.status).toBe('HANDED_OVER');

    expect(canTransition('HANDED_OVER', 'CONFIRMED')).toBe(true);
    current = transitionLot(current, 'CONFIRMED');
    expect(current.status).toBe('CONFIRMED');

    expect(canTransition('CONFIRMED', 'PAID')).toBe(true);
    current = transitionLot(current, 'PAID');
    expect(current.status).toBe('PAID');

    expect(current.history).toHaveLength(7);
  });

  it('allows PAYMENT_PENDING to PAID transition', () => {
    let current = transitionLot(baseLot, 'VALUED');
    current = transitionLot(current, 'OFFERED');
    current = transitionLot(current, 'ACCEPTED');
    current = transitionLot(current, 'HANDED_OVER');
    current = transitionLot(current, 'CONFIRMED');
    current = transitionLot(current, 'PAYMENT_PENDING');
    expect(current.status).toBe('PAYMENT_PENDING');

    expect(canTransition('PAYMENT_PENDING', 'PAID')).toBe(true);
    current = transitionLot(current, 'PAID');
    expect(current.status).toBe('PAID');
  });

  it('allows cancellation prior to handover, rejects cancellation after handover', () => {
    expect(canTransition('DRAFT', 'CANCELLED')).toBe(true);
    expect(canTransition('VALUED', 'CANCELLED')).toBe(true);
    expect(canTransition('OFFERED', 'CANCELLED')).toBe(true);
    expect(canTransition('ACCEPTED', 'CANCELLED')).toBe(true);

    expect(canTransition('HANDED_OVER', 'CANCELLED')).toBe(false);
    expect(canTransition('CONFIRMED', 'CANCELLED')).toBe(false);
    expect(canTransition('PAID', 'CANCELLED')).toBe(false);

    expect(() => assertTransition('HANDED_OVER', 'CANCELLED')).toThrow(LotStateError);
  });

  it('strictly enforces immutability once handed over', () => {
    const mutableLot = { ...baseLot, status: 'ACCEPTED' as const };
    expect(() => assertMutable(mutableLot)).not.toThrow();

    const updated = updateLotItems(mutableLot, [
      { id: 'i2', materialId: 'pcb', qty: 2, unit: 'kg', condition: 'whole' },
    ]);
    expect(updated.items[0].materialId).toBe('pcb');

    const handedOverLot = { ...baseLot, status: 'HANDED_OVER' as const };
    expect(() => assertMutable(handedOverLot)).toThrow(LotStateError);
    expect(() => updateLotItems(handedOverLot, [])).toThrow(LotStateError);
    expect(() => updateLotPhotos(handedOverLot, [])).toThrow(LotStateError);
  });

  it('rejects arbitrary illegal jumps', () => {
    expect(() => assertTransition('DRAFT', 'HANDED_OVER')).toThrow(LotStateError);
    expect(() => assertTransition('CONFIRMED', 'DRAFT')).toThrow(LotStateError);
    expect(() => assertTransition('PAID', 'OFFERED')).toThrow(LotStateError);
  });
});
