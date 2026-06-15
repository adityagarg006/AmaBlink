"use client";
import React, { useEffect, useState } from "react";
import { useBlink } from "@/lib/store";
import { inr, product } from "@/lib/data";
import Icon from "../Icon";
import Button from "../ui/Button";
import { AppHeader } from "./Parts";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function GhostCart() {
  const { ghostIncoming, setGhostIncoming, courierInBuilding, addItem, addLog, pushToast, bumpConsolidated } =
    useBlink();

  // effective mode: a courier physically in the building always wins
  const mode = courierInBuilding ? "in-building" : ghostIncoming?.mode ?? "countdown";
  const baseWindow = mode === "in-building" ? 0 : mode === "extended" ? 120 : 45;
  const [left, setLeft] = useState(baseWindow);

  useEffect(() => {
    setLeft(baseWindow);
  }, [ghostIncoming, baseWindow]);

  useEffect(() => {
    if (!ghostIncoming || mode === "in-building") return;
    if (left <= 0) {
      addLog("GHOST", "Consolidation window closed — run dispatched without this tenant");
      setGhostIncoming(null);
      return;
    }
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [ghostIncoming, left, mode, addLog, setGhostIncoming]);

  const items = (ghostIncoming?.items ?? []).map((id) => product(id)).filter(Boolean) as ReturnType<typeof product>[];

  function join() {
    items.forEach((p) => p && addItem(p));
    bumpConsolidated();
    addLog(
      "GHOST",
      mode === "in-building"
        ? "Tapped in — item handed to the courier already on your floor (0 extra trips)"
        : "Joined the consolidated run → folded into Rider_01’s bag, one delivery for the cluster"
    );
    pushToast({
      kind: "trust",
      title: "Added to your neighbour’s run",
      body: "One courier, one trip — your item rides along.",
    });
    setGhostIncoming(null);
  }

  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="Nearby runs" sub="Ghost-Carting · dynamic demand clustering" />
      <div className="px-4 pb-8">
        {!ghostIncoming ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-mist text-ink/40">
              <Icon name="ghost" size={30} />
            </div>
            <p className="text-sm font-semibold text-ink">No active run on your floor</p>
            <p className="px-6 text-[12px] text-ink/50">
              When a neighbour places an urgent order, a shared window opens here. The window length adapts to how
              many correlated orders land — and collapses to “tap now” when a courier is already in your building.
            </p>
            <div className="mt-2 rounded-xl border border-dashed border-mist bg-white px-4 py-3 text-[11px] text-ink/55">
              Demo: place an order in a second tab, or use the Director’s Console → <b>Ghost opportunity</b>.
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div
              className={`rounded-2xl border p-4 shadow-soft ${
                mode === "in-building" ? "border-trust/40 bg-trust/10" : "border-blink/30 bg-blink/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-white ${
                    mode === "in-building" ? "bg-trust" : "bg-blink"
                  }`}
                >
                  <Icon name={mode === "in-building" ? "pin" : "ghost"} size={18} strokeWidth={2.4} />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-ink">
                    {mode === "in-building"
                      ? "Courier already in your hallway"
                      : mode === "extended"
                      ? "Busy floor — window extended"
                      : "Neighbour just ordered"}
                  </p>
                  <p className="text-[11px] text-ink/55">from {ghostIncoming.from}</p>
                </div>
                {mode !== "in-building" && (
                  <span className="ml-auto font-mono text-lg font-extrabold text-blinkdk">{fmt(Math.max(0, left))}</span>
                )}
              </div>

              <p className="mt-2 text-[12px] text-ink/70">
                {mode === "in-building"
                  ? "Rider_01 is on your floor right now. Anything you add ships on this trip — no countdown, no second run."
                  : mode === "extended"
                  ? "3 correlated orders landed on your floor in 10 minutes, so the consolidation window stretched to 2 minutes. The window length is the routing intelligence."
                  : "A shared delivery window is open for 45 seconds. Add anything and it rides the same courier."}
              </p>

              {items.length > 0 && (
                <div className="mt-3 rounded-xl bg-white/70 p-2.5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink/40">On this run</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((p) => (
                      <span key={p!.id} className="inline-flex items-center gap-1 rounded-lg bg-cloud px-2 py-1 text-[11px] font-medium text-ink">
                        <span>{p!.emoji}</span> {p!.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant={mode === "in-building" ? "trust" : "primary"}
                size="lg"
                className="mt-4"
                onClick={join}
              >
                {mode === "in-building" ? "Tap now — add to his bag" : "Join this run"}
              </Button>
            </div>

            <p className="mt-3 px-1 text-[11px] text-ink/45">
              Adjacent tenants are clustered by floor (DBSCAN in production). Sharing a run cuts courier trips and
              gets your item there faster.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
