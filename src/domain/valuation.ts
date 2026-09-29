// Serves: R01, R05
import { Condition, LotItem, MaterialId, PriceRecord } from './types';

export interface ItemValuation {
  itemId: string;
  materialId: MaterialId;
  subCategory?: string;
  rateLow: number;
  rateHigh: number;
  qtyLow: number;
  qtyHigh: number;
  factor: number;
  low: number;
  high: number;
}

export interface LotValuation {
  low: number;
  high: number;
  n: number;
  place: string;
  days: number;
  freshestDate: string;
  isWiderArea: boolean;
  items: ItemValuation[];
}

// Weight presets (kg)
// TODO(field-data): validate presets
export const WEIGHT_PRESETS = {
  smallBag: [1, 3] as [number, number], // 1–3 kg
  sack: [5, 15] as [number, number], // 5–15 kg
  handcart: [20, 60] as [number, number], // 20–60 kg
};

export function getConditionFactor(condition: Condition): number {
  // TODO(field-data): validate factors
  switch (condition) {
    case 'whole':
      return 1.0;
    case 'partly_opened':
      return 0.85;
    case 'damaged':
      return 0.6;
    default:
      return 1.0;
  }
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

const FALLBACK_RATES: Record<MaterialId, { low: number; high: number }> = {
  crt: { low: 100, high: 180 },
  lcd: { low: 120, high: 220 },
  pcb: { low: 100, high: 200 },
  cable: { low: 160, high: 300 },
  battery: { low: 45, high: 85 },
  motor: { low: 50, high: 90 },
  magnet: { low: 70, high: 130 },
  plastic: { low: 14, high: 28 },
  other: { low: 8, high: 18 },
};

/**
 * Calculates fair value for a set of items based on historical prices.
 * Returns a rounded range (nearest ₹10) with metadata on data freshness and source.
 */
export function calculateFairValue(
  items: LotItem[],
  priceRecords: PriceRecord[],
  district: string = 'Nagpur',
  referenceDate?: Date,
): LotValuation {
  if (items.length === 0) {
    return {
      low: 0,
      high: 0,
      n: 0,
      place: district,
      days: 14,
      freshestDate: new Date().toISOString().split('T')[0],
      isWiderArea: false,
      items: [],
    };
  }

  // Find freshest date in dataset or referenceDate
  let freshestTime = referenceDate ? referenceDate.getTime() : 0;
  if (!referenceDate && priceRecords.length > 0) {
    priceRecords.forEach((r) => {
      const t = new Date(r.date).getTime();
      if (t > freshestTime) freshestTime = t;
    });
  }
  if (freshestTime === 0) freshestTime = Date.now();
  const freshestDateStr = new Date(freshestTime).toISOString().split('T')[0];

  let totalN = 0;
  let maxDaysUsed = 14;
  let usedWiderArea = false;

  const itemValuations: ItemValuation[] = items.map((item) => {
    // 1. Filter by material
    const matRecords = priceRecords.filter((r) => r.materialId === item.materialId);

    // Filter within 14 days in collector's district
    const fourteenDaysMs = 14 * 86400000;
    const twentyEightDaysMs = 28 * 86400000;

    let candidateRecords = matRecords.filter((r) => {
      const rTime = new Date(r.date).getTime();
      return (
        r.district.toLowerCase() === district.toLowerCase() &&
        freshestTime - rTime <= fourteenDaysMs &&
        freshestTime - rTime >= 0
      );
    });
    let daysForThisItem = 14;

    // If < 5, widen to 28 days
    if (candidateRecords.length < 5) {
      candidateRecords = matRecords.filter((r) => {
        const rTime = new Date(r.date).getTime();
        return (
          r.district.toLowerCase() === district.toLowerCase() &&
          freshestTime - rTime <= twentyEightDaysMs &&
          freshestTime - rTime >= 0
        );
      });
      daysForThisItem = 28;
    }

    // If still < 5, widen to all districts
    let isWiderForThis = false;
    if (candidateRecords.length < 5) {
      candidateRecords = matRecords.filter((r) => {
        const rTime = new Date(r.date).getTime();
        return freshestTime - rTime <= twentyEightDaysMs && freshestTime - rTime >= 0;
      });
      isWiderForThis = true;
    }

    // Fallback if sparse
    if (candidateRecords.length === 0) {
      candidateRecords = matRecords;
    }

    let rateLow: number;
    let rateHigh: number;

    if (candidateRecords.length > 0) {
      rateLow = calculateMedian(candidateRecords.map((r) => r.buyLow));
      rateHigh = calculateMedian(candidateRecords.map((r) => r.buyHigh));
    } else {
      const fallback = FALLBACK_RATES[item.materialId] || { low: 10, high: 20 };
      rateLow = fallback.low;
      rateHigh = fallback.high;
    }

    if (rateHigh < rateLow) {
      rateHigh = rateLow;
    }

    const qtyLow = item.qtyRange ? item.qtyRange[0] : item.qty;
    const qtyHigh = item.qtyRange ? item.qtyRange[1] : item.qty;
    const factor = getConditionFactor(item.condition);

    const low = Math.round(rateLow * qtyLow * factor);
    const high = Math.round(rateHigh * qtyHigh * factor);

    totalN += candidateRecords.length;
    if (daysForThisItem > maxDaysUsed) maxDaysUsed = daysForThisItem;
    if (isWiderForThis) usedWiderArea = true;

    return {
      itemId: item.id,
      materialId: item.materialId,
      subCategory: item.subCategory,
      rateLow,
      rateHigh,
      qtyLow,
      qtyHigh,
      factor,
      low,
      high,
    };
  });

  const sumLow = itemValuations.reduce((acc, it) => acc + it.low, 0);
  const sumHigh = itemValuations.reduce((acc, it) => acc + it.high, 0);

  // Round to nearest ₹10
  let lotLow = Math.round(sumLow / 10) * 10;
  let lotHigh = Math.round(sumHigh / 10) * 10;

  if (lotHigh <= lotLow && lotLow > 0) {
    lotHigh = lotLow + 10;
  }

  return {
    low: lotLow,
    high: lotHigh,
    n: totalN,
    place: district,
    days: maxDaysUsed,
    freshestDate: freshestDateStr,
    isWiderArea: usedWiderArea,
    items: itemValuations,
  };
}
