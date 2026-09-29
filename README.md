# Kabadiwala Connect · Collector App
### Smart India Hackathon (SIH 2026) · PS **SIH26229** · Team **human.exe**
> Offline-first, multilingual, low-literacy mobile application for India's informal e-waste collectors. Connecting waste-pickers with authorised recyclers through tamper-evident cryptographic handovers, transparent pricing, and visual safety guidance.

---

## 1. What the App Is
**Kabadiwala Connect** empowers informal e-waste collectors (kabadiwalas, waste-pickers, aggregators) to get fair, documented deals from government-authorised recyclers instead of resorting to toxic backyard dismantling.
1. The collector photographs e-waste lots, taps what they see, inputs weights with friendly steppers or preset containers, and views fair market valuation ranges.
2. The app matches them with top nearby authorised recyclers using multi-criteria ranking, weeds out expired permits, flags quote anomalies, and negotiates counter-offers.
3. Handovers are completed via a 220px QR code and 6-digit split code with an Ed25519-signed receipt and SHA-256 hash chaining, guaranteeing cryptographic audit trails even completely offline.

---

## 2. How to Run

### 2.1 Expo Go (Android Phone — Primary Demo)
```bash
npm install
npx expo start              # scan the QR code with Expo Go on the same Wi-Fi
npx expo start --tunnel     # use if phone is on cellular or separate network
```

### 2.2 Web Browser (Local)
```bash
npx expo export --platform web
npx serve dist -s -l 8081   # open http://localhost:8081 in browser
```

### 2.3 Web on Vercel
- Deploy configuration is pre-configured in `vercel.json`:
  ```json
  {
    "buildCommand": "npx expo export --platform web",
    "outputDirectory": "dist",
    "rewrites": [{ "source": "/(.*)", "destination": "/" }]
  }
  ```
- Deploy to Vercel: Connect GitHub repository to Vercel (Framework preset: **Other**), or run `npx vercel --prod`.

---

## 3. Folder Map

```text
├── app/                        # Expo Router file-based screens (S1–S21)
│   ├── _layout.tsx             # Root layout with Noto Sans loader & ErrorBoundary
│   ├── index.tsx               # Entry router / splash redirector
│   ├── home.tsx                # S4: Dashboard with 2x2 action grid & pending dues
│   ├── onboarding/
│   │   ├── language.tsx        # S1: Marathi, Hindi, English selector with voice
│   │   ├── permissions.tsx     # S2: Camera & Location privacy pledge
│   │   └── area.tsx            # S3: Nagpur localities & collector role setup
│   ├── sell/
│   │   ├── photo.tsx           # S5: Lot camera capture with guidance frame
│   │   ├── category.tsx        # S6: 3x3 material grid & PCB grade sub-chips
│   │   ├── weight.tsx          # S7: Steppers & preset containers (bag/sack/cart)
│   │   ├── condition.tsx       # S8: Whole / partly opened / damaged choices
│   │   ├── value.tsx           # S9: Fair price range estimation & source note
│   │   └── buyers.tsx          # S10: Authorised buyer ranking & matches
│   ├── lot/
│   │   └── [id]/
│   │       ├── index.tsx       # S11: Lot progression timeline & counter-offer
│   │       ├── handover.tsx    # S12: 4-step checklist & GPS capture
│   │       ├── code.tsx        # S13: 240px QR, 6-digit code, demo recycler sim
│   │       ├── receipt.tsx     # S14: Verified digital certificate with Ed25519
│   │       └── payment.tsx     # S15: Cash first, pending dues, or UPI logging
│   ├── rates/
│   │   ├── index.tsx           # S16: Today's rates board with "Listen to all"
│   │   └── [material].tsx      # S17: 4-week SVG sparkline & top buyer offers
│   ├── money.tsx               # S18: Earnings ledger, dues filter, transactions
│   ├── safety/
│   │   ├── index.tsx           # S19: 6 pictorial hazard cards with voice
│   │   └── alert.tsx           # S20: Contextual hazard modal
│   ├── settings.tsx            # S21: Plain-spoken settings, sync engine, export
│   └── dev/
│       └── gallery.tsx         # Primitive UI & pictogram verification gallery
├── src/
│   ├── theme/tokens.ts         # Calm design tokens (paper #F7F6F2, ink, money)
│   ├── ui/                     # 17 primitive UI components (zero emoji/gradients)
│   ├── pictograms/             # Hand-crafted vector SVGs (9 materials, 6 safety)
│   ├── i18n/                   # Typed i18n engine with mr, hi, en dictionaries
│   ├── domain/                 # Pure domain business logic & state machines
│   │   ├── types.ts            # Domain types
│   │   ├── schemas.ts          # Zod validation schemas
│   │   ├── valuation.ts        # 14-day median, district weight, condition factor
│   │   ├── ranking.ts          # Multi-factor score (0.40 price, 0.25 dist, etc.)
│   │   ├── anomaly.ts          # Price variance detection (<0.6x p20, >1.6x p80)
│   │   ├── trend.ts            # 4-week weekly median & sparkline generator
│   │   ├── canonicalJson.ts    # RFC-8785 deterministic JSON serializer
│   │   ├── handover.ts         # Per-collector SHA-256 hash chain & verifyChain
│   │   └── lotMachine.ts       # Strict lot state machine & immutability
│   ├── data/seed/              # Synthetic seed datasets for Nagpur demo
│   ├── store/                  # Zustand stores with persist & migration
│   ├── services/               # Mock API, speech engine, demo recycler simulator
│   ├── sync/                   # Offline outbox processor & useOnline hook
│   └── utils/                  # Photo downscaling, EXIF strip, GPS, CSV/JSON export
├── docs/                       # Specifications, architecture decisions, demo script
└── __tests__/                  # 12 Jest test suites (51 unit tests)
```

