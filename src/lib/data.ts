import { Product, Courier, DarkStore } from "./types";

// ──────────────────────────────────────────────────────────────────────────
// All backend data is mocked with India-context seeds (₹ pricing, Indian
// product names + localities). In production these come from the WMS,
// the stock-confidence service, picker ratings, and the courier fleet.
// ──────────────────────────────────────────────────────────────────────────

export const LOCALITY = "Indiranagar, Bengaluru";

export const CATALOG: Product[] = [
  { id: "eggs", name: "Farm Eggs (tray of 12)", price: 89, emoji: "🥚", category: "Dairy & Eggs", perishable: true, stockCheckedSecAgo: 90, pickerRating: 4.8, freshnessChecked: true, darkStore: "ds-koramangala" },
  { id: "milk", name: "Amul Taaza Milk 1L", price: 72, emoji: "🥛", category: "Dairy & Eggs", perishable: true, stockCheckedSecAgo: 120, pickerRating: 4.7, freshnessChecked: true, darkStore: "ds-indiranagar" },
  { id: "tomato", name: "Tomatoes 500g", price: 34, emoji: "🍅", category: "Vegetables", perishable: true, stockCheckedSecAgo: 200, pickerRating: 4.6, freshnessChecked: true, darkStore: "ds-indiranagar" },
  { id: "bread", name: "Britannia Brown Bread", price: 45, emoji: "🍞", category: "Bakery", perishable: true, stockCheckedSecAgo: 60, pickerRating: 4.9, freshnessChecked: true, darkStore: "ds-indiranagar" },
  { id: "paracetamol", name: "Dolo 650 (strip of 15)", price: 31, emoji: "💊", category: "Pharmacy", stockCheckedSecAgo: 45, pickerRating: 4.9, freshnessChecked: false, darkStore: "ds-koramangala", neverSwap: true },
  { id: "ors", name: "Electral ORS Sachets x4", price: 84, emoji: "🧂", category: "Pharmacy", stockCheckedSecAgo: 70, pickerRating: 4.8, darkStore: "ds-koramangala" },
  { id: "umbrella", name: "Fendo Umbrella", price: 399, emoji: "☂️", category: "Essentials", stockCheckedSecAgo: 150, pickerRating: 4.5, darkStore: "ds-indiranagar" },
  { id: "candles", name: "Emergency Candles x10", price: 60, emoji: "🕯️", category: "Essentials", stockCheckedSecAgo: 300, pickerRating: 4.4, darkStore: "ds-hsr" },
  { id: "powerbank", name: "Mi Power Bank 10000mAh", price: 1099, emoji: "🔋", category: "Electronics", stockCheckedSecAgo: 110, pickerRating: 4.7, darkStore: "ds-indiranagar" },
  { id: "cable", name: "USB-C Fast Cable", price: 249, emoji: "🔌", category: "Electronics", stockCheckedSecAgo: 130, pickerRating: 4.6, darkStore: "ds-indiranagar" },
  { id: "maggi", name: "Maggi Noodles x4", price: 56, emoji: "🍜", category: "Instant", stockCheckedSecAgo: 240, pickerRating: 4.6, darkStore: "ds-hsr" },
  { id: "redbull", name: "Red Bull 250ml", price: 125, emoji: "🥤", category: "Beverages", stockCheckedSecAgo: 95, pickerRating: 4.7, darkStore: "ds-koramangala" },
  { id: "glucose", name: "Glucon-D Biscuits", price: 30, emoji: "🍪", category: "Snacks", stockCheckedSecAgo: 180, pickerRating: 4.5, darkStore: "ds-koramangala" },
  { id: "pen", name: "Reynolds Pens x5", price: 50, emoji: "🖊️", category: "Stationery", stockCheckedSecAgo: 400, pickerRating: 4.4, darkStore: "ds-hsr" },
  { id: "chips", name: "Lay's Magic Masala", price: 30, emoji: "🥔", category: "Snacks", stockCheckedSecAgo: 220, pickerRating: 4.5, darkStore: "ds-indiranagar" },
  { id: "chargerhead", name: "20W Charger Head", price: 699, emoji: "⚡", category: "Electronics", stockCheckedSecAgo: 140, pickerRating: 4.6, darkStore: "ds-indiranagar" },

  // ── added with the Zero-Decision Engine merge ──
  // Dependency edges (needs:) drive the Guardrail; neverSwap marks health-critical locks.
  { id: "thermometer", name: "Dr Trust Digital Thermometer", price: 199, emoji: "🌡️", category: "Pharmacy", stockCheckedSecAgo: 160, pickerRating: 4.7, needs: "aaa", darkStore: "ds-koramangala" },
  { id: "aaa", name: "Duracell AAA Batteries (4)", price: 80, emoji: "🔋", category: "Electronics", stockCheckedSecAgo: 100, pickerRating: 4.8, darkStore: "ds-indiranagar" },
  { id: "aa", name: "Duracell AA Batteries (4)", price: 80, emoji: "🔋", category: "Electronics", stockCheckedSecAgo: 100, pickerRating: 4.8, darkStore: "ds-indiranagar" },
  { id: "torch", name: "Eveready LED Torch", price: 249, emoji: "🔦", category: "Essentials", stockCheckedSecAgo: 220, pickerRating: 4.6, needs: "aa", darkStore: "ds-hsr" },
  { id: "formula", name: "Infant Formula Stage-1 400g", price: 450, emoji: "🍼", category: "Baby", stockCheckedSecAgo: 90, pickerRating: 4.9, neverSwap: true, darkStore: "ds-koramangala" },
  { id: "coughsyrup", name: "Benadryl Cough Syrup 100ml", price: 119, emoji: "🧪", category: "Pharmacy", stockCheckedSecAgo: 130, pickerRating: 4.7, neverSwap: true, darkStore: "ds-koramangala" },
  { id: "antiseptic", name: "Dettol Antiseptic 100ml", price: 75, emoji: "🧴", category: "Pharmacy", stockCheckedSecAgo: 150, pickerRating: 4.6, darkStore: "ds-koramangala" },
  { id: "bandage", name: "Adhesive Bandages x20", price: 45, emoji: "🩹", category: "Pharmacy", stockCheckedSecAgo: 180, pickerRating: 4.6, darkStore: "ds-koramangala" },
  { id: "pipetape", name: "Self-fusing Pipe Tape", price: 149, emoji: "🩹", category: "Hardware", stockCheckedSecAgo: 240, pickerRating: 4.5, darkStore: "ds-indiranagar" },
  { id: "bucket", name: "Mop Bucket 12L", price: 199, emoji: "🪣", category: "Hardware", stockCheckedSecAgo: 300, pickerRating: 4.4, darkStore: "ds-indiranagar" },
  { id: "wrench", name: 'Adjustable Wrench 10"', price: 349, emoji: "🔧", category: "Hardware", stockCheckedSecAgo: 280, pickerRating: 4.5, darkStore: "ds-indiranagar" },
  { id: "fuse", name: "Ceramic Fuse Assorted x5", price: 70, emoji: "🔌", category: "Hardware", stockCheckedSecAgo: 260, pickerRating: 4.4, darkStore: "ds-hsr" },
  { id: "bulb", name: "Philips LED Bulb 9W", price: 90, emoji: "💡", category: "Hardware", stockCheckedSecAgo: 200, pickerRating: 4.6, darkStore: "ds-hsr" },
  { id: "raincoat", name: "Waterproof Raincoat", price: 290, emoji: "🧥", category: "Essentials", stockCheckedSecAgo: 170, pickerRating: 4.5, darkStore: "ds-indiranagar" },
];

