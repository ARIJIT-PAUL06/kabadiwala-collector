# Datasets Documentation — Kabadiwala Connect
**Requirement:** §8, R16 — All synthetic demo data is explicitly flagged and documented.

> **DEMO DATA NOTICE:** All initial datasets in this application are synthetic and for demonstration purposes. They reflect simulated market ranges in Nagpur, Maharashtra. Replace with empirical field survey data prior to production deployment.
> `// TODO(field-data)` tags are maintained on all synthetic constants.

## 1. Material Catalog (`src/data/seed/materials.ts`)
- 9 distinct scrap fractions: `crt`, `lcd`, `pcb`, `cable`, `battery`, `motor`, `magnet`, `plastic`, `other`.
- Units: `piece` for CRTs and LCDs; `kg` for all remaining fractions.
- Hazardous flags: `battery` and `crt` are marked hazardous, triggering contextual safety warning S20.

## 2. Daily Price Benchmark Records (`src/data/seed/prices.ts`)
- Generated across 8 weeks (56 days) for all 9 materials in 3 Nagpur localities using seeded PRNG (`mulberry32`, seed 26229) for deterministic testing.
- Includes local informal buying ranges (`buyLow` to `buyHigh`) and authorised recycler benchmark offers (5–15% above informal buying prices to demonstrate formalization value).

## 3. Authorised Recyclers Directory (`src/data/seed/recyclers.ts`)
- 6 fictional recyclers in Vidarbha (e.g. GreenCycle Recyclers, Vidarbha E-Waste Works, Itwari Aggregator Hub).
- Includes MPCB demo authorization numbers, accepted material lists, pickup schedules, service radii (8–25 km), and cryptographic Ed25519 public keys.
- Deliberately includes 1 expired and 1 unverified entity to test and demonstrate hard-filter compliance.

## 4. Work Areas & Geographies (`src/data/seed/areas.ts`)
- Primary district: Nagpur, with key scrap trading localities (Itwari, Gandhibagh, Mahal, Sadar, Mominpura, Kamptee Road, Hingna, Wadi).
- Regional districts: Wardha, Amravati, Chandrapur, Bhandara.
