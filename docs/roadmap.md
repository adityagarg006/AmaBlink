# Amazon Blink — Roadmap (Vision Features)

These are **not built** in the prototype. They are the natural next moves once the
core engine (predictive push + the Trust spine) is in production. We list them so
judges can see where the idea goes beyond a 48-hour build. Each one reuses
infrastructure that already exists in the prototype today.

---

### 1. Scream-to-Cart (panic voice intake)
A one-press voice button for moments when typing is the wrong interface — a kitchen
fire, a kid who just swallowed something, a power cut in the dark. You describe the
situation in plain words and Blink triages it the way the Disaster Camera triages a
photo: it identifies the emergency, pushes the exact SKUs (extinguisher, ORS,
candles, power bank), and emits a System Brain line explaining the call. Builds
directly on the existing `disaster` and `severity` Bedrock actions; only the input
modality changes.

### 2. Lobby Ghost (building-aware consolidation)
Ghost-Carting today correlates orders across tabs/time. Lobby Ghost extends the same
correlation to *physical proximity*: when a courier is already in your building
lobby for a neighbour's order, Blink offers to attach your order to that same trip —
splitting the fee and collapsing two rider trips into one. It is the cross-tab
BroadcastChannel demo turned into a real geofenced signal, and it makes the city map
visibly less busy.

### 3. Monsoon Mesh (offline order relay)
Dead-Zone Mode already queues an order locally and merges it cleanly when the network
returns. Monsoon Mesh turns a single dead phone into a node: during a storm or
outage, queued orders hop peer-to-peer (BLE / local mesh) through nearby Blink
devices until one of them has signal and relays the batch. The CRDT merge logic that
prevents double-orders in the prototype is exactly what makes a multi-hop relay safe.

### 4. Last-Meter Spatial Nav (find-the-door AR)
Most "late" deliveries are actually *lost* deliveries — the rider is at the gate but
can't find the flat. Last-Meter Spatial Nav hands the courier an AR arrow for the
final 50 metres (gate → lift → floor → door), using the saved pin and building
metadata. This is the consumer-side map from the prototype, re-pointed at the rider
to kill the most common cause of a cold, late, "where is it?" order.

### 5. External Schedule Integrations (anticipatory, consented)
Blink's predictions today come from time-of-day and behaviour. With explicit opt-in,
it can read *intent* sources — a calendar ("flight 6 AM" → travel kit the night
before), a period-tracker, a recurring-medication date, a weather alert — and stage
the cart *before* the need is conscious. Every such push carries a "Why am I seeing
this?" receipt, so anticipation never crosses into creepiness. This is the Pre-Crime
Inventory Push generalised to real-world calendars, gated behind consent.
