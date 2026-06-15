export type LogTag =
  | "BEDROCK"
  | "ENGINE" // Zero-Decision Engine: assembles a complete package
  | "GUARD" // Dependency Guardrail: adds the consumable an item needs
  | "MESH" // Crisis Mesh: building-level group push + consolidation
  | "CONSENT" // consent-first "why am I seeing this" + signal mute
  | "FRESHNESS"
  | "CONFIDENCE"
  | "SHIELD"
  | "GHOST"
  | "MAP"
  | "CRDT"
  | "DISPATCH"
  | "APOLOGY"
  | "ESCALATE"
  | "PREDICT"
  | "DRIFT"
  | "MEMORY"
  | "BATTERY"
  | "HEARTBEAT"
  | "SYSTEM";

export interface LogEntry {
  id: string;
  ts: number;
  tag: LogTag;
  text: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // INR
  emoji: string;
  category: string;
  perishable?: boolean;
  // confidence/trust fields (mocked telemetry)
  stockCheckedSecAgo?: number;
  pickerRating?: number;
  freshnessChecked?: boolean;
  darkStore?: string;
  // ── merged from the Zero-Decision Engine ──
  needs?: string; // sku id of a consumable this item requires to work (Dependency Guardrail)
  neverSwap?: boolean; // health-critical: medicine / infant formula — never auto-substituted
}

export interface CartItem extends Product {
  qty: number;
  substitutedFrom?: string; // original name if auto-substituted
  reason?: string;
}

export interface Courier {
  id: string;
  label: string;
  x: number; // 0..100 map coords
  y: number;
  rating: number;
  inBuilding?: boolean;
}

export interface DarkStore {
  id: string;
  name: string;
  x: number;
  y: number;
  blacklistedFor?: string[]; // SKU ids this user routes around
}

export type Screen =
  | "home"
  | "engine" // Zero-Decision Engine (describe / camera → complete package)
  | "camera"
  | "freshness"
  | "checkout"
  | "ghost"
  | "deadzone"
  | "zerobot"
  | "battery"
  | "heartbeat"
  | "trustlog";

// ── Zero-Decision Engine result (normalised shape the UI renders) ──
export interface PackageLine {
  sku_id: string;
  name: string;
  emoji: string;
  price: number;
  reason: string;
  kind: "primary" | "dependency"; // dependency = auto-added by the Guardrail
  forItem?: string; // dependency: which primary item it serves
  neverSwap?: boolean; // health-critical safety lock
}

export interface DecisionPackage {
  diagnosis: string;
  triage: string[];
  lines: PackageLine[];
  source: "live" | "demo";
}

export interface TriagePlan {
  title: string;
  radius: string;
  question: string;
  steps: string[];
  items: { name: string; price: number; emoji: string; why: string }[];
}

export interface FreshnessResult {
  item: string;
  emoji: string;
  verdict: "pass" | "flag";
  score: number; // 0..100
  note: string;
  substitute?: { name: string; emoji: string; score: number };
}

export interface SeverityResult {
  severity: "high" | "low";
  category: string;
  action: string;
  refund?: number;
  reason: string;
}
