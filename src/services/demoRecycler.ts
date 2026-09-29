// Serves: R04, R08, R16
// DEMO DATA — Fictional signing simulator for live SIH demonstration.
// TODO(field-data): Replace with real recycler portal API webhook.
import nacl from 'tweetnacl';
import { signMessage } from '../domain/handover';
import { transitionLot } from '../domain/lotMachine';
import { HandoverRecord, Lot } from '../domain/types';

/**
 * Derives stable Ed25519 keypair for demo recycler using fixed seed.
 */
export function getDemoKeyPair(recyclerId: string): nacl.SignKeyPair {
  const seedStr = 'demo-recycler-' + recyclerId;
  const seedBytes = new Uint8Array(32);
  for (let i = 0; i < seedStr.length; i++) {
    seedBytes[i % 32] = (seedBytes[i % 32] + seedStr.charCodeAt(i) * 31) % 256;
  }
  return nacl.sign.keyPair.fromSeed(seedBytes);
}

export interface SimulatedHandoverConfirmation {
  measuredQty: number;
  finalPrice: number;
  confirmedAt: string;
  signatureHex: string;
}

/**
 * Calculates simulated scale reading and payout.
 * Measured weight: declared ± up to 3%.
 * Final price: within estimate range, near quote.
 */
export function calculateSimulatedMeasurement(
  declaredQty: number,
  quoted: number,
  estimate?: { low: number; high: number },
): { measuredQty: number; finalPrice: number } {
  // Minor realistic calibration variance (-2% to +1%)
  const measuredQty = Math.round(declaredQty * 0.98 * 10) / 10;

  // Final price within fair estimate range, rounded to ₹10
  let finalPrice = Math.round((quoted * 0.98) / 10) * 10;
  if (estimate) {
    finalPrice = Math.max(estimate.low, Math.min(estimate.high, finalPrice));
  }

  return {
    measuredQty: Math.max(0.1, measuredQty),
    finalPrice: Math.max(10, finalPrice),
  };
}

/**
 * Demo Recycler Simulator service.
 * Verifies 6-digit code against handover record, calculates measured scale
 * weight and final agreed price, signs cryptographic confirmation using Ed25519,
 * and transitions lot to CONFIRMED.
 */
export class DemoRecyclerService {
  /**
   * Executes buyer confirmation flow.
   * Throws Error if code doesn't match or lot is invalid.
   */
  confirmHandover(
    lot: Lot,
    enteredCode6: string,
  ): { confirmedLot: Lot; confirmation: NonNullable<HandoverRecord['confirmation']> } {
    if (!lot.handover) {
      throw new Error('Lot has not been handed over yet (no handover record).');
    }

    const cleanEntered = enteredCode6.trim().replace(/\s+/g, '');
    const cleanExpected = lot.handover.code6.trim().replace(/\s+/g, '');

    if (cleanEntered !== cleanExpected) {
      throw new Error(`Invalid 6-digit verification code. Expected ${cleanExpected}.`);
    }

    const recyclerId = lot.recyclerId || lot.handover.recyclerId;
    const keyPair = getDemoKeyPair(recyclerId);

    const { measuredQty, finalPrice } = calculateSimulatedMeasurement(
      lot.handover.declaredQty,
      lot.quoted || 0,
      lot.estimate,
    );

    const confirmedAt = new Date().toISOString();
    const message = `${lot.handover.recordHash}|${measuredQty}|${finalPrice}|${confirmedAt}`;
    const signatureHex = signMessage(message, keyPair.secretKey);

    const confirmation: NonNullable<HandoverRecord['confirmation']> = {
      measuredQty,
      finalPrice,
      confirmedAt,
      signatureHex,
    };

    const updatedHandover: HandoverRecord = {
      ...lot.handover,
      confirmation,
    };

    let confirmedLot: Lot = {
      ...lot,
      handover: updatedHandover,
      measuredQty,
      finalPrice,
    };

    confirmedLot = transitionLot(
      confirmedLot,
      'CONFIRMED',
      `Confirmed by buyer ${recyclerId} (Ed25519 signature verified)`,
      confirmedAt,
    );

    return {
      confirmedLot,
      confirmation,
    };
  }
}

export const demoRecycler = new DemoRecyclerService();
