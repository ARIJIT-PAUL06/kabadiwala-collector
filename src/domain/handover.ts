// Serves: R08
import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';
import { canonicalJson } from './canonicalJson';
import { GeoPoint, Lot, LotItem, Recycler, Unit } from './types';

export const GENESIS_HASH = '0'.repeat(64);

export interface HandoverPayloadData {
  at: string;
  collectorId: string;
  declaredQty: number;
  items: LotItem[];
  location?: GeoPoint;
  lotId: string;
  photoHashes: string[];
  recyclerId: string;
  ref: string;
  unit: Unit;
}

/**
 * Builds the canonical JSON string for the handover payload.
 * Keys are sorted recursively, no whitespace.
 */
export function buildHandoverCanonical(data: HandoverPayloadData): string {
  const payload: Record<string, unknown> = {
    at: data.at,
    collectorId: data.collectorId,
    declaredQty: data.declaredQty,
    items: data.items,
    location: data.location || { lat: 0, lng: 0 },
    lotId: data.lotId,
    photoHashes: data.photoHashes,
    recyclerId: data.recyclerId,
    ref: data.ref,
    unit: data.unit,
  };
  return canonicalJson(payload);
}

/**
 * Computes SHA-256 record hash from canonical payload and previous hash.
 */
export async function computeRecordHash(canonical: string, prevHash: string): Promise<string> {
  const effectivePrevHash = prevHash || GENESIS_HASH;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    canonical + effectivePrevHash,
  );
}

/**
 * Computes 6-digit numeric short code from record hash.
 * code6 = (parseInt(recordHash.slice(0, 8), 16) % 1_000_000) zero-padded.
 */
export function computeShortCode(recordHash: string): string {
  const hexPrefix = recordHash.slice(0, 8);
  const num = parseInt(hexPrefix, 16);
  const code = num % 1_000_000;
  return code.toString().padStart(6, '0');
}

/**
 * Generates QR code string payload in format:
 * KC1|{ref}|{recordHash}|{code6}
 */
export function generateQrPayload(ref: string, recordHash: string, code6: string): string {
  return `KC1|${ref}|${recordHash}|${code6}`;
}

/**
 * Parses and validates QR code payload.
 */
export function parseQrPayload(
  qrString: string,
): { ref: string; recordHash: string; code6: string } | null {
  const parts = qrString.trim().split('|');
  if (parts.length !== 4 || parts[0] !== 'KC1') {
    return null;
  }
  return {
    ref: parts[1],
    recordHash: parts[2],
    code6: parts[3],
  };
}

/**
 * Encodes string to UTF-8 Uint8Array.
 */
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Decodes hex string to Uint8Array.
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim().replace(/^0x/, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Converts Uint8Array to hex string.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifies Ed25519 signature over a message using the signer's public key hex.
 */
export function verifySignature(
  message: string,
  signatureHex: string,
  publicKeyHex: string,
): boolean {
  try {
    const msgBytes = stringToBytes(message);
    const sigBytes = hexToBytes(signatureHex);
    const pubKeyBytes = hexToBytes(publicKeyHex);

    if (sigBytes.length !== 64 || pubKeyBytes.length !== 32) {
      return false;
    }

    return nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Signs message with an Ed25519 secret key.
 */
export function signMessage(message: string, secretKey: Uint8Array): string {
  const msgBytes = stringToBytes(message);
  const signature = nacl.sign.detached(msgBytes, secretKey);
  return bytesToHex(signature);
}

export interface ChainVerificationResult {
  valid: boolean;
  brokenAtRef?: string;
  brokenIndex?: number;
  reason?: string;
}

/**
 * Recomputes and verifies the hash chain across all lots with handover records.
 * Ensures:
 * 1. prevHash matches previous lot's recordHash (or GENESIS_HASH for the first).
 * 2. recordHash matches SHA-256 of canonical JSON + prevHash.
 * 3. code6 matches computed short code.
 * 4. confirmation signature (if present) is valid under recycler's public key.
 */
export async function verifyChain(
  lots: Lot[],
  recyclers: Recycler[] = [],
): Promise<ChainVerificationResult> {
  const handedOverLots = lots
    .filter((l) => Boolean(l.handover))
    .sort((a, b) => (a.handover?.at || '').localeCompare(b.handover?.at || ''));

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < handedOverLots.length; i++) {
    const lot = handedOverLots[i];
    const handover = lot.handover!;

    // 1. Verify prevHash link
    if (handover.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        brokenAtRef: lot.ref,
        brokenIndex: i,
        reason: `PrevHash mismatch. Expected ${expectedPrevHash.slice(0, 8)}, got ${handover.prevHash.slice(0, 8)}`,
      };
    }

    // 2. Recompute canonical JSON
    const canonical = buildHandoverCanonical({
      at: handover.at,
      collectorId: lot.collectorId,
      declaredQty: handover.declaredQty,
      items: lot.items,
      location: handover.location,
      lotId: handover.lotId,
      photoHashes: handover.photoHashes || [],
      recyclerId: handover.recyclerId,
      ref: handover.ref,
      unit: handover.unit,
    });

    // 3. Recompute recordHash
    const computedHash = await computeRecordHash(canonical, expectedPrevHash);
    if (computedHash !== handover.recordHash) {
      return {
        valid: false,
        brokenAtRef: lot.ref,
        brokenIndex: i,
        reason: `RecordHash mismatch. Computed ${computedHash.slice(0, 8)}, stored ${handover.recordHash.slice(0, 8)}`,
      };
    }

    // 4. Verify code6
    const computedCode6 = computeShortCode(computedHash);
    if (computedCode6 !== handover.code6) {
      return {
        valid: false,
        brokenAtRef: lot.ref,
        brokenIndex: i,
        reason: `Code6 mismatch. Computed ${computedCode6}, stored ${handover.code6}`,
      };
    }

    // 5. Verify Ed25519 confirmation signature if confirmed
    if (handover.confirmation) {
      const recycler = recyclers.find((r) => r.id === handover.recyclerId);
      if (recycler && recycler.publicKeyHex) {
        const message = `${handover.recordHash}|${handover.confirmation.measuredQty}|${handover.confirmation.finalPrice}|${handover.confirmation.confirmedAt}`;
        const isValidSig = verifySignature(
          message,
          handover.confirmation.signatureHex,
          recycler.publicKeyHex,
        );
        if (!isValidSig) {
          return {
            valid: false,
            brokenAtRef: lot.ref,
            brokenIndex: i,
            reason: `Invalid Ed25519 confirmation signature from recycler ${recycler.id}`,
          };
        }
      }
    }

    expectedPrevHash = handover.recordHash;
  }

  return { valid: true };
}
