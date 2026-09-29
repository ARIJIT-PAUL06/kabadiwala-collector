// Serves: R01, R02, R03, R04, R16
import { SEED_MATERIALS } from '../src/data/seed/materials';
import { SEED_PRICES } from '../src/data/seed/prices';
import { SEED_RECYCLERS } from '../src/data/seed/recyclers';
import { SEED_DISTRICTS } from '../src/data/seed/areas';
import { LotSchema, safeParseArray } from '../src/domain/schemas';
import { repo } from '../src/data/repo';
import { lotsToCSV, ledgerToCSV } from '../src/data/export';
import { Lot } from '../src/domain/types';

describe('M3 Domain, Schemas & Seed Data Test', () => {
  it('validates 9 seed materials with correct units and hazard flags', () => {
    expect(SEED_MATERIALS.length).toBe(9);
    const crt = SEED_MATERIALS.find((m) => m.id === 'crt');
    const lcd = SEED_MATERIALS.find((m) => m.id === 'lcd');
    const battery = SEED_MATERIALS.find((m) => m.id === 'battery');
    const pcb = SEED_MATERIALS.find((m) => m.id === 'pcb');

    expect(crt?.unit).toBe('piece');
    expect(crt?.hazardous).toBe(true);
    expect(lcd?.unit).toBe('piece');
    expect(battery?.unit).toBe('kg');
    expect(battery?.hazardous).toBe(true);
    expect(pcb?.unit).toBe('kg');
    expect(pcb?.hazardous).toBe(false);
  });

  it('generates 8 weeks of daily price records with mulberry32 PRNG', () => {
    expect(SEED_PRICES.length).toBeGreaterThan(1000); // 56 days * 9 materials * 3 localities = 1512 records
    const sample = SEED_PRICES[0];
    expect(sample.buyLow).toBeGreaterThan(0);
    expect(sample.buyHigh).toBeGreaterThanOrEqual(sample.buyLow);
    expect(sample.district).toBe('Nagpur');
    expect(sample.source).toBe('SYNTHETIC');
  });

  it('verifies 6 seed recyclers with authorization and hard-filter flags', () => {
    expect(SEED_RECYCLERS.length).toBe(6);
    const expired = SEED_RECYCLERS.find((r) => r.authorisation.status === 'EXPIRED');
    const unverified = SEED_RECYCLERS.find((r) => r.authorisation.status === 'UNVERIFIED');
    const valid = SEED_RECYCLERS.filter((r) => r.authorisation.status === 'VALID');

    expect(expired).toBeDefined();
    expect(unverified).toBeDefined();
    expect(valid.length).toBe(4);

    // Each recycler has a 64-char hex Ed25519 public key
    SEED_RECYCLERS.forEach((r) => {
      expect(r.publicKeyHex).toMatch(/^[0-9a-f]{64}$/);
      expect(r.demo).toBe(true);
    });

    // Test districts and repo
    expect(SEED_DISTRICTS.length).toBeGreaterThanOrEqual(5);
    expect(repo.getMaterials().length).toBe(9);
    expect(repo.getRecyclers().length).toBe(6);
  });

  it('drops corrupt records safely via Zod schema validation without throwing', () => {
    const mixedRecords = [
      {
        id: 'valid-1',
        ref: 'KC-260929-1234',
        collectorId: 'col-1',
        items: [],
        photos: [],
        collectedAt: '2026-09-29T12:00:00Z',
        status: 'DRAFT',
        history: [{ at: '2026-09-29T12:00:00Z', status: 'DRAFT' }],
        updatedAt: '2026-09-29T12:00:00Z',
      },
      {
        id: 'corrupt-record',
        ref: 12345, // invalid type
        status: 'INVALID_STATUS', // invalid enum
      },
    ];

    const safeResults = safeParseArray(LotSchema, mixedRecords, 'Lot');
    expect(safeResults.length).toBe(1);
    expect(safeResults[0].id).toBe('valid-1');
  });

  it('generates valid CSV export strings for lots and ledger', () => {
    const mockLot: Lot = {
      id: 'lot-1',
      ref: 'KC-260929-TEST',
      collectorId: 'col-1',
      items: [
        {
          id: 'i-1',
          materialId: 'pcb',
          qty: 10,
          unit: 'kg',
          condition: 'whole',
        },
      ],
      photos: [],
      collectedAt: '2026-09-29T12:00:00Z',
      status: 'PAID',
      history: [],
      updatedAt: '2026-09-29T12:00:00Z',
      finalPrice: 2200,
      recyclerId: 'rec_greencycle',
    };

    const csv = lotsToCSV([mockLot]);
    expect(csv).toContain('Reference,Status,Date,Materials,DeclaredQty,FinalPrice,BuyerId');
    expect(csv).toContain('KC-260929-TEST');
    expect(csv).toContain('2200');

    const ledgerCsv = ledgerToCSV([
      {
        id: 'led-1',
        lotId: 'lot-1',
        ref: 'KC-260929-TEST',
        at: '2026-09-29T12:00:00Z',
        amount: 2200,
        status: 'paid',
        method: 'cash',
        buyerName: 'GreenCycle',
        materials: ['pcb'],
      },
    ]);
    expect(ledgerCsv).toContain('Reference,Date,Amount,Status,Method,Buyer,Materials');
    expect(ledgerCsv).toContain('GreenCycle');
  });
});