export function product(id: string): Product | undefined {
  return CATALOG.find((p) => p.id === id);
}

// Top panic SKUs — surfaced by Heartbeat / 1% Battery / crisis flows
export const PANIC_SKUS = ["paracetamol", "ors", "redbull", "glucose", "powerbank"];

// Late-night "usual" — Lobby Ghost pattern
export const LATE_NIGHT_USUAL = ["maggi", "chips", "redbull"];

// Focus Bundle — exam / contest pre-stage (roadmap teaser, shown in feed)
export const FOCUS_BUNDLE = ["redbull", "glucose", "pen"];

// Weather-driven push (Pre-Crime)
export const RAIN_PUSH = ["umbrella"];

// Dark stores on the SVG map (coords 0..100)
export const DARK_STORES: DarkStore[] = [
  { id: "ds-indiranagar", name: "Indiranagar DS", x: 50, y: 46 },
  { id: "ds-koramangala", name: "Koramangala DS", x: 26, y: 70 },
  { id: "ds-hsr", name: "HSR Layout DS", x: 74, y: 74 },
];

// Courier fleet (Floating Nodes) — initial positions
export const COURIERS: Courier[] = [
  { id: "rider-01", label: "Rider_01", x: 47, y: 40, rating: 4.8 },
  { id: "rider-04", label: "Rider_04", x: 64, y: 30, rating: 4.7 },
  { id: "rider-07", label: "Rider_07", x: 34, y: 58, rating: 4.9 },
];

// Customer location on the map (the "you" pin)
export const HOME_PIN = { x: 56, y: 34, label: "You · 3rd floor" };

// Regret-window companion suggestions (Bedrock would generate live)
export const COMPANION: Record<string, { id: string; pct: number }> = {
  cable: { id: "chargerhead", pct: 60 },
  powerbank: { id: "cable", pct: 72 },
  paracetamol: { id: "ors", pct: 48 },
  maggi: { id: "chips", pct: 55 },
};

export function inr(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// ── Zero-Decision Engine: example situations (chips on the describe tab) ──
export const ENGINE_EXAMPLES = [
  "My kid has a fever and we're out of everything",
  "The pipe under my sink just burst",
  "Power cut — no lights and my torch is dead",
  "It started pouring and I leave in 10 minutes",
];

// ── Open-app ambient context → a bundle is already staged before you type ──
export const AMBIENT: Record<
  string,
  { label: string; note: string; emoji: string; skus: string[] }
> = {
  rain: { label: "Because it's pouring outside", note: "Your rain kit is ready", emoji: "🌧️", skus: ["umbrella", "raincoat"] },
  latenight: { label: "Back home, late night", note: "Your usual late-night picks", emoji: "🌙", skus: LATE_NIGHT_USUAL },
  exam: { label: "Contest in 15 minutes", note: "Focus bundle staged", emoji: "📝", skus: FOCUS_BUNDLE },
};

// ── Crisis Mesh: building-level group push (a crazy, Amazon-scale primitive) ──
export const BUILDING = {
  name: "Brigade Gateway Tower",
  flats: 16, // total flats in the tower
  // SKUs Blink pre-positions at the nearest dark store the moment a shared
  // outage is detected, BEFORE the orders arrive.
  prePosition: ["candles", "powerbank", "torch", "aa"],
};
