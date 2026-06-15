# ⚡ Amazon Blink

**Theme 2 — Amazon Now: Reimagining Urgent Shopping** · HackOn with Amazon, Season 6.0

> **Urgent shopping that decides for you — and never gets it wrong.**
> Quick commerce solved *speed*. It hasn't solved the two things that actually break
> under pressure: **deciding what to buy**, and **trusting it'll be right**. Blink is a
> working prototype that removes the decision and guarantees the outcome.

---

## The thesis (two axes)

**Axis 1 — Zero-Decision (speed that matters).** Under real urgency — a child's fever, a
burst pipe — the bottleneck isn't tapping *buy*, it's the panicked human figuring out
*what they even need*. Blink's **Zero-Decision Engine** takes a situation in plain words
(or a photo) and assembles the **complete, dependency-checked package** — then one
fingerprint buys it. We measure **TTLA — Time-to-Leave-App** (~3s vs ~180s of flailing)

**Axis 2 — Trust (the moat).** Being first is table stakes. Being *provably right* is the
differentiator. Blink protects health-critical items with **NEVER_SWAP** locks, fixes
commodity stock-outs mid-order with the **Cancellation Shield** instead of cancelling,
apologises with credit **before you complain**, and narrates every decision in a live
**System Brain** you can audit.

---

## What it looks like — a Digital Twin

The screen is split three ways and the layout *is* the argument:

| Pane | What it is |
|------|------------|
| **Left** | The customer's phone — a real, tappable urgent-commerce app. |
| **Top-right** | A live **city map** of dark stores, couriers, and crisis events. |
| **Bottom-right** | The **System Brain** — a plain-English log of *every* decision. |

There is no black box: when the phone auto-adds a battery, locks a medicine, or batches a
neighbour's order, the Brain says exactly why.

---

## The headline feature: the Zero-Decision Engine ("Blink it")

Tap **Blink it**, then either **describe** the situation or point the **camera** at it.
Amazon Bedrock (Claude) returns a structured package, and Blink does three things a normal
search or recommender cannot:

1. **Dependency Guardrail.** It adds the things you'd forget. Ask for help with a fever and
   it adds a thermometer — *and the AAA batteries the thermometer needs to work*. Catalog
   items carry `needs:` edges, and the server **enforces** the guardrail even if the model
   forgets one.
2. **NEVER_SWAP safety locks.** Medicine and infant formula are marked health-critical and
   are *never* auto-substituted — shown with a **NO-SWAP** badge.
3. **Decision Replay.** A one-tap toggle that shows *what a normal search would have
   returned* (the one obvious item) versus *what Blink assembled* (the complete set) — the
   whole thesis, dramatised.

Then **one fingerprint** commits it. The **TTLA** clock in the control-room header tracks
the whole decide→buy journey and freezes green on purchase.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Runs **fully in DEMO mode with no API key** — every feature works, the AI responses are
scripted, and nothing depends on Wi-Fi.

### Make the AI live (optional)
```bash
cp .env.example .env.local
# PROVIDER=anthropic
# ANTHROPIC_API_KEY=sk-ant-...
```
With a key, the Engine, Disaster, Freshness, and Severity calls hit **Claude live** and the
header badge flips **DEMO → LIVE**.

### Submit on Amazon Bedrock (for the hackathon)
```bash
npm i @aws-sdk/client-bedrock-runtime
# .env.local:
# PROVIDER=bedrock
# AWS_REGION=us-east-1
# BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```
Then have AWS credentials in the environment and enable model access for that model/region
in the Bedrock console. **No code change** — the provider switches on `PROVIDER`. The AWS
SDK is an optional dependency, so the app builds and runs without it until you opt in.

### Production build
```bash
npm run build && npm run start
```

---

