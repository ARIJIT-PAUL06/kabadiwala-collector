// SYNTHETIC DEMO DATA — not real prices or real businesses. Replace with field survey data.
// TODO(field-data)
// Serves: R02, R16
import { PriceRecord, MaterialId, Unit } from '../../domain/types';

// Deterministic PRNG: mulberry32
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MaterialBaseRate {
  low: number;
  high: number;
  unit: Unit;
  weeklyDriftPercent: number; // e.g. +1.5% per week for cable, -0.5% for battery
}

const BASE_RATES: Record<MaterialId, MaterialBaseRate> = {
  crt: { low: 80, high: 180, unit: 'piece', weeklyDriftPercent: -0.2 },
  lcd: { low: 100, high: 250, unit: 'piece', weeklyDriftPercent: 0.1 },
  pcb: { low: 90, high: 220, unit: 'kg', weeklyDriftPercent: 0.8 },
  cable: { low: 150, high: 320, unit: 'kg', weeklyDriftPercent: 1.4 }, // trends up
  battery: { low: 40, high: 90, unit: 'kg', weeklyDriftPercent: -0.6 }, // drifts down slightly
  motor: { low: 45, high: 90, unit: 'kg', weeklyDriftPercent: 0.2 },
  magnet: { low: 60, high: 140, unit: 'kg', weeklyDriftPercent: 0.3 },
  plastic: { low: 12, high: 30, unit: 'kg', weeklyDriftPercent: 0.0 }, // flat
  other: { low: 5, high: 20, unit: 'kg', weeklyDriftPercent: 0.0 },
};

const LOCALITIES = ['itwari', 'gandhibagh', 'kamptee'];

export function generateSeedPrices(): PriceRecord[] {
  const rng = mulberry32(26229);
  const records: PriceRecord[] = [];
  const baseDate = new Date('2026-09-29T12:00:00Z');
  const totalDays = 56; // 8 weeks

  const materials = Object.keys(BASE_RATES) as MaterialId[];

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const d = new Date(baseDate.getTime() - dayOffset * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const weekNum = Math.floor(dayOffset / 7);

    materials.forEach((matId) => {
      const base = BASE_RATES[matId];
      // Weekly drift
      const driftMultiplier = 1 + (base.weeklyDriftPercent / 100) * (8 - weekNum);

      LOCALITIES.forEach((loc) => {
        // Daily noise ±8%
        const noiseLow = 1 + (rng() * 0.16 - 0.08);
        const noiseHigh = 1 + (rng() * 0.16 - 0.08);

        const buyLow = Math.round(base.low * driftMultiplier * noiseLow);
        const buyHigh = Math.max(buyLow + 5, Math.round(base.high * driftMultiplier * noiseHigh));

        // ~30% carry recyclerOffer (5-15% above buyHigh)
        let recyclerOffer: number | undefined;
        let recyclerId: string | undefined;
        if (rng() < 0.3) {
          const bonusPercent = 0.05 + rng() * 0.1;
          recyclerOffer = Math.round(buyHigh * (1 + bonusPercent));
          recyclerId = 'rec_greencycle';
        }

        records.push({
          id: `pr_${matId}_${loc}_${dateStr}`,
          materialId: matId,
          district: 'Nagpur',
          locality: loc,
          date: dateStr,
          buyLow,
          buyHigh,
          recyclerOffer,
          recyclerId,
          unit: base.unit,
          source: 'SYNTHETIC',
        });
      });
    });
  }

  return records;
}

export const SEED_PRICES: PriceRecord[] = generateSeedPrices();
