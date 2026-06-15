"use client";
import React, { useRef } from "react";
import { useBlink, ScenarioFlag } from "@/lib/store";
import { BUILDING } from "@/lib/data";
import Icon, { IconName } from "./Icon";

type Toggle = {
  flag: ScenarioFlag;
  label: string;
  icon: IconName;
  on: string; // log line when enabled
  off: string; // log line when disabled
  goto?: "checkout" | "ghost" | "battery" | "heartbeat" | "deadzone";
  tag?: any;
};

const TOGGLES: Toggle[] = [
  { flag: "rainIncoming", label: "Rain in 45m", icon: "rain", tag: "PREDICT",
    on: "Weather stream: rain in ~45 min → Pre-Crime push, umbrellas relocating to dispatch counters",
    off: "Weather cleared → umbrella pre-position stood down" },
  { flag: "stockDrop", label: "Stock drop", icon: "alert", tag: "SHIELD", goto: "checkout",
    on: "Stock-confidence event armed → Cancellation Shield watching the active cart",
    off: "Stock confidence recovered" },
  { flag: "courierInBuilding", label: "Courier in bldg", icon: "pin", tag: "GHOST", goto: "ghost",
    on: "Courier entered the building → Ghost-Cart window collapses to ‘tap now’",
    off: "Courier left the building" },
  { flag: "networkDown", label: "Kill network", icon: "wifioff", tag: "CRDT", goto: "deadzone",
    on: "Network dropped (dead zone) → checkout switches to offline edge commit",
    off: "Network restored → edge replica will merge" },
  { flag: "stressDetected", label: "Stress signal", icon: "pulse", tag: "HEARTBEAT", goto: "heartbeat",
    on: "Behavioural stress detected → Heartbeat panic kit pre-staged",
    off: "Stress signal normalised" },
  { flag: "lowBattery", label: "1% battery", icon: "battery", tag: "BATTERY", goto: "battery",
    on: "Battery critical (1%) → emergency mode engaged",
    off: "Battery recovered → normal UI restored" },
];

export default function DirectorConsole() {
  const store = useBlink();
  const ghostClicks = useRef(0);
  const ghostTs = useRef(0);
  const meshTimer = useRef<any>(null);

  const flagVal = (f: ScenarioFlag) => store[f] as boolean;

  function toggle(t: Toggle) {
    const next = !flagVal(t.flag);
    store.setFlag(t.flag, next);
    store.addLog(t.tag || "SYSTEM", next ? t.on : t.off);
    if (next && t.goto) store.setScreen(t.goto);
  }

  // ── Crisis Mesh: one shared outage → group push + pre-position + batch trips ──
  function crisisMesh() {
    if (useBlink.getState().crisisMesh) return; // already running
    store.triggerCrisisMesh();
    store.addLog("MESH", `Grid sensor: power outage at ${BUILDING.name} (${BUILDING.flats} flats) → Crisis Mesh engaged`);
    store.addLog("MESH", `Group push sent to every flat · pre-positioning ${BUILDING.prePosition.join(", ")} at Indiranagar DS before any order lands`);
    store.pushToast({ kind: "trust", title: "Power cut in your building", body: "Your emergency kit is pre-staged — order in one tap." });
    store.setScreen("engine");
    const cap = 11;
    if (meshTimer.current) clearInterval(meshTimer.current);
    meshTimer.current = setInterval(() => {
      const st = useBlink.getState();
      if (!st.crisisMesh || st.meshOrders >= cap) {
        clearInterval(meshTimer.current);
        meshTimer.current = null;
        if (st.crisisMesh && st.meshOrders >= cap) {
          store.addLog("MESH", `${cap} flats ordered → consolidated into 2 batched courier trips (~${BUILDING.flats - cap} fewer vans on the road)`);
        }
        return;
      }
      store.bumpMesh();
    }, 650);
  }

  function ghostOpportunity() {
    const now = Date.now();
    if (now - ghostTs.current > 10 * 60 * 1000) ghostClicks.current = 0;
    ghostTs.current = now;
    ghostClicks.current += 1;

    const inB = store.courierInBuilding;
    const mode = inB ? "in-building" : ghostClicks.current >= 2 ? "extended" : "countdown";
    const window = mode === "in-building" ? 0 : mode === "extended" ? 120 : 45;
    store.setGhostIncoming({ from: "3B neighbour", window, mode, items: ["maggi", "chips"] });
    store.addLog(
      "GHOST",
      mode === "in-building"
        ? "Correlated order on your floor → window OPEN (courier already in building)"
        : mode === "extended"
        ? `Correlated order #${ghostClicks.current} on your floor in 10 min → window extended to 2:00`
        : "Neighbour ordered on your floor → 45s consolidation window opened"
    );
    store.setScreen("ghost");
  }

  return (
    <div className="rounded-2xl border border-hair/70 bg-slab/80 p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cloud/50">
          <Icon name="bolt" size={13} strokeWidth={2.4} /> Director’s Console
        </span>
        <span className="text-[10px] text-cloud/30">trigger scenarios on cue</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TOGGLES.map((t) => {
          const active = flagVal(t.flag);
          return (
            <button
              key={t.flag}
              onClick={() => toggle(t)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                active
                  ? "border-blink bg-blink text-ink shadow-glow"
                  : "border-hair bg-abyss/60 text-cloud/60 hover:border-blink/40 hover:text-cloud"
              }`}
            >
              <Icon name={t.icon} size={13} strokeWidth={2.3} />
              {t.label}
            </button>
          );
        })}

        <span className="mx-1 self-center text-hair">|</span>

        <button
          onClick={ghostOpportunity}
          className="inline-flex items-center gap-1.5 rounded-full border border-trust/60 bg-trust/15 px-2.5 py-1.5 text-[11px] font-semibold text-trust hover:bg-trust/25"
        >
          <Icon name="ghost" size={13} strokeWidth={2.3} /> Ghost opportunity
        </button>
        <button
          onClick={crisisMesh}
          className="inline-flex items-center gap-1.5 rounded-full border border-warn/60 bg-warn/15 px-2.5 py-1.5 text-[11px] font-semibold text-warn hover:bg-warn/25"
        >
          <Icon name="building" size={13} strokeWidth={2.3} /> Power-cut (building)
        </button>
        <button
          onClick={() => store.resetDemo()}
          className="inline-flex items-center gap-1.5 rounded-full border border-hair bg-abyss/60 px-2.5 py-1.5 text-[11px] font-semibold text-cloud/60 hover:text-cloud"
        >
          <Icon name="refresh" size={13} strokeWidth={2.3} /> Reset
        </button>
      </div>
    </div>
  );
}
