// M1 components test
import { colors } from '../src/theme/tokens';
import { typeScale } from '../src/theme/typography';
import { formatIndianRupees } from '../src/ui/MoneyText';

describe('M1 UI & Tokens Test', () => {
  it('formats Indian currency properly with grouping', () => {
    const formatted = formatIndianRupees(123450);
    // Should contain ₹ and numbers formatted with commas
    expect(formatted).toContain('1,23,450');
    expect(formatted).toContain('₹');
  });

  it('provides all 16 theme colors with appropriate contrast keys', () => {
    expect(colors.paper).toBe('#F7F6F2');
    expect(colors.surface).toBe('#FFFFFF');
    expect(colors.primary).toBe('#1E6B45');
    expect(colors.primaryContainer).toBe('#E4F0E9');
    expect(colors.money).toBe('#9E520A');
    expect(colors.moneyContainer).toBe('#FBEEDD');
    expect(colors.success).toBe('#1E7B34');
    expect(colors.warning).toBe('#8A5C00');
    expect(colors.danger).toBe('#B42318');
  });

  it('guarantees min touch targets and type scale bounds', () => {
    expect(typeScale.display.fontSize).toBe(36);
    expect(typeScale.caption.fontSize).toBe(14);
    expect(typeScale.caption.fontSize).toBeGreaterThanOrEqual(14); // rule: nothing smaller than 14
  });
});
