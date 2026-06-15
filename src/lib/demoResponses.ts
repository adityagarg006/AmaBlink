import { FreshnessResult, SeverityResult, TriagePlan } from "./types";

// These power DEMO MODE (no API key). With a key set, /api/bedrock calls Claude
// live and these are only used as a network-failure safety net.

export const DISASTER_SCENARIOS: Record<string, TriagePlan> = {
  "burst-pipe": {
    title: "Burst water pipe under sink",
    radius: "Plumbing leak · water spreading on floor",
    question: "Is the water still actively spraying, or only dripping now?",
    steps: [
      "Shut the main valve — usually a lever under the sink or near the meter. Turn clockwise.",
      "Lay towels / the bucket to contain spread and protect the socket below.",
      "Wrap the joint with self-fusing pipe tape as a temporary seal.",
      "If it's a threaded joint, the part is likely a 1/2-inch brass connector — call a plumber and quote that.",
    ],
    items: [
      { name: "Adjustable Wrench 10\"", price: 349, emoji: "🔧", why: "to shut a stiff valve / loosen the joint" },
      { name: "Self-fusing Pipe Tape", price: 149, emoji: "🩹", why: "temporary leak seal on the joint" },
      { name: "Mop Bucket 12L", price: 199, emoji: "🪣", why: "contain water, protect the socket" },
      { name: "Microfibre Towels x3", price: 179, emoji: "🧻", why: "soak standing water fast" },
      { name: "1/2\" Brass Connector", price: 99, emoji: "🔩", why: "likely the failed part for the plumber" },
    ],
  },
  "blown-fuse": {
    title: "Tripped main / blown fuse",
    radius: "Electrical fault · partial power loss",
    question: "Did one room go dark, or the whole flat?",
    steps: [
      "Do NOT touch the board with wet hands. Switch off everything downstream first.",
      "Flip the tripped MCB fully OFF, then back ON. If it trips again, leave it off.",
      "Unplug the last appliance you switched on — that's the likely culprit.",
      "If the main keeps tripping, it's likely a 16A MCB — call an electrician with that rating.",
    ],
    items: [
      { name: "16A MCB Switch", price: 189, emoji: "🔌", why: "likely replacement breaker" },
      { name: "LED Torch", price: 249, emoji: "🔦", why: "work safely in the dark" },
      { name: "Insulated Screwdriver Set", price: 299, emoji: "🪛", why: "safe board access" },
      { name: "Emergency Candles x10", price: 60, emoji: "🕯️", why: "backup light tonight" },
    ],
  },
  "gas-leak": {
    title: "Suspected LPG gas leak",
    radius: "Safety-critical · do not create sparks",
    question: "Can you smell gas right now near the cylinder?",
    steps: [
      "Do NOT switch any electrical switch on or off. No flames.",
      "Turn the regulator knob to OFF on the cylinder immediately.",
      "Open all windows and doors to ventilate.",
      "Step outside and call your gas supplier's emergency line.",
    ],
    items: [
      { name: "LPG Leak Detector Spray", price: 199, emoji: "🧴", why: "locate the leak safely" },
      { name: "Replacement Regulator", price: 449, emoji: "🔧", why: "common failure point" },
      { name: "Suraksha Gas Pipe (ISI)", price: 299, emoji: "🪈", why: "replace a cracked hose" },
    ],
  },
};

