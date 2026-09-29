# Milestone 9 Walkthrough: Settings (S21) & Offline Sync Engine

## 1. Overview
In Milestone 9, we completed the offline-first sync engine and the complete plain-spoken Settings & Sync screen (S21):
- **Network Status (`src/sync/useOnline.ts`)**:
  - Subscribes to network connectivity using NetInfo on native and browser event listeners on web.
  - Respects the "Simulate offline" demo toggle (`settings.simulateOffline`), immediately reporting offline status when active.
- **Offline-First Sync Engine (`src/sync/syncEngine.ts`)**:
  - Automatically enqueues lot creation, updates, and status transitions into the persistent outbox (`useOutboxStore`).
  - Processes outbox operations in strict sequential order.
  - Implements exponential backoff on network failures (5s base up to a 300s / 5min cap).
  - Pulls updates and executes merge logic: server wins on recycler-confirmed fields (`confirmation`, `finalPrice`, `measuredQty`), local copy wins on draft/unconfirmed items, and handed-over lots transition to `CONFIRMED` upon recycler signature verification.
  - Background foreground interval running every 60 seconds, with immediate manual "Send now" trigger.
  - Reactive sync status reporting: `allSent` (green), `waitingToSend` (amber with count), `offlineSaved` (grey slash).
- **Data Export (`src/utils/exportData.ts`)**:
  - Generates RFC-compliant CSV and formatted JSON statements for lots and payment ledger entries.
  - Web: direct blob download via synthetic anchor click.
  - Native: file write to cache directory and sharing via `expo-sharing`.
- **S21: Settings & Sync Screen (`app/settings.tsx`)**:
  - **Language Selector**: 3 cards for Marathi, Hindi, and English with active checkmarks and audio sample readout.
  - **Voice Controls**: Auto-play voice instructions switch, and Speech speed selector (Normal `0.9` / Slow `0.75`).
  - **My Area**: Current district and locality with quick selection chips for Nagpur trading zones.
  - **UPI Payments**: Toggle (off by default) to enable UPI payment logging.
  - **Sync & Cryptography**: Live sync status, last sync timestamp, "Send now" button, and on-device hash chain validation displaying **Records intact ✓** or reporting the specific broken ref.
  - **My Data**: Plain summary of stored items, JSON/CSV data export buttons, and red "Delete all local data" action.
  - **Demo Tools**: Visible `DEMO DATA` banner, Demo mode toggle, Simulate offline toggle, and Reset demo data action.
  - **About**: Version 1.0.0, SIH 2026 PS SIH26229, Team human.exe attribution, and dataset transparency note.
- **Unit Tests (`__tests__/sync.test.ts`)**:
  - Scenario 1: create offline → go online → sent.
  - Scenario 2: two edits offline → sequential in-order push.
  - Scenario 3: push fails mid-way → retry without duplicate pushes.
  - Scenario 4: app killed with pending outbox → resumes and completes queue.
  - Scenario 5: server confirmation arrives → local lot transitions to `CONFIRMED`.
  - Scenario 6: corrupt stored record is dropped safely by Zod without crashing.

---

## 2. Quality Gate & Test Results
- **TypeScript Strict**: `npx tsc --noEmit` exited with **0 errors**.
- **ESLint**: `npx eslint .` exited with **0 errors and 0 warnings**.
- **Jest Test Suite**: All **12 test suites, 51 tests** passed.
  - `__tests__/sync.test.ts` (6 tests)
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
  - `__tests__/i18n.test.ts` (5 tests)
- **Web Bundling**: `npx expo export --platform web` succeeded with 0 errors (4,216 modules bundled).
