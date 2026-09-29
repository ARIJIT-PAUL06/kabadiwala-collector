// Serves: R03, R08
import { Lot, LotItem, LotStatus } from './types';

const ALLOWED_TRANSITIONS: Record<LotStatus, LotStatus[]> = {
  DRAFT: ['VALUED', 'CANCELLED'],
  VALUED: ['OFFERED', 'DRAFT', 'CANCELLED'],
  OFFERED: ['ACCEPTED', 'VALUED', 'CANCELLED'],
  ACCEPTED: ['HANDED_OVER', 'OFFERED', 'CANCELLED'],
  HANDED_OVER: ['CONFIRMED'],
  CONFIRMED: ['PAID', 'PAYMENT_PENDING'],
  PAYMENT_PENDING: ['PAID'],
  PAID: [],
  CANCELLED: [],
};

export class LotStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LotStateError';
  }
}

/**
 * Checks whether a status transition is permitted.
 */
export function canTransition(from: LotStatus, to: LotStatus): boolean {
  if (from === to) return true;
  const allowed = ALLOWED_TRANSITIONS[from];
  return Boolean(allowed && allowed.includes(to));
}

/**
 * Asserts that a status transition is permitted, throwing LotStateError otherwise.
 */
export function assertTransition(from: LotStatus, to: LotStatus): void {
  if (!canTransition(from, to)) {
    throw new LotStateError(
      `Illegal lot state transition from '${from}' to '${to}'.`,
    );
  }
}

/**
 * Checks whether items, photos and declared quantities are immutable in this state.
 * Any state from HANDED_OVER onwards is strictly locked.
 */
export function isLotImmutable(status: LotStatus): boolean {
  return (
    status === 'HANDED_OVER' ||
    status === 'CONFIRMED' ||
    status === 'PAID' ||
    status === 'PAYMENT_PENDING' ||
    status === 'CANCELLED'
  );
}

/**
 * Asserts that lot content is mutable, throwing LotStateError if locked.
 */
export function assertMutable(lot: Lot): void {
  if (isLotImmutable(lot.status)) {
    throw new LotStateError(
      `Lot ${lot.ref} is locked (${lot.status}). Items, photos, and declared quantity cannot be modified once handed over or cancelled.`,
    );
  }
}

/**
 * Pure transition function that updates lot status and appends an entry to history.
 */
export function transitionLot(
  lot: Lot,
  nextStatus: LotStatus,
  note?: string,
  timestamp?: string,
): Lot {
  assertTransition(lot.status, nextStatus);

  const at = timestamp || new Date().toISOString();
  return {
    ...lot,
    status: nextStatus,
    updatedAt: at,
    history: [
      ...(lot.history || []),
      {
        at,
        status: nextStatus,
        note,
      },
    ],
  };
}

/**
 * Safely updates items of a lot, enforcing immutability.
 */
export function updateLotItems(lot: Lot, items: LotItem[]): Lot {
  assertMutable(lot);
  return {
    ...lot,
    items,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Safely updates photos of a lot, enforcing immutability.
 */
export function updateLotPhotos(lot: Lot, photos: string[]): Lot {
  assertMutable(lot);
  return {
    ...lot,
    photos,
    updatedAt: new Date().toISOString(),
  };
}
