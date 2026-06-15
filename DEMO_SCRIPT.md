# Amazon Blink — Demo Script

A click-by-click walkthrough for judges. The screen is the pitch: **left** = the
customer's phone, **top-right** = the live city map, **bottom-right** = the **System
Brain** narrating every decision. The strip under the header is the **Director's
Console** — your remote control for real-world scenarios. **Reset** is on the right.

> Two versions below: a **90-second** version that lands the single strongest idea, and
> the **full run**.

---

## Pre-flight (30s)
1. `npm install && npm run dev` (or open the deployed URL).
2. For the Ghost-Cart bit you'll want **two browser tabs** on the same URL (**Tab A** =
   narrated, **Tab B** = the "neighbour").
3. Header badge shows **DEMO** or **LIVE** (if `ANTHROPIC_API_KEY` is set). Everything
   works identically either way. Watch the **TTLA** metric in the header — it's the speed
   number.

---

## The 90-second version — "decide for me, and protect me"

This is the whole product in two moves.

**Move 1 — Zero-Decision (speed that matters).**
1. On the phone home screen, tap the orange **⚡ Blink it** card.
2. Tap the example **"My kid has a fever and we're out of everything"** (or type it).
3. Watch the package assemble, and narrate the System Brain:
   - it picks **paracetamol** (with a red **NO-SWAP** lock), a **thermometer**, and **ORS**;
   - under *"Added so it actually works"* it auto-adds the **AAA batteries** — `GUARD` line:
     *"the thermometer can't work without it."*
   - Say: *"A search gives you a thermometer. Blink gives you a thermometer that turns on.
     That's the decision a recommender can't make."*
4. Tap **Decision Replay** → show "normal search" (one item) vs "Blink decided" (the
   complete set). Then **Buy now · one fingerprint**. Note the **TTLA** froze around a few
   seconds.

**Move 2 — Trust (the moat).**
5. You're now in the cart. On the **Director's Console**, toggle **Stock drop**.
6. Watch: a commodity **auto-swaps** to a verified unit (`SHIELD`), a **₹40 credit** is
   issued with an apology **before you complained** (`APOLOGY`) — and the **paracetamol
   stays locked and untouched** (`SHIELD` says the NEVER_SWAP item was protected).
7. Land it: *"Quick commerce cancels on you mid-order. Blink fixes it, protects your
   medicine, and apologises first. Fast is table stakes — right is the moat."*

---

## The full run (~7 min)

### Act 1 — Zero-Decision Engine (the headline, ~2 min)
- Do **Move 1** above. Then also show **Camera mode**: in Blink it → **Camera** → pick the
  **burst-pipe** sample → it identifies the problem and assembles the repair package.
- Optionally tap an **ambient** chip (rain / latenight / exam) at the top of Blink it to
  show a package *already staged for the open-app context* before you type anything
  (`PREDICT`).

### Act 2 — Trust spine (~2.5 min)
- **Cancellation Shield + Apology + NEVER_SWAP** — Move 2 above. The marquee moment.
- **Freshness Passport** — home → **Freshness check** → **eggs** sample = **FLAG** + a
  verified substitute; **milk** sample = **PASS**. Honest proof, two outcomes (`FRESHNESS`).
- **Zero-Bot Escalation** — bottom nav **Help** → tap the spoiled-item chip (or type "eggs
  arrived cracked") → **high severity → instant refund + human**, no bot loop (`ESCALATE`),
  and a **Failure Memory** card so that SKU/store isn't picked for you again (`MEMORY`).
- **Trust Log** — bottom nav **Trust** → the auditable ledger of credits, swaps, and bad
  stores avoided.

### Act 3 — The crazy multiplier: Crisis Mesh (~1 min)
- On the Director's Console, click **Power-cut (building)**.
- Watch the **city map**: the building lights up flat-by-flat as neighbours order, a dashed
  **consolidation line** runs to the nearest dark store, and the **System Brain** explains
  it (`MESH`): a shared outage → **group push to all 16 flats**, **stock pre-positioned**
  before orders arrive, and everything **batched into 2 trips** instead of 11. The header
  shows **homes served** climbing.
- Say: *"One detected outage. Blink turns individual panic into a coordinated, cheaper,
  greener building-level response. Nobody in quick commerce does this."*

### Act 4 — Depth (pick what time allows, ~1.5 min)
- **One-Swipe + Speculative Dispatch** — in the cart, **swipe to order** (or use the
  **fingerprint** button) → `DISPATCH` lines fire *while you swipe*; warehouse picks before
  final tap.
- **Regret Window** — right after ordering, a 3:00 window offers a **companion item**;
  accept → the map draws a mid-route **intercept** (`MAP`).
- **Dead-Zone + CRDT** — Director → **Kill network** → Dead Zone screen → tap buy offline a
  couple of times (no double-order, `CRDT`) → toggle network back → merges to one order.
- **Ghost-Carting** (two tabs) — Tab B places an order; Tab A → **Nearby** shows a join
  window; Director → **Ghost opportunity** extends it to 2:00; **Courier in bldg** flips it
  to "tap now" → **join** consolidates (`GHOST`, "runs merged" ticks up).
- **1% Battery Mode** — Director → **1% battery** → the UI strips to one **Send help**
  button → dispatches a power bank + cable (`BATTERY`).

### Act 5 — Anticipation, done respectfully (~30s)
- Back on home, on the rain push or Focus Bundle tap **"Why am I seeing this?"** → it
  reveals the exact signal that triggered the prediction and lets you **mute that signal**
  (`CONSENT`). *"Anticipation is creepy when it's silent. We make it transparent and
  opt-out-able."*

---

## Reset between runs
Director's Console → **Reset** clears cart, credits, flags, logs, TTLA, and map state.

## If a judge asks "is the AI real? is it Bedrock?"
Yes and yes — with `ANTHROPIC_API_KEY` set the calls hit Claude live (badge **LIVE**); set
`PROVIDER=bedrock` + AWS creds and it runs on **real Amazon Bedrock** via the AWS SDK. With
no key it runs a scripted **DEMO** so the booth never depends on Wi-Fi. We were honest about
this rather than faking a Bedrock label over a mock.