---

## 4. Synthetic Data Honesty Statement
> **DEMO DATA NOTICE:** All prices, price histories, buyer names, contact details, and authorisation numbers in this application are **synthetic demo data** generated for prototyping and evaluation in the Nagpur region.
> They are strictly marked with `// TODO(field-data)` in code and clearly badged as `DEMO DATA` in the user interface.
> No real business names or actual CPCB/MPCB authorisation licenses are used.

---

## 5. TODO Backlog Items
- `TODO(field-data)`: Replace synthetic price medians and recycler lists with real-world weekly surveys from the Bandhwala Market Association and Maharashtra Pollution Control Board (MPCB) registers.
- `TODO(audio)`: Replace algorithmic text-to-speech with studio-recorded native human Marathi and Hindi voice prompts for collectors with zero reading ability.
- `TODO(backend)`: Implement production REST / WebSocket endpoints in `src/services/api.ts` replacing `MockApi`.
- `TODO(classifier)`: Connect server-side computer vision classifier endpoint for automated e-waste classification once network is available.

---

## 6. Requirement Coverage Matrix (R01–R16)

| Req | Description | Implementation File(s) | Screens |
|---|---|---|---|
| **R01** | Digital lot creation & multi-item support | `src/domain/valuation.ts`, `src/store/useLotStore.ts` | S5, S6, S7, S8, S9 |
| **R02** | Fair value estimation & survey citations | `src/domain/valuation.ts`, `src/data/seed/prices.ts` | S9, S16, S17 |
| **R03** | Lot status lifecycle & history | `src/domain/lotMachine.ts`, `src/store/useLotStore.ts` | S4, S11 |
| **R04** | Authorised recycler directory & ranking | `src/domain/ranking.ts`, `src/data/seed/recyclers.ts` | S10, S17 |
| **R05** | Quote anomaly detection & counter-offers | `src/domain/anomaly.ts`, `src/services/mockApi.ts` | S11 |
| **R06** | Spoken rates board & audio playback | `src/domain/trend.ts`, `src/services/speech.ts` | S16, S17 |
| **R07** | Authorisation verification & badges | `src/ui/AuthorisedBadge.tsx`, `src/domain/ranking.ts` | S10, S12, S14 |
| **R08** | Cryptographic handover, QR & hash chain | `src/domain/handover.ts`, `src/domain/canonicalJson.ts` | S12, S13, S14 |
| **R09** | Payment reconciliation & money ledger | `src/store/useLedgerStore.ts`, `src/ui/MoneyText.tsx` | S4, S14, S15, S18 |
| **R10** | Pictorial safety guidance & alerts | `src/pictograms/safety/`, `app/safety/` | S6, S19, S20 |
| **R11** | Multilingual Marathi, Hindi, English i18n | `src/i18n/`, `src/services/speech.ts` | S1–S21 |
| **R12** | Offline-first sync & outbox queue | `src/sync/syncEngine.ts`, `src/store/useOutboxStore.ts` | S4, S21 |
| **R13** | Performance, ergonomics & accessibility | `src/ui/`, `src/ui/ErrorBoundary.tsx` | All screens |
| **R14** | Cash-first payment & optional UPI | `app/lot/[id]/payment.tsx`, `app/settings.tsx` | S15, S21 |
| **R15** | Privacy: no Aadhaar, hashed phone, no EXIF | `src/utils/phoneHash.ts`, `src/utils/photos.ts` | S2, S3, S5 |
| **R16** | Local persistence, migration & export | `src/store/storage.ts`, `src/utils/exportData.ts` | S21 |

---

## 7. Verification & Quality Gates
```bash
# 1. Type check
npx tsc --noEmit        # 0 errors

# 2. Linting
npx eslint .            # 0 errors, 0 warnings

# 3. Unit test suite
npm test                # 12 test suites passed, 51 tests passed
```
