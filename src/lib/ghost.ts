// ──────────────────────────────────────────────────────────────────────────
// Ghost-Carting cross-tab transport.
//
// Production story: Socket.io rooms keyed by building + DBSCAN order clusters.
// For a single demo laptop with two browser tabs, BroadcastChannel is the
// bulletproof equivalent — zero latency, no server, still Vercel-deployable.
// Tab A checks out → Tab B (on the Nearby screen) sees the live window.
// ──────────────────────────────────────────────────────────────────────────

export type GhostMsg = { type: "order"; items: string[]; at: number; tab: string };

const CHANNEL = "blink-ghost";
const tabId = Math.random().toString(36).slice(2);

let channel: BroadcastChannel | null = null;
let recent: number[] = []; // order timestamps in the last 10 min (correlation)

export function getGhostChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL);
  return channel;
}

export const myTab = () => tabId;

// Returns how many correlated orders have landed in the last 10 minutes.
export function pushRecentOrder(at: number): number {
  recent = recent.filter((t) => at - t < 10 * 60 * 1000);
  recent.push(at);
  return recent.length;
}

export function broadcastOrder(items: string[]) {
  getGhostChannel()?.postMessage({ type: "order", items, at: Date.now(), tab: tabId } as GhostMsg);
}
