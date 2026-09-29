// Serves: R01, R02, R04, R16
import { Material, MaterialId, PriceRecord, Recycler } from '../domain/types';
import { SEED_MATERIALS } from './seed/materials';
import { SEED_PRICES } from './seed/prices';
import { SEED_RECYCLERS } from './seed/recyclers';
import { SEED_DISTRICTS, District } from './seed/areas';

export class AppRepository {
  private materials: Material[] = [...SEED_MATERIALS];
  private prices: PriceRecord[] = [...SEED_PRICES];
  private recyclers: Recycler[] = [...SEED_RECYCLERS];
  private districts: District[] = [...SEED_DISTRICTS];

  getMaterials(): Material[] {
    return this.materials;
  }

  getMaterial(id: MaterialId): Material | undefined {
    return this.materials.find((m) => m.id === id);
  }

  getDistricts(): District[] {
    return this.districts;
  }

  getDistrict(id: string): District | undefined {
    return this.districts.find((d) => d.id === id);
  }

  getPrices(materialId?: MaterialId, locality?: string, daysLimit = 14): PriceRecord[] {
    let filtered = this.prices;
    if (materialId) {
      filtered = filtered.filter((p) => p.materialId === materialId);
    }
    if (locality) {
      const match = filtered.filter((p) => p.locality === locality);
      if (match.length >= 5) {
        filtered = match;
      }
    }

    if (daysLimit) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysLimit);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      filtered = filtered.filter((p) => p.date >= cutoffStr);
    }

    return filtered;
  }

  getRecyclers(): Recycler[] {
    return this.recyclers;
  }

  getRecycler(id: string): Recycler | undefined {
    return this.recyclers.find((r) => r.id === id);
  }

  resetToSeed(): void {
    this.materials = [...SEED_MATERIALS];
    this.prices = [...SEED_PRICES];
    this.recyclers = [...SEED_RECYCLERS];
  }
}

export const repo = new AppRepository();
