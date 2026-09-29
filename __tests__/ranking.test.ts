// Serves: R04, R07
import { rankRecyclers, haversineDistanceKm } from '../src/domain/ranking';
import { LotItem, Recycler, GeoPoint } from '../src/domain/types';

describe('M6 Domain Recycler Ranking Tests', () => {
  const collectorLoc: GeoPoint = { lat: 21.15, lng: 79.11 }; // Itwari / Central Nagpur

  const sampleItems: LotItem[] = [
    { id: '1', materialId: 'cable', qty: 10, unit: 'kg', condition: 'whole' },
    { id: '2', materialId: 'pcb', qty: 5, unit: 'kg', condition: 'whole' },
  ];

  const mockRecyclers: Recycler[] = [
    {
      id: 'rec_valid_near',
      name: 'Best Valid Recycler',
      kind: 'recycler',
      district: 'Nagpur',
      locality: 'Itwari',
      lat: 21.155,
      lng: 79.115,
      accepts: ['cable', 'pcb'],
      authorisation: {
        number: 'DEMO-AUTH-01',
        issuer: 'MPCB',
        status: 'VALID',
        validUntil: '2028-12-31',
      },
      phoneMasked: '98xxxxxx01',
      offers: { cable: 300, pcb: 200 },
      pickup: { available: true, days: [1, 2, 3], minKg: 5 },
      serviceRadiusKm: 20,
      reliability: 0.95,
      publicKeyHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      demo: true,
    },
    {
      id: 'rec_expired',
      name: 'Expired Recycler',
      kind: 'recycler',
      district: 'Nagpur',
      locality: 'Gandhibagh',
      lat: 21.152,
      lng: 79.112,
      accepts: ['cable', 'pcb'],
      authorisation: {
        number: 'DEMO-AUTH-02',
        issuer: 'MPCB',
        status: 'EXPIRED', // EXPIRED -> MUST BE FILTERED OUT
        validUntil: '2024-01-01',
      },
      phoneMasked: '98xxxxxx02',
      offers: { cable: 400, pcb: 300 },
      pickup: { available: true, days: [1, 2], minKg: 5 },
      serviceRadiusKm: 20,
      reliability: 0.99,
      publicKeyHex: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      demo: true,
    },
    {
      id: 'rec_no_materials',
      name: 'Plastic Only Recycler',
      kind: 'recycler',
      district: 'Nagpur',
      locality: 'Hingna',
      lat: 21.1,
      lng: 79.05,
      accepts: ['plastic'], // Does not accept cable or pcb -> MUST BE FILTERED OUT
      authorisation: {
        number: 'DEMO-AUTH-03',
        issuer: 'MPCB',
        status: 'VALID',
        validUntil: '2028-12-31',
      },
      phoneMasked: '98xxxxxx03',
      offers: { plastic: 30 },
      pickup: { available: false, days: [], minKg: 0 },
      serviceRadiusKm: 25,
      reliability: 0.85,
      publicKeyHex: '1122334455667788112233445566778811223344556677881122334455667788',
      demo: true,
    },
    {
      id: 'rec_far_away',
      name: 'Far Away Recycler',
      kind: 'recycler',
      district: 'Nagpur',
      locality: 'Remote MIDC',
      lat: 21.8,
      lng: 79.9, // > 80 km away
      accepts: ['cable', 'pcb'],
      authorisation: {
        number: 'DEMO-AUTH-04',
        issuer: 'MPCB',
        status: 'VALID',
        validUntil: '2028-12-31',
      },
      phoneMasked: '98xxxxxx04',
      offers: { cable: 280, pcb: 180 },
      pickup: { available: false, days: [], minKg: 0 },
      serviceRadiusKm: 15, // Radius is 15 km -> MUST BE FILTERED OUT
      reliability: 0.8,
      publicKeyHex: '9988776655443322998877665544332299887766554433229988776655443322',
      demo: true,
    },
  ];

  it('filters out expired, incompatible, and out-of-range recyclers', () => {
    const results = rankRecyclers(mockRecyclers, sampleItems, collectorLoc, new Date('2026-09-29'));
    expect(results.length).toBe(1);
    expect(results[0].recycler.id).toBe('rec_valid_near');
  });

  it('calculates accurate haversine distance in km', () => {
    // Distance between Itwari (21.15, 79.11) and Hingna (21.096, 79.004) ~ 12.5 km
    const dist = haversineDistanceKm(21.15, 79.11, 21.096, 79.004);
    expect(dist).toBeGreaterThan(10);
    expect(dist).toBeLessThan(15);
  });

  it('assigns reason codes correctly (BEST_RATE, PICKUP_TODAY, NEAREST, etc.)', () => {
    const results = rankRecyclers(mockRecyclers, sampleItems, collectorLoc, new Date('2026-09-29'));
    expect(results[0].reasons).toContain('BEST_RATE');
    expect(results[0].reasons).toContain('PICKUP_TODAY');
    expect(results[0].reasons.length).toBeLessThanOrEqual(2);
  });
});
