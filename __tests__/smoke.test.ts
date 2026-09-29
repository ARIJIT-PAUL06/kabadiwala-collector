// M0 smoke test
import { colors } from '../src/theme/tokens';
import { typeScale } from '../src/theme/typography';

describe('M0 Smoke Test', () => {
  it('loads theme tokens correctly', () => {
    expect(colors.paper).toBe('#F7F6F2');
    expect(colors.primary).toBe('#1E6B45');
    expect(colors.ink).toBe('#1A2330');
    expect(colors.money).toBe('#9E520A');
  });

  it('defines valid typography scales', () => {
    expect(typeScale.display.fontSize).toBe(36);
    expect(typeScale.body.fontSize).toBe(18);
    expect(typeScale.caption.fontSize).toBe(14);
  });
});
