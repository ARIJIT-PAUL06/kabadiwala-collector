# Milestone 8 Walkthrough: Rates, Money Ledger & Safety Guides

## 1. Overview
In Milestone 8, we completed:
- **Price Trend Engine (`src/domain/trend.ts`)**: 4-week weekly median calculations, SVG sparkline point generation, trend direction (`up` / `down` / `flat`), percentage change, and 24-hour freshness / stale detection.
- **S16: Today's Rates Board (`app/rates/index.tsx`)**:
  - Live rates for all 9 scrap materials with daily median and range (₹/kg).
  - Trend direction indicators (↑ green, ↓ red, → neutral).
  - Individual speech button for each material + "Listen to all" sequential speech reader.
  - Stale data warning banner (>24h since last sync).
  - Source attribution badge: *Bandhwala Market Association (Survey: Mon 08:30)*.
- **S17: Material Price Detail (`app/rates/[material].tsx`)**:
  - Material pictogram, title, and localized description.
  - Today's verified price range.
  - 4-week historical trend sparkline built with `react-native-svg`.
  - Plain-spoken trend sentence in active language.
  - Top 3 verified buyers purchasing this specific material with distance, trust score, and base quote.
  - Direct "Sell this" CTA that initiates lot creation with the material pre-selected.
- **S18: Money Ledger (`app/money.tsx`)**:
  - Financial overview cards: Total Received, This Month's Earnings, and Pending Dues.
  - Filter tabs: *All*, *Paid*, *Pending*.
  - Transaction history cards displaying lot reference, buyer name, completion timestamp, payment method badge (`CASH` or `UPI`), and settlement status.
  - Quick inline action: "Mark as paid" for overdue receipts.
  - "Share Summary" action generating an audit summary for records/sharing.
- **S19: Safety Guidance Cards (`app/safety/index.tsx`)**:
  - 6 interactive hazard cards featuring bespoke hand-drawn vector SVGs.
  - Hazard severity badges (e.g., CRT Implosion risk, PCB Lead/Bromine fumes, Battery Acid/Fire).
  - Voice instructions with speech playback in English, Hindi, and Marathi.
- **Unit Tests (`__tests__/trend.test.ts`)**:
  - Verified 4-week trend calculation, sparkline normalization, trend arrow thresholds, and stale data flag logic.

---

## 2. Test & Quality Gate Results
- **TypeScript Strict**: `npx tsc --noEmit` passed with 0 errors.
- **ESLint**: `npx eslint .` passed with 0 errors and 0 warnings.
- **Jest**: 11 test suites passed, 45 tests passed.
  - `__tests__/trend.test.ts` (4 tests)
  - `__tests__/handover.test.ts` (3 tests)
  - `__tests__/lotMachine.test.ts` (6 tests)
  - `__tests__/mockApi.test.ts` (4 tests)
  - `__tests__/buyerSelection.test.ts` (4 tests)
  - `__tests__/exifStripper.test.ts` (2 tests)
  - `__tests__/valuation.test.ts` (5 tests)
  - `__tests__/locationService.test.ts` (4 tests)
  - `__tests__/domain.test.ts` (5 tests)
  - `__tests__/speech.test.ts` (4 tests)
  - `__tests__/i18n.test.ts` (4 tests)
