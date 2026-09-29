// Serves: R02, R06
import { computeMaterialTrend } from '../src/domain/trend';
import { generateSeedPrices } from '../src/data/seed/prices';

describe('Price Trend Domain Tests', () => {
  const seedPrices = generateSeedPrices();

  it('computes 4-week sparkline points for seed prices', () => {
    const trend = computeMaterialTrend('cable', seedPrices, 'Nagpur', '2026-09-29');

    expect(trend.materialId).toBe('cable');
    expect(trend.points).toHaveLength(4);
    expect(trend.points.every((pt) => typeof pt === 'number' && pt > 0)).toBe(true);
    expect(trend.latestRange.high).toBeGreaterThan(trend.latestRange.low);
    expect(['up', 'down', 'flat']).toContain(trend.trend);
  });

  it('detects up trend when last week is > +3% vs previous week', () => {
    const upPrices = [
      { id: '1', materialId: 'pcb' as const, district: 'Nagpur', date: '2026-09-29', buyLow: 110, buyHigh: 120, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '2', materialId: 'pcb' as const, district: 'Nagpur', date: '2026-09-22', buyLow: 100, buyHigh: 100, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '3', materialId: 'pcb' as const, district: 'Nagpur', date: '2026-09-15', buyLow: 98, buyHigh: 100, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '4', materialId: 'pcb' as const, district: 'Nagpur', date: '2026-09-08', buyLow: 95, buyHigh: 97, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '5', materialId: 'pcb' as const, district: 'Nagpur', date: '2026-09-01', buyLow: 90, buyHigh: 94, unit: 'kg' as const, source: 'SYNTHETIC' as const },
    ];

    const trend = computeMaterialTrend('pcb', upPrices, 'Nagpur', '2026-09-29');
    expect(trend.trend).toBe('up');
    expect(trend.percentChange).toBeGreaterThan(3);
  });

  it('detects down trend when last week is < -3% vs previous week', () => {
    const downPrices = [
      { id: '1', materialId: 'battery' as const, district: 'Nagpur', date: '2026-09-29', buyLow: 80, buyHigh: 84, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '2', materialId: 'battery' as const, district: 'Nagpur', date: '2026-09-22', buyLow: 95, buyHigh: 100, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '3', materialId: 'battery' as const, district: 'Nagpur', date: '2026-09-15', buyLow: 96, buyHigh: 100, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '4', materialId: 'battery' as const, district: 'Nagpur', date: '2026-09-08', buyLow: 97, buyHigh: 101, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '5', materialId: 'battery' as const, district: 'Nagpur', date: '2026-09-01', buyLow: 98, buyHigh: 102, unit: 'kg' as const, source: 'SYNTHETIC' as const },
    ];

    const trend = computeMaterialTrend('battery', downPrices, 'Nagpur', '2026-09-29');
    expect(trend.trend).toBe('down');
    expect(trend.percentChange).toBeLessThan(-3);
  });

  it('computes flat trend when prices are steady (between -3% and +3%)', () => {
    const steadyPrices = [
      { id: '1', materialId: 'plastic' as const, district: 'Nagpur', date: '2026-09-29', buyLow: 20, buyHigh: 30, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '2', materialId: 'plastic' as const, district: 'Nagpur', date: '2026-09-22', buyLow: 20, buyHigh: 30, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '3', materialId: 'plastic' as const, district: 'Nagpur', date: '2026-09-15', buyLow: 20, buyHigh: 30, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '4', materialId: 'plastic' as const, district: 'Nagpur', date: '2026-09-08', buyLow: 20, buyHigh: 30, unit: 'kg' as const, source: 'SYNTHETIC' as const },
      { id: '5', materialId: 'plastic' as const, district: 'Nagpur', date: '2026-09-01', buyLow: 20, buyHigh: 30, unit: 'kg' as const, source: 'SYNTHETIC' as const },
    ];

    const trend = computeMaterialTrend('plastic', steadyPrices, 'Nagpur', '2026-09-29');
    expect(trend.trend).toBe('flat');
    expect(trend.percentChange).toBe(0);
  });
});
