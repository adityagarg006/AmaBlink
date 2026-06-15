"use client";
import React, { useEffect, useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import { PANIC_SKUS, inr, product } from "@/lib/data";
import Icon from "../Icon";
import Button from "../ui/Button";
import { AppHeader } from "./Parts";

const DECAY = 90;

export default function Heartbeat() {
  const { stressDetected, setFlag, addItem, addLog, setScreen, pushToast } = useBlink();
  const [decay, setDecay] = useState(DECAY);
  const [dissolved, setDissolved] = useState(false);
  const wasOn = useRef(false);

  const kit = PANIC_SKUS.map((id) => product(id)).filter(Boolean) as ReturnType<typeof product>[];
  const total = kit.reduce((a, p) => a + (p?.price || 0), 0);

  // reset when stress turns on
  useEffect(() => {
    if (stressDetected && !wasOn.current) {
      setDissolved(false);
      setDecay(DECAY);
      addLog("HEARTBEAT", "Behavioural stress detected (rapid taps · 02:14 local) → panic kit pre-staged");
    }
    // ── Drift Detection: signal reversed before the user acted ──
    if (!stressDetected && wasOn.current && !dissolved) {
      setDissolved(true);
      addLog("DRIFT", "Stress signal normalised → pre-staged crisis kit silently retracted");
    }
    wasOn.current = stressDetected;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stressDetected]);

  // decay countdown
  useEffect(() => {
    if (!stressDetected || dissolved) return;
    if (decay <= 0) {
      setDissolved(true);
      addLog("DRIFT", "Decay timer expired with no action → crisis kit dissolved");
      return;
    }
    const t = setInterval(() => setDecay((d) => d - 1), 1000);
    return () => clearInterval(t);
  }, [stressDetected, dissolved, decay, addLog]);

  function confirm() {
    kit.forEach((p) => p && addItem(p));
    addLog("HEARTBEAT", "Panic kit confirmed in one tap → speculative dispatch");
    pushToast({ kind: "info", title: "Crisis kit on the way", body: "Your top panic items are being dispatched." });
    setScreen("checkout");
  }

  if (stressDetected && !dissolved) {
    return (
      <div className="min-h-full bg-cloud">
        <div className="bg-alert/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-alert text-white">
              <Icon name="pulse" size={18} strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-[14px] font-bold text-ink">Looks like you’re in a crisis</p>
              <p className="text-[11px] text-ink/55">Your top panic items are ready — one tap.</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="mt-3 flex items-center justify-between rounded-xl bg-warn/10 px-3 py-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-warn">
              <Icon name="clock" size={13} strokeWidth={2.4} /> Decays in
            </span>
            <span className="font-mono text-[13px] font-bold text-warn">
              0:{decay.toString().padStart(2, "0")}
            </span>
          </div>
          <p className="mt-1 px-1 text-[10px] text-ink/45">
            If the stress signal fades before you act, this kit disappears on its own — no stale nudge.
          </p>

          <div className="mt-3 space-y-2">
            {kit.map((p) => (
              <div key={p!.id} className="flex items-center gap-3 rounded-2xl border border-mist bg-white p-2.5 shadow-soft">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-cloud text-2xl">{p!.emoji}</div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-ink">{p!.name}</p>
                  <p className="text-[12px] font-bold text-ink/70">{inr(p!.price)}</p>
                </div>
                <Icon name="check" size={16} className="text-trustdk" strokeWidth={2.6} />
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-mist bg-white p-3 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-ink">Panic kit total</span>
              <span className="text-base font-extrabold text-ink">{inr(total)}</span>
            </div>
          </div>

          <Button variant="danger" size="lg" className="mt-4" onClick={confirm}>
            Confirm crisis kit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="Heartbeat Order" sub="Pre-app intent detection" />
      <div className="px-4 pb-8">
        {dissolved && (
          <div className="mt-3 rounded-2xl border border-mist bg-white p-3 text-center shadow-soft">
            <Icon name="refresh" size={20} className="mx-auto text-ink/40" strokeWidth={2.2} />
            <p className="mt-1 text-[12px] font-semibold text-ink">Pre-staged kit dissolved</p>
            <p className="text-[11px] text-ink/50">The stress signal cleared, so the suggestion retracted itself.</p>
          </div>
        )}
        <div className="mt-3 rounded-2xl border border-mist bg-white p-4 shadow-soft">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-alert/15 text-alert">
            <Icon name="pulse" size={24} strokeWidth={2.3} />
          </span>
          <p className="mt-3 text-[13px] text-ink/70">
            On-device signals — rapid taps, fast scrolling, high brightness at 2 a.m. — hint at a crisis before you
            consciously open the app. Blink surfaces your top 5 panic SKUs, already half-ordered from behaviour.
          </p>
          <p className="mt-2 text-[13px] text-ink/70">
            Drift Detection is the governor: if the signal reverses, the kit retracts so prediction feels helpful,
            never creepy.
          </p>
        </div>
        <Button variant="danger" size="lg" className="mt-4" onClick={() => setFlag("stressDetected", true)}>
          Simulate stress signal
        </Button>
        <p className="mt-2 text-center text-[11px] text-ink/45">(Also toggleable from the Director’s Console.)</p>
      </div>
    </div>
  );
}
