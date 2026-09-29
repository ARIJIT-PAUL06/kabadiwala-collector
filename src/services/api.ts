// Serves: R12, R16
import { Lot, PriceRecord, Recycler } from '../domain/types';

export interface PushResult {
  accepted: string[];
  serverTime: string;
}

export interface PullResult {
  lots: Partial<Lot>[];
  prices: PriceRecord[];
  recyclers: Recycler[];
  serverTime: string;
}

export interface OfferResult {
  quoted: number;
}

export interface CounterResult {
  quoted: number;
  accepted: boolean;
}

export interface Api {
  pushLots(lots: Lot[]): Promise<PushResult>;
  pullChanges(since?: string): Promise<PullResult>;
  sendOffer(lotId: string, recyclerId: string): Promise<OfferResult>;
  counterOffer(lotId: string, asked: number): Promise<CounterResult>;
}
