import { create } from "zustand";
import { CartItem, LogEntry, LogTag, Product, Screen } from "./types";
import { product } from "./data";

let logSeq = 0;
let toastSeq = 0;

export interface Toast {
  id: number;
  kind: "trust" | "apology" | "info" | "alert";
  title: string;
  body?: string;
}

interface BlinkState {
  // ── System Brain ──
  log: LogEntry[];
  addLog: (tag: LogTag, text: string) => void;
  clearLog: () => void;

  // ── Navigation (phone) ──
  screen: Screen;
  setScreen: (s: Screen) => void;

  // ── Director's Console scenario flags ──
  rainIncoming: boolean;
  stockDrop: boolean;
  courierInBuilding: boolean;
  lowBattery: boolean;
  stressDetected: boolean;
  networkDown: boolean;
  setFlag: (k: ScenarioFlag, v: boolean) => void;

  // ── Cart ──
  cart: CartItem[];
  addItem: (p: Product, qty?: number) => void;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  substituteInCart: (id: string, sub: Product, reason: string) => void;
  clearCart: () => void;

  // ── Trust telemetry ──
  credits: number; // total apology credits issued (₹)
  issueCredit: (amount: number) => void;

  // ── Failure Mode Memory ──
  failureMemory: { sku: string; store: string; note: string }[];
  rememberFailure: (sku: string, store: string, note: string) => void;

  // ── Toasts ──
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => number;
  dismissToast: (id: number) => void;

  // ── Cross-tab Ghost-Cart (incoming) ──
  ghostIncoming: null | { from: string; window: number; mode: GhostMode; items: string[] };
  setGhostIncoming: (g: BlinkState["ghostIncoming"]) => void;

  // ── Map orchestration (Regret-Window intercept etc.) ──
  mapEvent: "idle" | "intercept";
  setMapEvent: (e: "idle" | "intercept") => void;

  // ── Live demo metrics (Digital Twin header) ──
  consolidated: number; // ghost-cart joins folded into one run
  bumpConsolidated: () => void;
  dispatched: number; // speculative dispatches authorized
  bumpDispatched: () => void;
  liveSeen: boolean; // has a real Claude call returned this session
  markLive: () => void;

  // ── TTLA: Time-to-Leave-App (headline speed metric, merged in) ──
  ttlaStart: number | null;
  ttlaFinal: number | null;
  startTTLA: () => void;
  freezeTTLA: () => void;

  // ── Crisis Mesh: building-level group push + consolidation ──
  crisisMesh: boolean;
  meshOrders: number;
  triggerCrisisMesh: () => void;
  bumpMesh: () => void;
  clearCrisisMesh: () => void;

  // ── Consent-first prediction: signals the user muted ──
  mutedSignals: string[];
  muteSignal: (sig: string) => void;

  resetDemo: () => void;
}

export type ScenarioFlag =
  | "rainIncoming"
  | "stockDrop"
  | "courierInBuilding"
  | "lowBattery"
  | "stressDetected"
  | "networkDown";

export type GhostMode = "countdown" | "extended" | "in-building";

export const useBlink = create<BlinkState>((set, get) => ({
  log: [
    {
      id: "boot",
      ts: Date.now(),
      tag: "SYSTEM",
      text: "Digital Twin online · System Brain listening · all backend services mocked (India seed)",
    },
  ],
  addLog: (tag, text) =>
    set((s) => ({
      log: [...s.log, { id: `l${++logSeq}`, ts: Date.now(), tag, text }].slice(-220),
    })),
  clearLog: () => set({ log: [] }),

  screen: "home",
  setScreen: (screen) => set({ screen }),

  rainIncoming: false,
  stockDrop: false,
  courierInBuilding: false,
  lowBattery: false,
  stressDetected: false,
  networkDown: false,
  setFlag: (k, v) => set({ [k]: v } as any),

  cart: [],
  addItem: (p, qty = 1) =>
    set((s) => {
      const existing = s.cart.find((c) => c.id === p.id);
      if (existing)
        return { cart: s.cart.map((c) => (c.id === p.id ? { ...c, qty: c.qty + qty } : c)) };
      return { cart: [...s.cart, { ...p, qty }] };
    }),
  addToCart: (id, qty = 1) => {
    const p = product(id);
    if (!p) return;
    set((s) => {
      const existing = s.cart.find((c) => c.id === id);
      if (existing) {
        return {
          cart: s.cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c)),
        };
      }
      return { cart: [...s.cart, { ...p, qty }] };
    });
  },
  removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
  substituteInCart: (id, sub, reason) =>
    set((s) => ({
      cart: s.cart.map((c) =>
        c.id === id
          ? { ...sub, qty: c.qty, substitutedFrom: c.name, reason }
          : c
      ),
    })),
  clearCart: () => set({ cart: [] }),

  credits: 0,
  issueCredit: (amount) => set((s) => ({ credits: s.credits + amount })),

  failureMemory: [],
  rememberFailure: (sku, store, note) =>
    set((s) =>
      s.failureMemory.some((f) => f.sku === sku && f.store === store)
        ? s
        : { failureMemory: [...s.failureMemory, { sku, store, note }] }
    ),

  toasts: [],
  pushToast: (t) => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

  ghostIncoming: null,
  setGhostIncoming: (ghostIncoming) => set({ ghostIncoming }),

  mapEvent: "idle",
  setMapEvent: (mapEvent) => set({ mapEvent }),

  consolidated: 0,
  bumpConsolidated: () => set((s) => ({ consolidated: s.consolidated + 1 })),
  dispatched: 0,
  bumpDispatched: () => set((s) => ({ dispatched: s.dispatched + 1 })),
  liveSeen: false,
  markLive: () => set({ liveSeen: true }),

  ttlaStart: null,
  ttlaFinal: null,
  startTTLA: () =>
    set((s) => (s.ttlaStart == null ? { ttlaStart: Date.now(), ttlaFinal: null } : {})),
  freezeTTLA: () =>
    set((s) =>
      s.ttlaStart != null && s.ttlaFinal == null
        ? { ttlaFinal: (Date.now() - s.ttlaStart) / 1000 }
        : {}
    ),

  crisisMesh: false,
  meshOrders: 0,
  triggerCrisisMesh: () => set({ crisisMesh: true }),
  bumpMesh: () => set((s) => ({ meshOrders: s.meshOrders + 1 })),
  clearCrisisMesh: () => set({ crisisMesh: false, meshOrders: 0 }),

  mutedSignals: [],
  muteSignal: (sig) =>
    set((s) => (s.mutedSignals.includes(sig) ? s : { mutedSignals: [...s.mutedSignals, sig] })),

  resetDemo: () =>
    set({
      cart: [],
      credits: 0,
      failureMemory: [],
      toasts: [],
      ghostIncoming: null,
      mapEvent: "idle",
      consolidated: 0,
      dispatched: 0,
      ttlaStart: null,
      ttlaFinal: null,
      crisisMesh: false,
      meshOrders: 0,
      mutedSignals: [],
      rainIncoming: false,
      stockDrop: false,
      courierInBuilding: false,
      lowBattery: false,
      stressDetected: false,
      networkDown: false,
      screen: "home",
      log: [
        {
          id: "reboot",
          ts: Date.now(),
          tag: "SYSTEM",
          text: "Demo reset · Digital Twin re-initialised",
        },
      ],
    }),
}));
