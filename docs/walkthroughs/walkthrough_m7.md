# Milestone 7 Walkthrough: Handover (S12–S15), QR & Cryptographic Audit

Milestone 7 introduces the tamper-evident cryptographic audit trail, pure canonical JSON stringifier, deterministic short codes, QR codes, Ed25519 signing simulator, pre-handover checklist (S12), QR code screen (S13), verified receipt (S14), and payment recording (S15).

---

## 1. Cryptographic Domain Architecture

### 1.1 Deterministic Canonical JSON (`src/domain/canonicalJson.ts`)
- Implements RFC-8785 style canonical JSON formatting:
  - Recursively sorts dictionary keys in strict lexicographical order.
  - Omit properties with `undefined` values.
  - Zero whitespace around colons and commas.
  - Preserves array ordering while canonicalizing nested structures.

### 1.2 Hash Chain & Short Code Derivation (`src/domain/handover.ts`)
- **Record Hash**: `SHA256(canonicalPayload + prevHash)`.
  - Genesis lot starts with `prevHash = '0'.repeat(64)`.
  - Every subsequent lot chains to the previous lot's `recordHash`.
- **6-Digit Short Code**: `(parseInt(recordHash.slice(0, 8), 16) % 1_000_000)` formatted as a 6-digit zero-padded string (`code6`).
- **QR Payload**: Formatted as `KC1|{ref}|{recordHash}|{code6}`.
- **Chain Verification (`verifyChain`)**: Validates entire multi-lot chain:
  - Checks `prevHash` link integrity.
  - Recomputes canonical payload and SHA-256 hash.
  - Recomputes `code6`.
  - Verifies Ed25519 signature of confirmed transactions.
  - Identifies the exact reference if tampering occurs.

### 1.3 Strict Lot State Machine (`src/domain/lotMachine.ts`)
- Allowed transitions:
  - `DRAFT → VALUED → OFFERED → ACCEPTED → HANDED_OVER → CONFIRMED → (PAID | PAYMENT_PENDING)`
  - `PAYMENT_PENDING → PAID`
  - `CANCELLED` (permitted before `HANDED_OVER`, strictly forbidden after)
- **Immutability Guarantee**: Once a lot enters `HANDED_OVER`, all item quantities, materials, and photos are strictly locked. Any attempt to modify them throws `LotStateError`.

### 1.4 Demo Recycler Simulator (`src/services/demoRecycler.ts`)
- Stable Ed25519 keypair derived from demo seed (`demo-recycler-{id}`) using `tweetnacl`.
- Simulates certified scale reading (declared ± up to 3%) and final payout.
- Signs `${recordHash}|${measuredQty}|${finalPrice}|${confirmedAt}` with Ed25519 secret key.
- Validates the 6-digit code before signing and transitions the lot to `CONFIRMED`.

---

## 2. Screens Built

### 2.1 S12: Handover Checklist (`app/lot/[id]/handover.tsx`)
- Summary card displaying lot reference, agreed payout, and authorized buyer details.
- 4-point verification checklist:
  1. Weighed together with the buyer (interactive toggle).
  2. Buyer is authorised (auto-verified if status is `VALID`).
  3. Price agreed (interactive toggle).
  4. Photo captured at handover (inline image picker with EXIF-stripped SHA-256 computation).
- GPS capture status (coordinates rounded to 4 decimals, ~11m precision).
- Confirmation modal with cryptographic sealing warning.

### 2.2 S13: QR Code & Verification (`app/lot/[id]/code.tsx`)
- High-contrast 220px QR code (`react-native-qrcode-svg`) with 16px quiet zone.
- Split 6-digit verification code (`482 913`) rendered in high-visibility typography.
- Spoken digit readout via `ListenButton` for low-literacy users.
- `[DEMO: act as buyer]` modal allowing instant testing of the buyer handover scan, code verification, and Ed25519 signature.
- Auto-navigates to Receipt (S14) upon confirmation.

### 2.3 S14: Verified Receipt (`app/lot/[id]/receipt.tsx`)
- Official "Verified" status with `SealCheck` in theme success color.
- Complete breakdown: materials, declared weight vs measured weight, final price.
- Cryptographic proof box showing truncated record hash and Ed25519 signature snippet.
- Action buttons: "Record payment" (routes to S15) and "Share receipt" (Web Share / clipboard fallback).

### 2.4 S15: Payment Recording (`app/lot/[id]/payment.tsx`)
- Payout amount display with ±10 and ±50 stepper adjustments.
- Three payment options:
  - **Cash Received (रोख)**: Immediate settlement, transitions lot to `PAID`.
  - **Not Paid Yet (बाकी)**: Transitions lot to `PAYMENT_PENDING` (appears on Home pending dues strip).
  - **Paid by UPI**: Input for optional last 4 digits of UPI transaction reference.
- Queues outbox synchronization and routes back to `/home`.

---

## 3. Quality Gate Verification

| Check | Target | Result | Status |
|---|---|---|---|
| TypeScript (`npx tsc --noEmit`) | 0 errors | 0 errors | ✅ PASS |
| ESLint (`npx eslint .`) | 0 errors, 0 warnings | 0 errors, 0 warnings | ✅ PASS |
| Jest Test Suites (`npm test`) | 10 suites, 41 tests | 10 passed, 41 passed | ✅ PASS |
| Web Production Export (`npx expo export -p web`) | Clean build | Bundled in 4.4s to `dist` | ✅ PASS |
