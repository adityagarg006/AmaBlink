"use client";
import React, { useEffect, useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import { inr, product } from "@/lib/data";
import Icon from "../Icon";
import Button from "../ui/Button";
import { AppHeader } from "./Parts";

export default function DeadZone() {
  const { networkDown, setFlag, addLog, pushToast } = useBlink();
  const [queued, setQueued] = useState(false);
  const [merged, setMerged] = useState(false);
  const [taps, setTaps] = useState(0);
  const opId = useRef<string | null>(null);

  const demo = product("paracetamol")!; // a believable urgent order

  // When the network returns and we have a pending op, merge it once.
  useEffect(() => {
    if (!networkDown && queued && !merged) {
      addLog("CRDT", `Signal restored → edge replica syncs op ${opId.current} with cluster`);
      const t = setTimeout(() => {
        setMerged(true);
        addLog("CRDT", "LWW-Element-Set merge complete → 1 clean order, no duplicate billing");
        pushToast({ kind: "trust", title: "Order merged cleanly", body: "Confirmed once — no duplicate despite the dead zone." });
      }, 700);
      return () => clearTimeout(t);
    }
  }, [networkDown, queued, merged, addLog, pushToast]);

  function tapBuy() {
    setTaps((t) => t + 1);
    if (networkDown) {
      if (!queued) {
        opId.current = "op-" + Math.random().toString(36).slice(2, 7);
        setQueued(true);
        addLog("CRDT", `Offline: checkout op ${opId.current} committed to local edge cache (idempotent)`);
      } else {
        addLog("CRDT", `Duplicate tap ignored — same op id ${opId.current}, set is commutative`);
      }
    } else {
      setMerged(true);
      opId.current = "op-" + Math.random().toString(36).slice(2, 7);
      addLog("DISPATCH", "Online order committed directly");
    }
  }

  function reset() {
    setQueued(false);
    setMerged(false);
    setTaps(0);
    opId.current = null;
  }

  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="Dead-zone checkout" sub="Elevator / stairwell · offline-safe" />
      <div className="px-4 pb-8">
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-mist bg-white p-3 shadow-soft">
          <div className="flex items-center gap-2 text-[13px]">
            <span className={networkDown ? "text-alert" : "text-trustdk"}>
              <Icon name={networkDown ? "wifioff" : "pulse"} size={18} strokeWidth={2.3} />
            </span>
            <span className="font-semibold text-ink">{networkDown ? "No network (dead zone)" : "Network online"}</span>
          </div>
          <button
            onClick={() => setFlag("networkDown", !networkDown)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
              networkDown ? "bg-alert/15 text-alert" : "bg-trust/15 text-trustdk"
            }`}
          >
            {networkDown ? "Restore signal" : "Kill network"}
          </button>
        </div>

        {/* the order */}
        <div className="mt-3 rounded-2xl border border-mist bg-white p-3 shadow-soft">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink/40">Urgent order</p>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-cloud text-2xl">{demo.emoji}</div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink">{demo.name}</p>
              <p className="text-[12px] font-bold text-ink/80">{inr(demo.price)}</p>
            </div>
          </div>
        </div>

        {/* status */}
        <div className="mt-3">
          {merged ? (
            <div className="rounded-2xl border border-trust/30 bg-trust/10 p-4 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-trust text-white">
                <Icon name="check" size={24} strokeWidth={2.6} />
              </span>
              <p className="mt-2 text-[14px] font-bold text-ink">1 clean order</p>
              <p className="text-[11px] text-ink/55">
                You tapped {taps} time{taps === 1 ? "" : "s"} {taps > 1 ? "(some while offline) " : ""}— billed once.
              </p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={reset}>Run again</Button>
            </div>
          ) : queued ? (
            <div className="rounded-2xl border border-warn/40 bg-warn/10 p-4">
              <div className="flex items-center gap-2">
                <span className="text-warn"><Icon name="clock" size={18} strokeWidth={2.3} /></span>
                <p className="text-[13px] font-bold text-ink">Queued locally · {taps} tap{taps === 1 ? "" : "s"}</p>
              </div>
              <p className="mt-1 text-[12px] text-ink/65">
                Your swipe committed to the on-device edge cache. It will merge the moment signal returns — no
                duplicate, no app freeze. Restore the network to watch it sync.
              </p>
            </div>
          ) : (
            <p className="px-1 text-center text-[12px] text-ink/55">
              Kill the network, then place the order. It commits offline and merges cleanly on reconnect.
            </p>
          )}
        </div>

        {!merged && (
          <Button variant="primary" size="lg" className="mt-4" onClick={tapBuy}>
            {networkDown ? "Confirm (offline)" : "Place urgent order"}
          </Button>
        )}
      </div>
    </div>
  );
}
