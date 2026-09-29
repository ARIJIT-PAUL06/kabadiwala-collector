// Serves: R05
import { PriceRecord, MaterialId } from './types';

export type AnomalyType = 'LOW' | 'HIGH';

/**
 * Computes a given percentile (0 to 100) from an array of numbers.
 */
export function calculatePercentile(numbers: number[], percentile: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Checks if a given price per unit is an anomaly against local 14-day price records.
 * Returns 'LOW' if < 0.6 * p20, 'HIGH' if > 1.6 * p80, otherwise undefined.
 */
export function detectPriceAnomaly(
  materialId: MaterialId,
  pricePerUnit: number,
  historicalPrices: PriceRecord[],
  district: string = 'Nagpur',
  referenceDate?: Date,
): AnomalyType | undefined {
  if (pricePerUnit <= 0) return 'LOW';

  let freshestTime = referenceDate ? referenceDate.getTime() : 0;
  if (!referenceDate && historicalPrices.length > 0) {
    historicalPrices.forEach((r) => {
      const t = new Date(r.date).getTime();
      if (t > freshestTime) freshestTime = t;
    });
  }
  if (freshestTime === 0) freshestTime = Date.now();

  const fourteenDaysMs = 14 * 86400000;

  // Filter prices for this material within 14 days in the district
  const localPrices = historicalPrices.filter((r) => {
    const rTime = new Date(r.date).getTime();
    return (
      r.materialId === materialId &&
      r.district.toLowerCase() === district.toLowerCase() &&
      freshestTime - rTime <= fourteenDaysMs &&
      freshestTime - rTime >= 0
    );
  });

  const baseRecords = localPrices.length >= 3 ? localPrices : historicalPrices.filter((r) => r.materialId === materialId);
  if (baseRecords.length === 0) return undefined;

  // Use average of buyLow and buyHigh as representative benchmark points
  const rates = baseRecords.map((r) => (r.buyLow + r.buyHigh) / 2);

  const p20 = calculatePercentile(rates, 20);
  const p80 = calculatePercentile(rates, 80);

  if (pricePerUnit < 0.6 * p20) {
    return 'LOW';
  }
  if (pricePerUnit > 1.6 * p80) {
    return 'HIGH';
  }

  return undefined;
}
