// Serves: R02, R06
import { MaterialId, PriceRecord } from './types';

export interface MaterialTrend {
  materialId: MaterialId;
  points: [number, number, number, number];
  trend: 'up' | 'down' | 'flat';
  percentChange: number;
  latestRange: { low: number; high: number };
  freshestDate: string;
  isStale: boolean;
}

/**
 * Computes median value of an array of numbers.
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Computes 4-week weekly price trends for a material in a given district/locality.
 * Week 1: 28-22 days ago
 * Week 2: 21-15 days ago
 * Week 3: 14-8 days ago
 * Week 4: 7-0 days ago
 */
export function computeMaterialTrend(
  materialId: MaterialId,
  prices: PriceRecord[],
  district = 'Nagpur',
  refDateStr?: string,
): MaterialTrend {
  // Filter for material and district
  let relevant = prices.filter(
    (p) => p.materialId === materialId && p.district.toLowerCase() === district.toLowerCase(),
  );

  // Fallback to all districts if fewer than 5 records
  if (relevant.length < 5) {
    relevant = prices.filter((p) => p.materialId === materialId);
  }

  // Find freshest date among relevant records
  const dates = relevant.map((p) => p.date).sort();
  const freshestDate = dates.length > 0 ? dates[dates.length - 1] : '2026-09-29';

  const refDate = refDateStr ? new Date(refDateStr) : new Date(freshestDate);
  const refTime = refDate.getTime();
  const dayMs = 86400000;

  // Buckets for 4 weeks (oldest to newest: W1 -> W2 -> W3 -> W4)
  const buckets: number[][] = [[], [], [], []];

  for (const p of relevant) {
    const pDate = new Date(p.date);
    const diffDays = Math.floor((refTime - pDate.getTime()) / dayMs);

    const mid = (p.buyLow + p.buyHigh) / 2;

    if (diffDays >= 0 && diffDays < 7) {
      buckets[3].push(mid); // Week 4 (most recent)
    } else if (diffDays >= 7 && diffDays < 14) {
      buckets[2].push(mid); // Week 3
    } else if (diffDays >= 14 && diffDays < 21) {
      buckets[1].push(mid); // Week 2
    } else if (diffDays >= 21 && diffDays < 28) {
      buckets[0].push(mid); // Week 1 (oldest)
    }
  }

  // Fallback overall median for empty buckets
  const allMids = relevant.map((p) => (p.buyLow + p.buyHigh) / 2);
  const fallback = calculateMedian(allMids) || 100;

  const points: [number, number, number, number] = [
    calculateMedian(buckets[0]) || fallback,
    calculateMedian(buckets[1]) || fallback,
    calculateMedian(buckets[2]) || fallback,
    calculateMedian(buckets[3]) || fallback,
  ];

  // Backfill any zero points with adjacent values
  if (points[0] === 0) points[0] = points[1] || fallback;
  if (points[1] === 0) points[1] = points[0];
  if (points[2] === 0) points[2] = points[1];
  if (points[3] === 0) points[3] = points[2];

  // Calculate percentage change between Week 3 and Week 4
  const w3 = points[2];
  const w4 = points[3];
  const percentChange = w3 > 0 ? Math.round(((w4 - w3) / w3) * 100) : 0;

  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (percentChange > 3) {
    trend = 'up';
  } else if (percentChange < -3) {
    trend = 'down';
  }

  // Latest range from Week 4 records or freshest date records
  const recentRecords = relevant.filter((p) => {
    const pDate = new Date(p.date);
    return Math.floor((refTime - pDate.getTime()) / dayMs) <= 7;
  });

  const sourceForRange = recentRecords.length > 0 ? recentRecords : relevant;
  const latestRange = {
    low: calculateMedian(sourceForRange.map((p) => p.buyLow)),
    high: calculateMedian(sourceForRange.map((p) => p.buyHigh)),
  };

  // Stale check: true if freshest date is > 2 days older than system now
  const nowTime = new Date().getTime();
  const freshestTime = new Date(freshestDate).getTime();
  const isStale = Math.floor((nowTime - freshestTime) / dayMs) > 2;

  return {
    materialId,
    points,
    trend,
    percentChange,
    latestRange,
    freshestDate,
    isStale,
  };
}
