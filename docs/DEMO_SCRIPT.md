# 4-Minute Jury Demo Script — Kabadiwala Connect
**SIH 2026 · Problem Statement SIH26229 · Team human.exe**

### 00:00 – 00:30 · Introduction & Low-Literacy Onboarding
1. **Launch Screen (S1):** Open the app. Point out the zero-lag launch, warm paper background, and three prominent language cards: **मराठी**, **हिंदी**, **English**.
2. **Audio Demonstration:** Tap the speaker icon on Marathi. The app speaks "तुमची भाषा निवडा". Select Marathi or Hindi.
3. **Privacy Promise (S2–S3):** Highlight the privacy notice ("No name. No Aadhaar. Photos of scrap only"). Choose "Nagpur / Itwari" with one tap.

### 00:30 – 01:30 · Lot Creation & Instant Fair Valuation
1. **Home Screen (S4):** Show the 4 large tiles: Sell (vibrant green), Today's Rates, My Money, Safety.
2. **Photograph (S5):** Tap **Sell**. Take a photo of mixed electronic scrap. Show the dashed guidance frame.
3. **Visual Selection (S6):** Select **PCB** and **Battery**. Note the immediate audio safety pop-up (S20) warning not to puncture or burn batteries!
4. **Weight & Condition (S7–S8):** Enter 8 kg for PCB using the stepper, and tap "Small bag" for batteries. Mark condition as "Whole".
5. **Instant Valuation (S9):** The app calculates the fair market range (`₹1,450 – ₹1,820`) based on 14-day median prices in Itwari, Nagpur. Tap the speaker to hear the valuation read aloud.

### 01:30 – 02:45 · Recycler Matching & Tamper-Proof Handover
1. **Authorized Buyers (S10):** Tap "Find buyers". Show the top 3 ranked recyclers with green `Authorised` badges and reason codes ("Best Rate", "Pickup Today"). Point out that expired or unverified buyers are strictly filtered out.
2. **Accept Offer (S11):** Send offer to "GreenCycle Recyclers". Receive their quote, tap "Ask for more" (+5%), and accept the adjusted offer.
3. **Handover Checklist (S12):** Tap "Hand over". Complete the 4 checklist points (weighed together, authorised buyer checked, price agreed, handover photo).
4. **QR & 6-Digit Code (S13):** Generate the handover QR containing the cryptographic SHA-256 hash chain and code `482 913`.
5. **Simulated Recycler Confirmation:** Tap "[DEMO: act as buyer]". Enter the 6-digit code. The simulator signs the transaction with the recycler's Ed25519 private key.

### 02:45 – 03:30 · Verified Receipt & Cash Ledger
1. **Digital Receipt (S14):** Instantly displays the verified receipt with a green `SealCheck` badge, confirmed weight, and final price. Tap "Share receipt" to show image/text export.
2. **Payment Record (S15):** Choose "Cash received" (cash-first model) and save.
3. **Ledger (S18):** Open "My Money" to view the earnings ledger with total weekly earnings updated in real-time.

### 03:30 – 04:00 · Offline Resiliency & Chain Verification
1. **Simulate Offline:** Go to Settings (S21). Toggle "Simulate offline". Note the `SyncDot` turns grey with a slash.
2. **Offline Transaction:** Create a new draft lot while offline. Show it is safely saved locally with an amber pending indicator.
3. **Restore Sync:** Toggle offline back to online. The sync engine automatically pushes the queue and the `SyncDot` returns to solid green.
4. **Tamper Proof:** Show the in-app "Records intact ✓" confirmation verifying that the cryptographic hash chain has not been altered.
