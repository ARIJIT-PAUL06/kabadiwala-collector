// Serves: R01, R05
import { calculateFairValue, calculateMedian, getConditionFactor, WEIGHT_PRESETS } from '../src/domain/valuation';
import { LotItem, PriceRecord } from '../src/domain/types';

describe('M5 Domain Valuation Tests', () => {
  it('calculates median correctly for odd and even sets', () => {
    expect(calculateMedian([10, 20, 30])).toBe(20);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    expect(calculateMedian([])).toBe(0);
    expect(calculateMedian([50])).toBe(50);
  });

  it('returns proper condition factors', () => {
    expect(getConditionFactor('whole')).toBe(1.0);
    expect(getConditionFactor('partly_opened')).toBe(0.85);
    expect(getConditionFactor('damaged')).toBe(0.6);
  });

  it('calculates valuation with 14-day window and ₹10 rounding', () => {
    const mockPrices: PriceRecord[] = [
      { id: '1', materialId: 'cable', district: 'Nagpur', date: '2026-09-28', buyLow: 180, buyHigh: 220, unit: 'kg', source: 'SYNTHETIC' },
      { id: '2', materialId: 'cable', district: 'Nagpur', date: '2026-09-27', buyLow: 190, buyHigh: 230, unit: 'kg', source: 'SYNTHETIC' },
      { id: '3', materialId: 'cable', district: 'Nagpur', date: '2026-09-26', buyLow: 200, buyHigh: 240, unit: 'kg', source: 'SYNTHETIC' },
      { id: '4', materialId: 'cable', district: 'Nagpur', date: '2026-09-25', buyLow: 200, buyHigh: 240, unit: 'kg', source: 'SYNTHETIC' },
      { id: '5', materialId: 'cable', district: 'Nagpur', date: '2026-09-24', buyLow: 210, buyHigh: 250, unit: 'kg', source: 'SYNTHETIC' },
    ];

    const items: LotItem[] = [
      {
        id: 'item-1',
        materialId: 'cable',
        qty: 10,
        unit: 'kg',
        condition: 'whole',
      },
    ];

    // Medians: buyLow = 200, buyHigh = 240
    // Qty = 10, factor = 1.0 -> Low = 2000, High = 2400
    const valuation = calculateFairValue(items, mockPrices, 'Nagpur', new Date('2026-09-29T12:00:00Z'));

    expect(valuation.low).toBe(2000);
    expect(valuation.high).toBe(2400);
    expect(valuation.days).toBe(14);
    expect(valuation.isWiderArea).toBe(false);
    expect(valuation.n).toBe(5);
  });

  it('applies condition factor correctly for damaged goods', () => {
    const mockPrices: PriceRecord[] = [
      { id: '1', materialId: 'cable', district: 'Nagpur', date: '2026-09-28', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
      { id: '2', materialId: 'cable', district: 'Nagpur', date: '2026-09-27', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
      { id: '3', materialId: 'cable', district: 'Nagpur', date: '2026-09-26', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
      { id: '4', materialId: 'cable', district: 'Nagpur', date: '2026-09-25', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
      { id: '5', materialId: 'cable', district: 'Nagpur', date: '2026-09-24', buyLow: 200, buyHigh: 200, unit: 'kg', source: 'SYNTHETIC' },
    ];

    const items: LotItem[] = [
      {
        id: 'item-1',
        materialId: 'cable',
        qty: 10,
        unit: 'kg',
        condition: 'damaged', // factor = 0.6
      },
    ];

    // 200 * 10 * 0.6 = 1200
    const valuation = calculateFairValue(items, mockPrices, 'Nagpur', new Date('2026-09-29T12:00:00Z'));
    expect(valuation.low).toBe(1200);
  });

  it('handles preset weight ranges (e.g., small bag, sack)', () => {
    const mockPrices: PriceRecord[] = [
      { id: '1', materialId: 'pcb', district: 'Nagpur', date: '2026-09-28', buyLow: 100, buyHigh: 150, unit: 'kg', source: 'SYNTHETIC' },
      { id: '2', materialId: 'pcb', district: 'Nagpur', date: '2026-09-27', buyLow: 100, buyHigh: 150, unit: 'kg', source: 'SYNTHETIC' },
      { id: '3', materialId: 'pcb', district: 'Nagpur', date: '2026-09-26', buyLow: 100, buyHigh: 150, unit: 'kg', source: 'SYNTHETIC' },
      { id: '4', materialId: 'pcb', district: 'Nagpur', date: '2026-09-25', buyLow: 100, buyHigh: 150, unit: 'kg', source: 'SYNTHETIC' },
      { id: '5', materialId: 'pcb', district: 'Nagpur', date: '2026-09-24', buyLow: 100, buyHigh: 150, unit: 'kg', source: 'SYNTHETIC' },
    ];

    const items: LotItem[] = [
      {
        id: 'item-1',
        materialId: 'pcb',
        qty: 2,
        qtyRange: WEIGHT_PRESETS.smallBag, // [1, 3] kg
        unit: 'kg',
        condition: 'whole',
      },
    ];

    // Low: 100 * 1 = 100. High: 150 * 3 = 450.
    const valuation = calculateFairValue(items, mockPrices, 'Nagpur', new Date('2026-09-29T12:00:00Z'));
    expect(valuation.low).toBe(100);
    expect(valuation.high).toBe(450);
  });

  it('widens to 28 days and wider area when district records are scarce', () => {
    const mockPrices: PriceRecord[] = [
      // Only 2 records in Nagpur in last 14 days
      { id: '1', materialId: 'battery', district: 'Nagpur', date: '2026-09-28', buyLow: 50, buyHigh: 80, unit: 'kg', source: 'SYNTHETIC' },
      { id: '2', materialId: 'battery', district: 'Nagpur', date: '2026-09-27', buyLow: 50, buyHigh: 80, unit: 'kg', source: 'SYNTHETIC' },
      // Records in other districts (Pune/Mumbai)
      { id: '3', materialId: 'battery', district: 'Pune', date: '2026-09-20', buyLow: 50, buyHigh: 80, unit: 'kg', source: 'SYNTHETIC' },
      { id: '4', materialId: 'battery', district: 'Pune', date: '2026-09-18', buyLow: 50, buyHigh: 80, unit: 'kg', source: 'SYNTHETIC' },
      { id: '5', materialId: 'battery', district: 'Mumbai', date: '2026-09-15', buyLow: 50, buyHigh: 80, unit: 'kg', source: 'SYNTHETIC' },
    ];

    const items: LotItem[] = [
      {
        id: 'item-1',
        materialId: 'battery',
        qty: 10,
        unit: 'kg',
        condition: 'whole',
      },
    ];

    const valuation = calculateFairValue(items, mockPrices, 'Nagpur', new Date('2026-09-29T12:00:00Z'));
    expect(valuation.isWiderArea).toBe(true);
    expect(valuation.low).toBe(500);
    expect(valuation.high).toBe(800);
  });
});
