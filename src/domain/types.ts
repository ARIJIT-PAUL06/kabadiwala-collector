// Serves: R01, R02, R03, R04, R08, R09, R15, R16
export type Lang = 'mr' | 'hi' | 'en';
export type MaterialId =
  | 'crt'
  | 'lcd'
  | 'pcb'
  | 'cable'
  | 'battery'
  | 'motor'
  | 'magnet'
  | 'plastic'
  | 'other';
export type Unit = 'kg' | 'piece';
export type Condition = 'whole' | 'partly_opened' | 'damaged';

export interface Material {
  id: MaterialId;
  unit: Unit; // crt, lcd -> 'piece'; rest -> 'kg'
  subCategories: string[]; // e.g. pcb: ['low_grade','mid_grade','high_grade']
  hazardous: boolean; // battery, crt -> true (triggers S20)
}

export interface PriceRecord {
  id: string;
  materialId: MaterialId;
  subCategory?: string;
  district: string; // 'Nagpur'
  locality?: string;
  date: string; // ISO date 'YYYY-MM-DD'
  buyLow: number;
  buyHigh: number; // ₹ per unit, local buying range
  recyclerOffer?: number; // ₹ per unit offered by an authorised recycler
  recyclerId?: string;
  unit: Unit;
  source: 'SYNTHETIC' | 'FIELD_SURVEY' | 'RECYCLER' | 'TRANSACTION';
}

export interface Recycler {
  id: string;
  name: string; // FICTIONAL in demo
  kind: 'recycler' | 'dismantler' | 'aggregator_hub';
  district: string;
  locality: string;
  lat: number;
  lng: number;
  accepts: MaterialId[];
  authorisation: {
    number: string;
    issuer: string;
    status: 'VALID' | 'EXPIRED' | 'SUSPENDED' | 'UNVERIFIED';
    validUntil: string;
  };
  phoneMasked: string; // '98xxxxxx21' in demo
  offers: Partial<Record<MaterialId, number>>; // ₹ per unit
  pickup: { available: boolean; days: number[]; minKg: number };
  serviceRadiusKm: number;
  reliability: number; // 0..1 (demo constant; later from transactions)
  publicKeyHex: string; // Ed25519 public key, used to verify receipts
  demo: true;
}

export interface LotItem {
  id: string;
  materialId: MaterialId;
  subCategory?: string;
  qty: number;
  qtyRange?: [number, number];
  unit: Unit;
  condition: Condition;
}

export type LotStatus =
  | 'DRAFT'
  | 'VALUED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'HANDED_OVER'
  | 'CONFIRMED'
  | 'PAID'
  | 'PAYMENT_PENDING'
  | 'CANCELLED';

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracyM?: number;
}

export interface HandoverRecord {
  ref: string;
  lotId: string;
  recyclerId: string;
  photos: string[];
  photoHashes?: string[];
  declaredQty: number;
  unit: Unit;
  at: string;
  location?: GeoPoint;
  prevHash: string;
  recordHash: string;
  code6: string;
  confirmation?: {
    measuredQty: number;
    finalPrice: number;
    confirmedAt: string;
    signatureHex: string;
  };
}

export interface Payment {
  method: 'cash' | 'upi' | 'pending';
  amount: number;
  at?: string;
  upiRefLast4?: string;
}

export interface Lot {
  id: string; // uuid
  ref: string; // 'KC-260929-7F3A' human reference
  collectorId: string;
  items: LotItem[];
  photos: string[]; // local URIs (native) or data URLs (web)
  description?: string;
  estimate?: {
    low: number;
    high: number;
    basis: string;
    computedAt: string;
  };
  recyclerId?: string;
  quoted?: number; // buyer's offer (₹ total)
  counterAsked?: number;
  finalPrice?: number; // confirmed by recycler
  measuredQty?: number; // confirmed by recycler
  collectedAt: string;
  collectedLocation?: GeoPoint;
  handover?: HandoverRecord;
  payment?: Payment;
  status: LotStatus;
  history: { at: string; status: LotStatus; note?: string }[];
  anomaly?: 'LOW' | 'HIGH';
  updatedAt: string;
  syncedAt?: string;
}

export interface CollectorProfile {
  id: string;
  lang: Lang;
  district: string;
  locality: string;
  phoneHash?: string; // SHA-256(salt+phone); raw phone never stored
  role: 'collector' | 'aggregator';
  createdAt: string;
}

export interface OutboxOp {
  id: string;
  kind: 'UPSERT_LOT' | 'CREATE_LOT' | 'UPDATE_LOT' | 'OFFER_SENT' | 'COUNTER_OFFER' | 'HANDOVER' | 'PAYMENT';
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  lastError?: string;
}
