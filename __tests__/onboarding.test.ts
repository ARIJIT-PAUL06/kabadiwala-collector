// Serves: R11, R15
import { useAppStore } from '../src/store/useAppStore';
import { hashPhoneNumber } from '../src/utils/hex';
import { repo } from '../src/data/repo';

describe('M4 Onboarding & Home Navigation Logic Test', () => {
  it('initializes with onboarding incomplete and allows completing via profile', () => {
    useAppStore.getState().resetAllData();
    expect(useAppStore.getState().onboardingComplete).toBe(false);

    useAppStore.getState().setProfile({
      id: 'col-test',
      lang: 'mr',
      district: 'Nagpur',
      locality: 'itwari',
      role: 'collector',
      createdAt: '2026-09-29T12:00:00Z',
    });

    expect(useAppStore.getState().onboardingComplete).toBe(true);
    expect(useAppStore.getState().profile?.locality).toBe('itwari');
  });

  it('hashes phone number with salt and never produces raw phone', async () => {
    const raw = '9876543210';
    const hashed = await hashPhoneNumber(raw);

    expect(hashed).toBeDefined();
    expect(hashed.length).toBe(64); // SHA-256 hex string
    expect(hashed).not.toContain(raw);
  });

  it('validates Nagpur localities in repository', () => {
    const nagpur = repo.getDistrict('nagpur');
    expect(nagpur).toBeDefined();
    expect(nagpur?.localities.length).toBeGreaterThanOrEqual(8);

    const itwari = nagpur?.localities.find((l) => l.id === 'itwari');
    expect(itwari?.nameMr).toBe('इतवारी');
  });
});
