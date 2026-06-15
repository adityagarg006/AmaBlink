"use client";
import React, { useEffect, useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import Icon, { IconName } from "../Icon";
import { ProductTile, SectionTitle } from "./Parts";
import { CATALOG, FOCUS_BUNDLE, LATE_NIGHT_USUAL, LOCALITY, product, inr } from "@/lib/data";

/* A pre-staged suggestion that decays. Dissolves when its trigger reverses
   (Drift Detection) or its timer expires. */
function PreStaged({
  active,
  decay,
  onDissolve,
  children,
}: {
  active: boolean;
  decay: number;
  onDissolve: (reason: string) => void;
  children: React.ReactNode;
}) {
  const [left, setLeft] = useState(decay);
  const [gone, setGone] = useState(false);
  const fired = useRef(false);

  // countdown
  useEffect(() => {
    if (gone) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [gone]);

  // trigger reversed
  useEffect(() => {
    if (!active && !fired.current) {
      fired.current = true;
      onDissolve("trigger reversed");
      setGone(true);
    }
  }, [active, onDissolve]);

  // decay expired
  useEffect(() => {
    if (left === 0 && !fired.current) {
      fired.current = true;
      onDissolve("decay expired");
      setGone(true);
    }
  }, [left, onDissolve]);

  if (gone) return null;
  const pct = (left / decay) * 100;
  return (
    <div className="origin-top animate-slide-up transition-all duration-300">
      {children}
      <div className="mt-1 flex items-center gap-2 px-1">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-mist">
          <div className="h-full rounded-full bg-warn transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-[10px] text-ink/40">decays {left}s</span>
      </div>
    </div>
  );
}

/* Consent-first explainability: every predicted item can show WHY it appeared
   and let the user mute that signal. Anticipation without the creepiness. */
function WhyChip({ explanation, onMute }: { explanation: string; onMute: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink/40 hover:text-ink/70"
      >
        <Icon name="eye" size={11} strokeWidth={2.3} /> Why am I seeing this?
      </button>
      {open && (
        <div className="mt-1.5 rounded-xl border border-mist bg-cloud/60 p-2.5">
          <p className="text-[11px] leading-snug text-ink/65">{explanation}</p>
          <button
            onClick={onMute}
            className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-1 text-[10px] font-bold text-ink/60 hover:bg-ink/10"
          >
            <Icon name="x" size={10} strokeWidth={2.6} /> Mute this signal
          </button>
        </div>
      )}
    </div>
  );
}

function FeatureTile({
  icon,
  label,
  desc,
  onClick,
  accent,
}: {
  icon: IconName;
  label: string;
  desc: string;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-2xl border border-mist bg-white p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent}`}>
        <Icon name={icon} size={19} strokeWidth={2.2} />
      </span>
      <div>
        <p className="text-[13px] font-bold text-ink">{label}</p>
        <p className="text-[11px] leading-snug text-ink/50">{desc}</p>
      </div>
    </button>
  );
}

export default function HomeFeed() {
  const {
    setScreen,
    addToCart,
    addLog,
    pushToast,
    rainIncoming,
    setFlag,
    stressDetected,
    muteSignal,
  } = useBlink();

  const [focusMuted, setFocusMuted] = useState(false);

  const goCheckout = (id: string) => {
    addToCart(id);
    setScreen("checkout");
  };

  return (
    <div className="px-4 pb-6">
      {/* greeting */}
      <div className="flex items-center justify-between pt-3">
        <div>
          <p className="text-[12px] text-ink/50">Deliver to</p>
          <p className="flex items-center gap-1 text-[14px] font-bold text-ink">
            <Icon name="pin" size={14} className="text-blinkdk" /> {LOCALITY}
          </p>
        </div>
        <div className="rounded-full bg-trust/10 px-2.5 py-1 text-[11px] font-bold text-trustdk">
          7 min ⚡
        </div>
      </div>

      {/* ⚡ Zero-Decision hero — the headline: describe, we decide */}
      <button
        onClick={() => setScreen("engine")}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-blink/40 bg-gradient-to-br from-blink/15 to-warn/10 p-3.5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blink text-ink shadow-glow">
          <Icon name="bolt" size={24} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold text-ink">In an emergency? Blink it.</p>
          <p className="text-[11px] leading-snug text-ink/60">
            Describe it (or show it) — we assemble the whole fix. ~3s, one fingerprint.
          </p>
        </div>
        <Icon name="chevron" size={18} className="text-blinkdk" />
      </button>

      {/* describe, don't search */}
      <button
        onClick={() => setScreen("engine")}
        className="mt-2.5 flex w-full items-center gap-2 rounded-2xl border border-mist bg-white px-3.5 py-3 text-[13px] text-ink/40 shadow-soft"
      >
        <Icon name="mic" size={17} />
        Describe an emergency — we decide, you don't search…
      </button>

      {/* crisis-command entry points */}
      <SectionTitle icon="bolt" accent="text-blinkdk">
        Urgent toolkit
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <FeatureTile
          icon="camera"
          label="Disaster Camera"
          desc="Point at the problem → tools + a plan in 5s"
          accent="bg-blink/15 text-blinkdk"
          onClick={() => setScreen("camera")}
        />
        <FeatureTile
          icon="leaf"
          label="Freshness check"
          desc="See the pre-dispatch quality gate"
          accent="bg-trust/15 text-trustdk"
          onClick={() => setScreen("freshness")}
        />
        <FeatureTile
          icon="ghost"
          label="Nearby orders"
          desc="Join a delivery already coming"
          accent="bg-sky/15 text-sky"
          onClick={() => setScreen("ghost")}
        />
        <FeatureTile
          icon="wifioff"
          label="Dead-zone checkout"
          desc="Order through an elevator dead spot"
          accent="bg-ink/10 text-ink"
          onClick={() => setScreen("deadzone")}
        />
      </div>

      {/* predictive / pre-staged */}
      <SectionTitle icon="sparkles" accent="text-warn">
        Predicted for you
      </SectionTitle>
      <div className="space-y-3">
        {/* Heartbeat — appears under behavioural stress */}
        {stressDetected && (
          <PreStaged
            active={stressDetected}
            decay={40}
            onDissolve={(r) => addLog("DRIFT", `Heartbeat cart dissolved — ${r} (stress signal cleared)`)}
          >
            <button
              onClick={() => setScreen("heartbeat")}
              className="block w-full rounded-2xl border border-alert/30 bg-alert/5 p-3.5 text-left shadow-soft"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-alert/15 text-alert">
                  <Icon name="pulse" size={19} strokeWidth={2.3} />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-ink">Looks like you’re in a crisis</p>
                  <p className="text-[11px] text-ink/50">Top 5 panic items pre-staged · one tap</p>
                </div>
                <Icon name="chevron" size={18} className="ml-auto text-ink/30" />
              </div>
            </button>
          </PreStaged>
        )}

        {/* Pre-Crime rain push */}
        {rainIncoming && (
          <PreStaged
            active={rainIncoming}
            decay={45}
            onDissolve={(r) =>
              addLog("DRIFT", `Umbrella pre-stage dissolved — ${r} (rain forecast revised)`)
            }
          >
            <div className="rounded-2xl border border-sky/30 bg-sky/5 p-3.5 shadow-soft">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky/15 text-sky">
                  <Icon name="rain" size={19} strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-ink">Rain in ~45 min near you</p>
                  <p className="text-[11px] text-ink/50">
                    Umbrellas already moved to your dark-store counter
                  </p>
                </div>
              </div>
              {product("umbrella") && (
                <div className="flex items-center justify-between rounded-xl bg-white p-2">
                  <span className="text-[13px] font-semibold text-ink">
                    ☂️ Fendo Umbrella · {inr(399)}
                  </span>
                  <button
                    onClick={() => goCheckout("umbrella")}
                    className="rounded-lg bg-sky px-3 py-1.5 text-[12px] font-bold text-white"
                  >
                    Add
                  </button>
                </div>
              )}
              <WhyChip
                explanation="Triggered by the hyperlocal weather feed: >80% rain probability within 45 min at your pin. No purchase or location history was used."
                onMute={() => {
                  addLog("CONSENT", "User muted the ‘weather’ prediction signal → rain pushes suppressed for this session");
                  muteSignal("weather");
                  setFlag("rainIncoming", false);
                }}
              />
            </div>
          </PreStaged>
        )}

        {/* Focus bundle — schedule integration teaser, standing decay */}
        <PreStaged
          active={!focusMuted}
          decay={60}
          onDissolve={() => addLog("DRIFT", "Focus Bundle expired — contest window passed")}
        >
          <div className="rounded-2xl border border-warn/30 bg-warn/5 p-3.5 shadow-soft">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-warn/20 text-warn">
                <Icon name="clock" size={18} strokeWidth={2.3} />
              </span>
              <div>
                <p className="text-[13px] font-bold text-ink">Contest in 15 min — Focus Bundle</p>
                <p className="text-[11px] text-ink/50">From your CP tracker · one tap to stage</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {FOCUS_BUNDLE.map((id) => {
                const p = product(id)!;
                return (
                  <div
                    key={id}
                    className="flex flex-1 flex-col items-center rounded-xl bg-white py-2 text-center"
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <span className="mt-0.5 text-[10px] font-medium leading-tight text-ink/60">
                      {p.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                FOCUS_BUNDLE.forEach((id) => addToCart(id));
                addLog("PREDICT", "Focus Bundle staged → cart (energy + glucose + stationery)");
                pushToast({ kind: "info", title: "Focus Bundle ready", body: "3 items staged for your contest" });
                setScreen("checkout");
              }}
              className="mt-2 w-full rounded-xl bg-warn py-2 text-[12px] font-bold text-ink"
            >
              Stage all 3
            </button>
            <WhyChip
              explanation="Triggered by your linked competitive-programming calendar: a contest starts in ~15 min. Only the event time was read — not its contents."
              onMute={() => {
                addLog("CONSENT", "User muted the ‘schedule’ prediction signal → calendar-based staging suppressed");
                muteSignal("schedule");
                setFocusMuted(true);
              }}
            />
          </div>
        </PreStaged>
      </div>

      {/* late-night usual */}
      <SectionTitle icon="home">Your usual</SectionTitle>
      <div className="space-y-2">
        {LATE_NIGHT_USUAL.map((id) => {
          const p = product(id)!;
          return <ProductTile key={id} p={p} onAdd={() => addToCart(id)} />;
        })}
      </div>

      {/* browse */}
      <SectionTitle>Quick picks</SectionTitle>
      <div className="space-y-2">
        {CATALOG.slice(0, 6).map((p) => (
          <ProductTile key={p.id} p={p} onAdd={() => addToCart(p.id)} />
        ))}
      </div>
    </div>
  );
}
