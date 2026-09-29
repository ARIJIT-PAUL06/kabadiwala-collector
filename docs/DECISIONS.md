# Architecture Decision Records (ADRs) — Kabadiwala Connect

## ADR 01: Why No Custom Native Modules / Bare Workflow
- **Decision:** Build exclusively on Expo managed workflow running in standard Expo Go and web.
- **Rationale:** The application targets field workers in India with low-end Android devices and needs instant zero-friction distribution and testing for evaluators/jury. Standard Expo Go modules (`expo-camera`, `expo-location`, `expo-speech`, `expo-crypto`, etc.) fully satisfy all functional needs without custom native compilation.

## ADR 02: Why No Dark Mode in v1
- **Decision:** Fixed warm paper palette (`#F7F6F2`) with dark ink (`#1A2330`) and high contrast.
- **Rationale:** Kabadiwalas and informal collectors operate outdoors in bright sunlight. A single well-tested high-contrast light palette provides consistent outdoor readability and prevents low-contrast readability failures.

## ADR 03: Why Pure JS Ed25519 & Local Hash Chains Over Blockchain
- **Decision:** Use local SHA-256 canonical hash chaining per collector and Ed25519 signatures (`tweetnacl`) rather than a distributed ledger or blockchain.
- **Rationale:** Blockchains incur high operational overhead, gas costs, network latency, and require online connectivity. A per-collector hash chain validated via Ed25519 cryptographic signatures provides complete offline tamper-evidence at zero financial and network cost.

## ADR 04: Noto Sans Bundled Offline Font
- **Decision:** Enforce Noto Sans for Latin and Noto Sans Devanagari for Marathi/Hindi, loaded on launch and bundled.
- **Rationale:** System fonts on entry-level Android devices frequently corrupt Devanagari conjuncts or lack proper weights. Bundling Noto Sans ensures predictable rendering in offline conditions.

## ADR 05: Server-side AI Classifier Hook with Noop Fallback
- **Decision:** The on-device classifier interface defaults to `NoopClassifier`.
- **Rationale:** Running heavy TensorFlow/TFLite models inside Expo Go is unsupported and would overwhelm 2GB RAM budget phones. The architecture exposes a clean `Classifier` contract allowing a future server endpoint to provide suggestions when network allows, while preserving human-in-the-loop confirmation.