## How to demo it
See **[`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)**. The two strongest moments:
- **Blink it → "my kid has a fever"** → watch it auto-add the thermometer's batteries and
  lock the medicine NO-SWAP. (The Zero-Decision thesis in 20 seconds.)
- **Cart → toggle "Stock drop"** → the order fixes itself with a credit and an apology
  *before any complaint*, while the medicine stays protected. (The trust moat.)

---

## All features + their System Brain tags

**The Zero-Decision spine**
- Zero-Decision Engine — describe/camera → complete package — `ENGINE`
- Dependency Guardrail — adds the consumable an item needs — `GUARD`
- NEVER_SWAP safety locks — medicine/formula never substituted — `SHIELD`
- TTLA — Time-to-Leave-App clock — *(header metric)*

**The trust spine**
- Cancellation Shield — auto-substitute a commodity instead of cancelling — `SHIELD`
- Apology Engine — proactive credit + apology before complaint — `APOLOGY`
- Freshness Passport — verified pass/flag with substitute — `FRESHNESS`
- Confidence Chip — stock/picker/freshness receipt on high-stakes items — `CONFIDENCE`
- Zero-Bot Escalation — instant human routing, no chatbot loop — `ESCALATE`
- Failure Mode Memory — remembers a bad SKU/store so it isn't re-picked — `MEMORY`
- Trust Log — the auditable ledger of every promise kept — *(receipts screen)*

**Speed & logistics**
- One-Swipe + Speculative Dispatch — picking starts before final tap — `DISPATCH`
- Biometric confirm — WebAuthn-style fingerprint — `DISPATCH` / `ENGINE`
- Dead-Zone Mode — offline queue with CRDT double-order safety — `CRDT`
- Regret Window — post-order companion add via mid-route intercept — `MAP`
- Ghost-Carting — cross-tab trip consolidation (45s / 2min / "tap now") — `GHOST`

**The crazy multiplier**
- **Crisis Mesh** — a shared outage triggers a building-wide group push, pre-positions
  stock, and batches everyone's trips — `MESH`

**Anticipation, done respectfully**
- Pre-Crime Inventory Push — anticipatory home-feed staging — `PREDICT`
- **"Why am I seeing this?"** — consent-first explainability + signal mute — `CONSENT`
- Drift Detection — retracts a push when the need passes — `DRIFT`
- 1% Battery Mode — stripped one-button emergency UI — `BATTERY`
- Heartbeat — stress-aware panic kit — `HEARTBEAT`

Five further **vision features** live in **[`docs/roadmap.md`](./docs/roadmap.md)**.

---

## Project structure

```
amazon-blink/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx              # mounts the Digital Twin
│  │  └─ api/bedrock/route.ts  # provider switch (demo|anthropic|bedrock) + actions:
│  │  │                        #   solve | disaster | freshness | severity
│  ├─ components/
│  │  ├─ DigitalTwin.tsx       # 3-pane stage + header metrics (incl. live TTLA)
│  │  ├─ DirectorConsole.tsx   # scenario remote control + Crisis Mesh trigger
│  │  ├─ CityMap.tsx           # self-contained SVG map + Crisis Mesh visualization
│  │  ├─ SystemBrain.tsx       # the auto-scrolling decision log
│  │  ├─ phone/
│  │  │  ├─ DecisionEngine.tsx # ⚡ the Zero-Decision Engine (the centerpiece)
│  │  │  ├─ HomeFeed.tsx       # hero "Blink it" + predictions + consent chips
│  │  │  ├─ Checkout.tsx       # One-Swipe + biometric + Shield (NEVER_SWAP-aware)
│  │  │  └─ … Camera, Freshness, GhostCart, DeadZone, ZeroBot, Battery, Heartbeat, TrustLog
│  │  └─ ui/                   # Button, SwipeToConfirm, ConfidenceChip, Toasts
│  └─ lib/
│     ├─ store.ts              # Zustand single source of truth (TTLA, mesh, consent…)
│     ├─ data.ts               # India-seeded catalog w/ needs: + NEVER_SWAP, ambient, building
│     ├─ demoResponses.ts      # offline fallbacks incl. the Zero-Decision solver
│     └─ ghost.ts + useGhostChannel.ts   # cross-tab realtime (BroadcastChannel)
└─ public/samples/            # disaster + freshness demo photos
```

---

## Technical notes & deliberate choices

- **Next.js 14 (App Router) + React 18 + TypeScript + Tailwind + Zustand.**
- **One coherent app, two merged concepts.** This codebase fuses a Next.js "Digital Twin"
  prototype with a separately-built "Zero-Decision Engine" (Vite + Express). The engine's
  best ideas — the decide-step framing, TTLA, the Dependency Guardrail, NEVER_SWAP, and a
  real Bedrock provider switch — are folded in as first-class features. See
  **[`REFINEMENTS_AND_IDEAS.md`](./REFINEMENTS_AND_IDEAS.md)**.
- **Real-when-keyed, scripted-when-not.** With a key the model calls are live; without one
  they're a rich demo. The Bedrock path uses the real `@aws-sdk/client-bedrock-runtime`
  with `anthropic_version: "bedrock-2023-05-31"` — we label it honestly rather than faking
  a "Bedrock" sticker over a mock.
- **Cross-tab realtime uses `BroadcastChannel`, not a socket server** — zero-latency for
  the two-tab Ghost-Cart demo, nothing to crash, deploys to Vercel as a static + edge bundle.
- **The city map is hand-built SVG** — no tiles/Leaflet — so it always renders offline and
  animates couriers, intercepts, and the Crisis Mesh deterministically.
- **All backend is mocked** with India-seeded data (Indiranagar, Bengaluru; ₹ pricing).

---

## Deploy

```bash
vercel    # add ANTHROPIC_API_KEY (or AWS creds + PROVIDER=bedrock) in Environment Variables
```
Any Node host works: `npm run build && npm run start`.
"# AmaBlink" 
