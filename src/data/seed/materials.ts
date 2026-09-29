// SYNTHETIC DEMO DATA — not real prices or real businesses. Replace with field survey data.
// TODO(field-data)
// Serves: R01, R16
import { Material } from '../../domain/types';

export const SEED_MATERIALS: Material[] = [
  {
    id: 'crt',
    unit: 'piece',
    subCategories: ['tv_color', 'tv_black_white', 'computer_monitor'],
    hazardous: true, // Lead glass and phosphor
  },
  {
    id: 'lcd',
    unit: 'piece',
    subCategories: ['laptop_screen', 'tv_display', 'desktop_monitor'],
    hazardous: false,
  },
  {
    id: 'pcb',
    unit: 'kg',
    subCategories: ['low_grade', 'mid_grade', 'high_grade'],
    hazardous: false,
  },
  {
    id: 'cable',
    unit: 'kg',
    subCategories: ['copper_wire', 'aluminum_wire', 'mixed_cords'],
    hazardous: false,
  },
  {
    id: 'battery',
    unit: 'kg',
    subCategories: ['lead_acid', 'lithium_ion', 'nickel_cadmium'],
    hazardous: true, // Acid leakage and fire risk
  },
  {
    id: 'motor',
    unit: 'kg',
    subCategories: ['copper_wound', 'aluminum_wound', 'compressor_motor'],
    hazardous: false,
  },
  {
    id: 'magnet',
    unit: 'kg',
    subCategories: ['ferrite', 'neodymium_speaker', 'hard_disk_assembly'],
    hazardous: false,
  },
  {
    id: 'plastic',
    unit: 'kg',
    subCategories: ['abs_casing', 'mixed_polycarbonate', 'tv_cabinet_shards'],
    hazardous: false,
  },
  {
    id: 'other',
    unit: 'kg',
    subCategories: ['mixed_unsorted_scrap', 'transformer_core', 'chassis_metal'],
    hazardous: false,
  },
];
