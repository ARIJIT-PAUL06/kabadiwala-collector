import { Api, PushResult, PullResult, OfferResult, CounterResult } from './api';
import { Lot } from '../domain/types';
import { SEED_RECYCLERS } from '../data/seed/recyclers';
import { generateSeedPrices } from '../data/seed/prices';
import { useAppStore } from '../store/useAppStore';
import { useLotStore } from '../store/useLotStore';
import { getConditionFactor } from '../domain/valuation';

export class OfflineError extends Error {
  constructor(message = 'Network unavailable: offline mode active') {
    super(message);
    this.name = 'OfflineError';
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockApi implements Api {
  private async checkOnline() {
    const isOffline = useAppStore.getState().simulateOffline;
    if (isOffline) {
      throw new OfflineError();
    }
    // Simulate 400-600ms latency
    await delay(Math.floor(Math.random() * 200) + 400);
  }

  async pushLots(lots: Lot[]): Promise<PushResult> {
    await this.checkOnline();
    return {
      accepted: lots.map((l) => l.id),
      serverTime: new Date().toISOString(),
    };
  }

  async pullChanges(_since?: string): Promise<PullResult> {
    await this.checkOnline();
    return {
      lots: [],
      prices: generateSeedPrices(),
      recyclers: SEED_RECYCLERS,
      serverTime: new Date().toISOString(),
    };
  }

  async sendOffer(lotId: string, recyclerId: string): Promise<OfferResult> {
    await this.checkOnline();
    const recycler = SEED_RECYCLERS.find((r) => r.id === recyclerId);
    const lot = useLotStore.getState().getLot(lotId) || useLotStore.getState().activeDraft;

    if (!recycler || !lot) {
      return { quoted: 1200 };
    }

    let total = 0;
    lot.items.forEach((item) => {
      const rate = recycler.offers[item.materialId] || 80;
      const factor = getConditionFactor(item.condition);
      total += rate * item.qty * factor;
    });

    const rounded = Math.round(total / 10) * 10;
    return { quoted: rounded };
  }

  async counterOffer(lotId: string, asked: number): Promise<CounterResult> {
    await this.checkOnline();
    const lot = useLotStore.getState().getLot(lotId);
    const baseQuote = lot?.quoted || asked * 0.9;

    // Accept asks up to +8% of the quote
    if (asked <= baseQuote * 1.08) {
      return { quoted: asked, accepted: true };
    }

    // Above that, meet in the middle
    const counter = Math.round(((baseQuote + asked) / 2) / 10) * 10;
    return { quoted: counter, accepted: false };
  }
}

export const api: Api = new MockApi();
