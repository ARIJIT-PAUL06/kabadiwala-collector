// SYNTHETIC DEMO DATA — not real prices or real businesses. Replace with field survey data.
// TODO(field-data)
// Serves: R04, R07, R08, R16
import nacl from 'tweetnacl';
import { Recycler } from '../../domain/types';

// Helper to derive Ed25519 public key from string seed
export function deriveDemoPublicKeyHex(seedStr: string): string {
  const seedBytes = new Uint8Array(32);
  for (let i = 0; i < seedStr.length; i++) {
    seedBytes[i % 32] = (seedBytes[i % 32] + seedStr.charCodeAt(i) * 31) % 256;
  }
  const keyPair = nacl.sign.keyPair.fromSeed(seedBytes);
  return Array.from(keyPair.publicKey)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const SEED_RECYCLERS: Recycler[] = [
  {
    id: 'rec_greencycle',
    name: 'GreenCycle Recyclers (demo)',
    kind: 'recycler',
    district: 'Nagpur',
    locality: 'Hingna MIDC',
    lat: 21.096,
    lng: 79.004,
    accepts: ['crt', 'lcd', 'pcb', 'cable', 'battery', 'motor', 'magnet', 'plastic', 'other'],
    authorisation: {
      number: 'DEMO-MPCB-EW-0001',
      issuer: 'Maharashtra Pollution Control Board',
      status: 'VALID',
      validUntil: '2028-03-31',
    },
    phoneMasked: '98xxxxxx21',
    offers: {
      crt: 190,
      lcd: 260,
      pcb: 235,
      cable: 330,
      battery: 95,
      motor: 95,
      magnet: 145,
      plastic: 32,
      other: 22,
    },
    pickup: {
      available: true,
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      minKg: 10,
    },
    serviceRadiusKm: 25,
    reliability: 0.96,
    publicKeyHex: deriveDemoPublicKeyHex('demo-recycler-rec_greencycle'),
    demo: true,
  },
  {
    id: 'rec_vidarbha',
    name: 'Vidarbha E-Waste Works (demo)',
    kind: 'recycler',
    district: 'Nagpur',
    locality: 'Kamptee Road',
    lat: 21.185,
    lng: 79.118,
    accepts: ['pcb', 'cable', 'battery', 'motor', 'magnet'],
    authorisation: {
      number: 'DEMO-MPCB-EW-0002',
      issuer: 'Maharashtra Pollution Control Board',
      status: 'VALID',
      validUntil: '2027-12-31',
    },
    phoneMasked: '98xxxxxx44',
    offers: {
      pcb: 240,
      cable: 335,
      battery: 90,
      motor: 98,
      magnet: 140,
    },
    pickup: {
      available: true,
      days: [2, 4, 6], // Tue, Thu, Sat
      minKg: 20,
    },
    serviceRadiusKm: 18,
    reliability: 0.92,
    publicKeyHex: deriveDemoPublicKeyHex('demo-recycler-rec_vidarbha'),
    demo: true,
  },
  {
    id: 'rec_itwari_hub',
    name: 'Itwari Aggregator Hub (demo)',
    kind: 'aggregator_hub',
    district: 'Nagpur',
    locality: 'Itwari',
    lat: 21.155,
    lng: 79.112,
    accepts: ['crt', 'lcd', 'pcb', 'cable', 'battery', 'motor', 'magnet', 'plastic', 'other'],
    authorisation: {
      number: 'DEMO-MPCB-EW-0003',
      issuer: 'Maharashtra Pollution Control Board',
      status: 'VALID',
      validUntil: '2027-06-30',
    },
    phoneMasked: '98xxxxxx78',
    offers: {
      crt: 175,
      lcd: 240,
      pcb: 210,
      cable: 310,
      battery: 85,
      motor: 88,
      magnet: 130,
      plastic: 28,
      other: 18,
    },
    pickup: {
      available: false,
      days: [],
      minKg: 0,
    },
    serviceRadiusKm: 10,
    reliability: 0.88,
    publicKeyHex: deriveDemoPublicKeyHex('demo-recycler-rec_itwari_hub'),
    demo: true,
  },
  {
    id: 'rec_hingna_dismantler',
    name: 'Hingna Dismantlers (demo)',
    kind: 'dismantler',
    district: 'Nagpur',
    locality: 'Wadi',
    lat: 21.148,
    lng: 78.995,
    accepts: ['crt', 'lcd', 'motor', 'plastic'],
    authorisation: {
      number: 'DEMO-MPCB-EW-0004',
      issuer: 'Maharashtra Pollution Control Board',
      status: 'VALID',
      validUntil: '2028-01-15',
    },
    phoneMasked: '98xxxxxx12',
    offers: {
      crt: 185,
      lcd: 250,
      motor: 92,
      plastic: 30,
    },
    pickup: {
      available: true,
      days: [1, 3, 5],
      minKg: 15,
    },
    serviceRadiusKm: 15,
    reliability: 0.85,
    publicKeyHex: deriveDemoPublicKeyHex('demo-recycler-rec_hingna_dismantler'),
    demo: true,
  },
  // EXPIRED recycler (tests hard filter in ranking)
  {
    id: 'rec_orange_city',
    name: 'Orange City Recovery (demo)',
    kind: 'recycler',
    district: 'Nagpur',
    locality: 'Sadar',
    lat: 21.161,
    lng: 79.083,
    accepts: ['pcb', 'cable', 'battery'],
    authorisation: {
      number: 'DEMO-MPCB-EW-0005',
      issuer: 'Maharashtra Pollution Control Board',
      status: 'EXPIRED',
      validUntil: '2025-12-31',
    },
    phoneMasked: '98xxxxxx99',
    offers: {
      pcb: 250,
      cable: 340,
      battery: 100,
    },
    pickup: {
      available: true,
      days: [1, 2, 3, 4, 5, 6],
      minKg: 5,
    },
    serviceRadiusKm: 20,
    reliability: 0.7,
    publicKeyHex: deriveDemoPublicKeyHex('demo-recycler-rec_orange_city'),
    demo: true,
  },
  // UNVERIFIED recycler (tests hard filter in ranking)
  {
    id: 'rec_kamptee_metals',
    name: 'Kamptee Road Metals (demo)',
    kind: 'recycler',
    district: 'Nagpur',
    locality: 'Kamptee Road',
    lat: 21.185,
    lng: 79.118,
    accepts: ['motor', 'magnet', 'cable'],
    authorisation: {
      number: 'DEMO-MPCB-EW-0006',
      issuer: 'Maharashtra Pollution Control Board',
      status: 'UNVERIFIED',
      validUntil: '2027-05-31',
    },
    phoneMasked: '98xxxxxx55',
    offers: {
      cable: 345,
      motor: 105,
      magnet: 150,
    },
    pickup: {
      available: false,
      days: [],
      minKg: 0,
    },
    serviceRadiusKm: 12,
    reliability: 0.5,
    publicKeyHex: deriveDemoPublicKeyHex('demo-recycler-rec_kamptee_metals'),
    demo: true,
  },
];
