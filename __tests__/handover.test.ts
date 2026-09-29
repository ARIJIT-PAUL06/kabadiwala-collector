// Serves: R08
import { canonicalJson } from '../src/domain/canonicalJson';
import {
  buildHandoverCanonical,
  computeRecordHash,
  computeShortCode,
  generateQrPayload,
  parseQrPayload,
  verifySignature,
  verifyChain,
  GENESIS_HASH,
} from '../src/domain/handover';
import { demoRecycler, getDemoKeyPair } from '../src/services/demoRecycler';
import { Lot } from '../src/domain/types';

describe('Handover & Cryptographic Audit Tests', () => {
  it('canonicalJson sorts keys recursively and removes whitespace', () => {
    const objA = { z: 1, a: 2, m: { y: 'bar', b: 'foo' } };
    const objB = { m: { b: 'foo', y: 'bar' }, a: 2, z: 1 };

    const canonA = canonicalJson(objA);
    const canonB = canonicalJson(objB);

    expect(canonA).toBe(canonB);
    expect(canonA).toBe('{"a":2,"m":{"b":"foo","y":"bar"},"z":1}');
  });

  it('computes deterministic SHA-256 record hash and 6-digit short code', async () => {
    const canonical = '{"declaredQty":12.5,"ref":"KC-260930-A1B2"}';
    const hash1 = await computeRecordHash(canonical, GENESIS_HASH);
    const hash2 = await computeRecordHash(canonical, GENESIS_HASH);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);

    const code6 = computeShortCode(hash1);
    expect(code6).toHaveLength(6);
    expect(/^\d{6}$/.test(code6)).toBe(true);
  });

  it('formats and parses QR code payload correctly', () => {
    const ref = 'KC-260930-7F3A';
    const recordHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const code6 = '482913';

    const qr = generateQrPayload(ref, recordHash, code6);
    expect(qr).toBe(`KC1|${ref}|${recordHash}|${code6}`);

    const parsed = parseQrPayload(qr);
    expect(parsed).toEqual({ ref, recordHash, code6 });

    expect(parseQrPayload('INVALID_STRING')).toBeNull();
  });

  it('verifies Ed25519 signature from demo recycler and rejects tampering', () => {
    const recyclerId = 'rec_greencycle';
    const keyPair = getDemoKeyPair(recyclerId);
    const pubKeyHex = Array.from(keyPair.publicKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const lot: Lot = {
      id: 'lot-test-1',
      ref: 'KC-260930-TEST',
      collectorId: 'col-1',
      items: [{ id: 'item-1', materialId: 'pcb', qty: 10, unit: 'kg', condition: 'whole' }],
      photos: [],
      collectedAt: '2026-09-30T10:00:00Z',
      status: 'HANDED_OVER',
      history: [],
      quoted: 2400,
      recyclerId,
      handover: {
        ref: 'KC-260930-TEST',
        lotId: 'lot-test-1',
        recyclerId,
        photos: [],
        declaredQty: 10,
        unit: 'kg',
        at: '2026-09-30T10:05:00Z',
        prevHash: GENESIS_HASH,
        recordHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        code6: '654321',
      },
      updatedAt: '2026-09-30T10:05:00Z',
    };

    const { confirmation } = demoRecycler.confirmHandover(lot, '654321');
    expect(confirmation.signatureHex).toBeDefined();

    const message = `${lot.handover!.recordHash}|${confirmation.measuredQty}|${confirmation.finalPrice}|${confirmation.confirmedAt}`;
    const isValid = verifySignature(message, confirmation.signatureHex, pubKeyHex);
    expect(isValid).toBe(true);

    // Tampered price
    const tamperedMessage = `${lot.handover!.recordHash}|${confirmation.measuredQty}|999999|${confirmation.confirmedAt}`;
    const isTamperedValid = verifySignature(tamperedMessage, confirmation.signatureHex, pubKeyHex);
    expect(isTamperedValid).toBe(false);
  });

  it('validates a tamper-evident multi-lot hash chain with verifyChain', async () => {
    const lotId1 = 'lot-chain-1';
    const ref1 = 'KC-260930-0001';
    const at1 = '2026-09-30T09:00:00Z';
    const canon1 = buildHandoverCanonical({
      at: at1,
      collectorId: 'col-1',
      declaredQty: 5,
      items: [{ id: 'i1', materialId: 'cable', qty: 5, unit: 'kg', condition: 'whole' }],
      location: { lat: 21.14, lng: 79.08 },
      lotId: lotId1,
      photoHashes: [],
      recyclerId: 'rec_greencycle',
      ref: ref1,
      unit: 'kg',
    });
    const hash1 = await computeRecordHash(canon1, GENESIS_HASH);
    const code1 = computeShortCode(hash1);

    const lot1: Lot = {
      id: lotId1,
      ref: ref1,
      collectorId: 'col-1',
      items: [{ id: 'i1', materialId: 'cable', qty: 5, unit: 'kg', condition: 'whole' }],
      photos: [],
      collectedAt: at1,
      status: 'HANDED_OVER',
      history: [],
      handover: {
        ref: ref1,
        lotId: lotId1,
        recyclerId: 'rec_greencycle',
        photos: [],
        photoHashes: [],
        declaredQty: 5,
        unit: 'kg',
        at: at1,
        location: { lat: 21.14, lng: 79.08 },
        prevHash: GENESIS_HASH,
        recordHash: hash1,
        code6: code1,
      },
      updatedAt: at1,
    };

    const lotId2 = 'lot-chain-2';
    const ref2 = 'KC-260930-0002';
    const at2 = '2026-09-30T10:00:00Z';
    const canon2 = buildHandoverCanonical({
      at: at2,
      collectorId: 'col-1',
      declaredQty: 8,
      items: [{ id: 'i2', materialId: 'battery', qty: 8, unit: 'kg', condition: 'whole' }],
      location: { lat: 21.14, lng: 79.08 },
      lotId: lotId2,
      photoHashes: [],
      recyclerId: 'rec_greencycle',
      ref: ref2,
      unit: 'kg',
    });
    const hash2 = await computeRecordHash(canon2, hash1);
    const code2 = computeShortCode(hash2);

    const lot2: Lot = {
      id: lotId2,
      ref: ref2,
      collectorId: 'col-1',
      items: [{ id: 'i2', materialId: 'battery', qty: 8, unit: 'kg', condition: 'whole' }],
      photos: [],
      collectedAt: at2,
      status: 'HANDED_OVER',
      history: [],
      handover: {
        ref: ref2,
        lotId: lotId2,
        recyclerId: 'rec_greencycle',
        photos: [],
        photoHashes: [],
        declaredQty: 8,
        unit: 'kg',
        at: at2,
        location: { lat: 21.14, lng: 79.08 },
        prevHash: hash1,
        recordHash: hash2,
        code6: code2,
      },
      updatedAt: at2,
    };

    const result = await verifyChain([lot1, lot2]);
    expect(result.valid).toBe(true);

    // Now tamper lot1 items without recomputing hash
    const tamperedLot1 = {
      ...lot1,
      items: [{ ...lot1.items[0], qty: 999 }],
    };
    const tamperedResult = await verifyChain([tamperedLot1, lot2]);
    expect(tamperedResult.valid).toBe(false);
    expect(tamperedResult.brokenAtRef).toBe(ref1);
  });
});
