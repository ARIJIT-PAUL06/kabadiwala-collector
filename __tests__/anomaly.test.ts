// Serves: R05
import { detectPriceAnomaly, calculatePercentile } from '../src/domain/anomaly';
import { PriceRecord } from '../src/domain/types';

describe('M6 Domain Anomaly Detection Tests', () => {
  it('calculates percentiles correctly', () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(calculatePercentile(values, 20)).toBe(28); // Interpolated 20th percentile
    expect(calculatePercentile(values, 80)).toBe(82); // Interpolated 80th percentile
  });

  it('detects unusually LOW prices (< 0.6 * p20)', () => {
    // 5 records with average rate ~ 200/kg
    const historicalPrices: PriceRecord[] = [
      { id: '1', materialId: 'cable', district: 'Nagpur', date: '2026-09-28', buyLow: 180, buyHigh: 220, unit: 'kg', source: 'SYNTHETIC' },
      { id: '2', materialId: 'cable', district: 'Nagpur', date: '2026-09-27', buyLow: 190, buyHigh: 210, unit: 'kg', source: 'SYNTHETIC' },
      { id: '3', materialId: 'cable', district: 'Nagpur', date: '2026-09-26', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
      { id: '4', materialId: 'cable', district: 'Nagpur', date: '2026-09-25', buyLow: 195, buyHigh: 205, unit: 'kg', source: 'SYNTHETIC' },
      { id: '5', materialId: 'cable', district: 'Nagpur', date: '2026-09-24', buyLow: 190, buyHigh: 210, unit: 'kg', source: 'SYNTHETIC' },
    ];

    // p20 is ~200. 0.6 * p20 = 120. A quote of ₹80/kg is suspiciously low!
    const anomaly = detectPriceAnomaly('cable', 80, historicalPrices, 'Nagpur', new Date('2026-09-29'));
    expect(anomaly).toBe('LOW');
  });

  it('detects unusually HIGH prices (> 1.6 * p80)', () => {
    const historicalPrices: PriceRecord[] = [
      { id: '1', materialId: 'cable', district: 'Nagpur', date: '2026-09-28', buyLow: 180, buyHigh: 220, unit: 'kg', source: 'SYNTHETIC' },
      { id: '2', materialId: 'cable', district: 'Nagpur', date: '2026-09-27', buyLow: 190, buyHigh: 210, unit: 'kg', source: 'SYNTHETIC' },
      { id: '3', materialId: 'cable', district: 'Nagpur', date: '2026-09-26', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
      { id: '4', materialId: 'cable', district: 'Nagpur', date: '2026-09-25', buyLow: 195, buyHigh: 205, unit: 'kg', source: 'SYNTHETIC' },
      { id: '5', materialId: 'cable', district: 'Nagpur', date: '2026-09-24', buyLow: 190, buyHigh: 210, unit: 'kg', source: 'SYNTHETIC' },
    ];

    // p80 is ~202. 1.6 * p80 = 323. A quote of ₹450/kg is suspiciously high!
    const anomaly = detectPriceAnomaly('cable', 450, historicalPrices, 'Nagpur', new Date('2026-09-29'));
    expect(anomaly).toBe('HIGH');
  });

  it('returns undefined for normal market prices', () => {
    const historicalPrices: PriceRecord[] = [
      { id: '1', materialId: 'cable', district: 'Nagpur', date: '2026-09-28', buyLow: 180, buyHigh: 220, unit: 'kg', source: 'SYNTHETIC' },
      { id: '2', materialId: 'cable', district: 'Nagpur', date: '2026-09-27', buyLow: 190, buyHigh: 210, unit: 'kg', source: 'SYNTHETIC' },
      { id: '3', materialId: 'cable', district: 'Nagpur', date: '2026-09-26', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
      { id: '4', materialId: 'cable', district: 'Nagpur', date: '2026-09-25', buyLow: 195, buyHigh: 205, unit: 'kg', source: 'SYNTHETIC' },
      { id: '5', materialId: 'cable', district: 'Nagpur', date: '2026-09-24', buyLow: 190, buyHigh: 210, unit: 'kg', source: 'SYNTHETIC' },
    ];

    // Standard rate of ₹195/kg is completely normal
    const anomaly = detectPriceAnomaly('cable', 195, historicalPrices, 'Nagpur', new Date('2026-09-29'));
    expect(anomaly).toBeUndefined();
  });
});
