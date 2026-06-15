"use client";
import React, { useState } from "react";
import { useBlink } from "@/lib/store";
import { inr, product } from "@/lib/data";
import Icon from "../Icon";
import { AppHeader } from "./Parts";

export default function BatteryMode() {
  const { lowBattery, setFlag, addLog, pushToast } = useBlink();
  const [sent, setSent] = useState(false);

  const pb = product("powerbank")!;
  const cable = product("cable")!;
  const total = pb.price + cable.price;

  function sendHelp() {
    setSent(true);
    addLog("BATTERY", `1% mode → pre-authorised dispatch: ${pb.name} + ${cable.name} to live GPS (2 taps)`);
    pushToast({ kind: "trust", title: "Help is on the way", body: "Power bank + cable dispatched to your location." });
  }

  // ── Stripped emergency UI ──
  if (lowBattery) {
    return (
      <div className="flex min-h-full flex-col bg-[#0c0c0c] px-6 py-8 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-widest text-white/50">Emergency mode</span>
          <span className="flex items-center gap-1.5 text-alert">
            <span className="relative inline-flex h-3.5 w-7 items-center rounded-[3px] border border-alert px-[1px]">
              <span className="h-2.5 w-[6%] rounded-[1px] bg-alert" />
              <span className="absolute -right-[3px] h-2 w-[2px] rounded-r bg-alert" />
            </span>
            <span className="text-sm font-bold">1%</span>
          </span>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[13px] text-white/50">Battery critical — everything non-essential is off.</p>
          <p className="mt-1 text-[15px] font-semibold text-white">Get help before the phone dies.</p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="rounded-xl border border-white/15 p-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">Live location</p>
            <p className="mt-0.5 font-mono text-[13px] text-white">12.9719° N, 77.6412° E</p>
          </div>
          <div className="rounded-xl border border-white/15 p-3">
            <p className="text-[10px] uppercase tracking-wide text-white/40">Saved address</p>
            <p className="mt-0.5 text-[13px] text-white">Flat 3B, 12th Main, Indiranagar, Bengaluru</p>
          </div>
        </div>

        {!sent ? (
          <button
            onClick={sendHelp}
            className="mt-auto w-full rounded-2xl bg-white py-4 text-[15px] font-bold text-black active:scale-[0.98]"
          >
            Send help to my location
          </button>
        ) : (
          <div className="mt-auto rounded-2xl border border-white/20 p-4 text-center">
            <Icon name="check" size={28} className="mx-auto text-white" strokeWidth={2.6} />
            <p className="mt-2 text-[14px] font-bold text-white">Help dispatched · ETA 9 min</p>
            <p className="mt-1 text-[12px] text-white/55">
              {pb.name} + {cable.name} — {inr(total)}, pre-authorised. Matched to your past device.
            </p>
          </div>
        )}
        <p className="mt-3 text-center text-[10px] text-white/30">No tracking · no images · 2 taps</p>
      </div>
    );
  }

  // ── Explainer when not in 1% mode ──
  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="1% Battery Mode" sub="Stranded · dying battery" />
      <div className="px-4 pb-8">
        <div className="mt-3 rounded-2xl border border-mist bg-white p-4 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white">
            <Icon name="battery" size={24} strokeWidth={2.2} />
          </span>
          <p className="mt-3 text-[13px] text-ink/70">
            The real scenario isn’t at home near a charger — it’s outside, stranded, with a dying phone. At 5%, Blink
            strips all styling, imagery, and tracking down to your GPS, your saved address, and a single button.
          </p>
          <p className="mt-2 text-[13px] text-ink/70">
            A pre-authorised power bank and matching cable dispatch in two taps — while there’s still battery to
            confirm.
          </p>
        </div>
        <button
          onClick={() => setFlag("lowBattery", true)}
          className="mt-4 w-full rounded-2xl bg-ink py-3.5 text-[14px] font-bold text-white active:scale-[0.98]"
        >
          Simulate 1% battery
        </button>
        <p className="mt-2 text-center text-[11px] text-ink/45">
          (Also toggleable from the Director’s Console.)
        </p>
      </div>
    </div>
  );
}