export function freshnessDemo(sampleId?: string): FreshnessResult[] {
  if (sampleId === "tomatoes") {
    return [
      {
        item: "Tomatoes 500g",
        emoji: "🍅",
        verdict: "flag",
        score: 41,
        note: "2 of 6 show soft bruising and a split skin — below the 70 freshness gate.",
        substitute: { name: "Tomatoes 500g (Lot B, packed 1h ago)", emoji: "🍅", score: 94 },
      },
    ];
  }
  if (sampleId === "milk") {
    return [
      {
        item: "Amul Taaza Milk 1L",
        emoji: "🥛",
        verdict: "pass",
        score: 97,
        note: "Seal intact, date 6 days out, no bloating. Cleared.",
      },
    ];
  }
  // default: eggs (the headline #1 complaint)
  return [
    {
      item: "Farm Eggs (tray of 12)",
      emoji: "🥚",
      verdict: "flag",
      score: 38,
      note: "Visual anomaly: 1 hairline-cracked shell + slight discolouration on 2 eggs.",
      substitute: { name: "Farm Eggs (tray of 12, verified)", emoji: "🥚", score: 96 },
    },
  ];
}

// ── Zero-Decision Engine (offline fallback) ──────────────────────────────
// Returns the same raw shape the live model emits; the API route resolves
// sku_ids against the catalog and enforces the Dependency Guardrail.
export function solveDemo(query: string, scenarioHint?: string) {
  const t = (query || "").toLowerCase();
  const has = (...k: string[]) => k.some((w) => t.includes(w));

  // camera scenario hints take priority
  const hint = scenarioHint || "";
  if (hint === "burst-pipe" || has("pipe", "leak", "burst", "sink", "water")) {
    return {
      diagnosis: "Burst pipe under the sink — stop the water, contain it, seal the joint.",
      triage: [
        "Shut the main valve (clockwise) — usually under the sink or near the meter.",
        "Put the bucket under the leak and lay towels to protect the socket below.",
        "Wrap the joint with self-fusing tape as a temporary seal until a plumber arrives.",
      ],
      items: [
        { sku_id: "pipetape", reason: "temporary seal on the leaking joint" },
        { sku_id: "bucket", reason: "contain water, protect the socket" },
        { sku_id: "wrench", reason: "shut a stiff valve / loosen the joint" },
      ],
      dependencies: [],
      safety: [],
    };
  }
  if (hint === "blown-fuse" || has("power", "fuse", "dark", "lights", "light", "electric", "outage", "current")) {
    return {
      diagnosis: "Power cut / blown fuse — light to work by now, plus the likely fix.",
      triage: [
        "Don't touch the board with wet hands; switch off everything downstream first.",
        "Flip the tripped MCB fully OFF then ON. If it trips again, leave it off.",
        "Unplug the last appliance you switched on — usually the culprit.",
      ],
      items: [
        { sku_id: "torch", reason: "light to work safely in the dark" },
        { sku_id: "candles", reason: "backup light for tonight" },
        { sku_id: "fuse", reason: "likely replacement for the blown fuse" },
      ],
      dependencies: [{ sku_id: "aa", for: "Eveready LED Torch", reason: "the torch ships without cells" }],
      safety: [],
    };
  }
  if (has("fever", "sick", "temperature", "ill", "flu", "kid", "child", "baby", "infant")) {
    const baby = has("baby", "infant", "formula");
    return {
      diagnosis: baby
        ? "Infant fever care — OTC essentials, a way to measure it, and feeding."
        : "Fever care — OTC essentials plus a way to actually measure the temperature.",
      triage: [
        "Keep fluids up; sponge with room-temperature (not cold) water.",
        "Follow the dosage printed on the strip by age/weight — do not guess.",
        "If it crosses 102°F or lasts beyond 2 days, consult a doctor.",
      ],
      items: [
        { sku_id: "paracetamol", reason: "standard OTC fever/pain reducer" },
        { sku_id: "thermometer", reason: "you can't manage a fever you can't measure" },
        { sku_id: "ors", reason: "prevent dehydration from sweating" },
        ...(baby ? [{ sku_id: "formula", reason: "infant feeding" }] : []),
      ],
      dependencies: [{ sku_id: "aaa", for: "Dr Trust Digital Thermometer", reason: "the thermometer needs cells to work" }],
      safety: baby
        ? [{ sku_id: "paracetamol", reason: "never auto-substitute medicine" }, { sku_id: "formula", reason: "never auto-substitute infant formula" }]
        : [{ sku_id: "paracetamol", reason: "never auto-substitute medicine" }],
    };
  }
  if (has("rain", "pour", "monsoon", "wet", "umbrella", "storm")) {
    return {
      diagnosis: "Heading out into the rain — stay dry on the way.",
      triage: ["Check the radar before you leave; the heaviest band passes in ~30 min."],
      items: [
        { sku_id: "umbrella", reason: "immediate cover" },
        { sku_id: "raincoat", reason: "hands-free protection if it's windy" },
      ],
      dependencies: [],
      safety: [],
    };
  }
  if (has("phone", "charge", "charging", "dying", "dead battery", "power bank", "powerbank")) {
    return {
      diagnosis: "Phone about to die — power now and the cable to use it.",
      triage: ["Drop to low-power mode and close background apps while it charges."],
      items: [
        { sku_id: "powerbank", reason: "portable charge anywhere" },
        { sku_id: "cable", reason: "you need the right cable to use the power bank" },
        { sku_id: "chargerhead", reason: "fast top-up from a wall socket" },
      ],
      dependencies: [],
      safety: [],
    };
  }
  if (has("exam", "contest", "study", "focus", "interview", "deadline")) {
    return {
      diagnosis: "Crunch-time focus kit, staged before the window closes.",
      triage: ["Hydrate, single-task, and take a 5-minute break each hour."],
      items: [
        { sku_id: "redbull", reason: "caffeine for alertness" },
        { sku_id: "glucose", reason: "steady energy" },
        { sku_id: "pen", reason: "in case it's pen-and-paper" },
      ],
      dependencies: [],
      safety: [],
    };
  }
  if (has("cut", "wound", "bleed", "first aid", "first-aid")) {
    return {
      diagnosis: "Minor cut — clean it and cover it.",
      triage: ["Rinse under clean water, apply antiseptic, then cover with a bandage."],
      items: [
        { sku_id: "antiseptic", reason: "disinfect the wound" },
        { sku_id: "bandage", reason: "cover and protect" },
      ],
      dependencies: [],
      safety: [],
    };
  }
  // default: a sensible starter, with an honest note to refine
  return {
    diagnosis: "Here's a sensible starter kit — add a detail or two and I'll tailor it.",
    triage: ["Tell me what's happening (fever, leak, power cut, rain…) for an exact package."],
    items: [
      { sku_id: "ors", reason: "broadly useful in most urgent situations" },
      { sku_id: "powerbank", reason: "stay reachable" },
    ],
    dependencies: [],
    safety: [],
  };
}

export function severityDemo(text: string): SeverityResult {
  const t = (text || "").toLowerCase();
  const high = [
    "spoil",
    "rotten",
    "smell",
    "smelly",
    "expired",
    "wrong medicine",
    "wrong medication",
    "sick",
    "vomit",
    "allergic",
    "rash",
    "mould",
    "mold",
    "fungus",
    "insect",
    "worm",
    "safety",
    "burn",
    "leak",
    "baby",
    "infant",
  ];
  const isHigh = high.some((k) => t.includes(k));
  if (isHigh) {
    return {
      severity: "high",
      category: t.includes("medicine") || t.includes("medication")
        ? "Wrong / unsafe pharmacy item"
        : "Spoiled or unsafe item",
      action: "Full refund approved automatically · order flagged · escalated to a human specialist (no bot loop).",
      refund: 89,
      reason:
        "Health/safety signal detected in the report. Policy authorises instant refund and direct human escalation rather than a chatbot triage queue.",
    };
  }
  return {
    severity: "low",
    category: "Service / packaging issue",
    action: "Logged · short 2-field form to capture details · resolution within the app, no call needed.",
    reason: "No health/safety signal detected; routed to standard lightweight resolution.",
  };
}
