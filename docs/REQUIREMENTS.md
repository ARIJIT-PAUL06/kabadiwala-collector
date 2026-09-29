# Requirements Traceability Matrix — Kabadiwala Connect
**Problem Statement:** SIH26229 · **Team:** human.exe

Every screen and module in this project cites the requirements it serves via header comments (e.g. `// Serves: R01, R11`).

| ID | Requirement Description | Where it Lives |
|---|---|---|
| **R01** | Photograph, categorise, create digital lots (CRT, LCD, PCB, cables, batteries, motors, magnet assemblies, mixed plastic), enter approx. weight, instant value estimate | `app/sell/*`, `src/domain/valuation.ts` |
| **R02** | Price dataset: category, sub-category, location, date, buying price, unit, market range, recycler offered price; show current prices and basic trends | `src/data/seed/prices.ts`, `app/rates/index.tsx`, `app/rates/[material].tsx`, `src/domain/trend.ts` |
| **R03** | Material/transaction dataset: lot ID, category, description, photo ref, weight, estimate, quoted, final, date-time, location, recycler, status | `src/domain/types.ts`, `src/store/useLotStore.ts`, `app/lot/[id]/index.tsx` |
| **R04** | Authorised recycler dataset: name, location, materials, authorisation details + status, contact, rates, pickup availability, service area; rank suitable recyclers | `src/data/seed/recyclers.ts`, `src/domain/ranking.ts`, `app/sell/buyers.tsx` |
| **R05** | AI/ML hooks: classification, valuation, matching, anomaly detection | `src/services/classifier.ts`, `src/domain/valuation.ts`, `src/domain/anomaly.ts`, `src/domain/ranking.ts` |
| **R06** | Simple price board with spoken prices and trends | `app/rates/index.tsx`, `src/services/speech.ts` |
| **R07** | Match lots to nearby authorised recyclers (location, material, rate, pickup, authorisation) | `src/domain/ranking.ts`, `app/sell/buyers.tsx` |
| **R08** | Digital, verifiable handover record: photos, weight, timestamp, GPS, unique reference, recycler confirmation | `src/domain/handover.ts`, `src/domain/canonicalJson.ts`, `app/lot/[id]/handover.tsx`, `app/lot/[id]/code.tsx`, `app/lot/[id]/receipt.tsx` |
| **R09** | Earnings ledger: transactions, payments, pending dues, financial history | `src/store/useLedgerStore.ts`, `app/money.tsx`, `app/lot/[id]/payment.tsx` |
| **R10** | Pictorial/audio safety guidance: burning, opening, batteries, CRTs | `src/pictograms/safety/*`, `app/safety/index.tsx`, `app/safety/alert.tsx` |
| **R11** | Marathi and Hindi at minimum; usable with limited literacy | `src/i18n/*`, `src/ui/Text.tsx`, `src/ui/ListenButton.tsx`, S1-S21 low-literacy affordances |
| **R12** | Offline-first; sync when connected | `src/sync/syncEngine.ts`, `src/store/useOutboxStore.ts`, `src/ui/SyncDot.tsx` |
| **R13** | Entry-level Android, small size, low memory (≤ 3s cold start, memoised lists, photos ≤ 200 KB) | Architecture constraints, `src/services/photos.ts` |
| **R14** | Cash allowed; digital payment optional, never required | `app/lot/[id]/payment.tsx`, `src/domain/types.ts` |
| **R15** | Minimal personal data (no name, no Aadhaar, optional salted phone hash, stripped EXIF) | `app/onboarding/*`, `src/domain/types.ts`, `src/services/photos.ts` |
| **R16** | Datasets are generated, validated, stored, updated and exportable (not static) | `src/domain/schemas.ts`, `src/data/export.ts`, `app/settings.tsx` |
