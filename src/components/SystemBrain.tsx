"use client";
import React, { useEffect, useRef } from "react";
import { useBlink } from "@/lib/store";
import { LogTag } from "@/lib/types";
import Icon from "./Icon";

const TAG_COLOR: Record<LogTag, string> = {
  BEDROCK: "text-blink",
  DISPATCH: "text-blink",
  APOLOGY: "text-blink",
  FRESHNESS: "text-trust",
  CONFIDENCE: "text-trust",
  SHIELD: "text-trust",
  ESCALATE: "text-trust",
  GHOST: "text-sky",
  MAP: "text-sky",
  CRDT: "text-sky",
  PREDICT: "text-warn",
  DRIFT: "text-warn",
  MEMORY: "text-warn",
  BATTERY: "text-warn",
  HEARTBEAT: "text-alert",
  SYSTEM: "text-slate-400",
};

function clock(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function SystemBrain() {
  const log = useBlink((s) => s.log);
  const clearLog = useBlink((s) => s.clearLog);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-hair bg-abyss/80">
      <div className="flex items-center justify-between border-b border-hair px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-trust opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-trust" />
          </span>
          <h2 className="font-mono text-[13px] font-semibold tracking-wide text-slate-200">
            SYSTEM BRAIN
          </h2>
          <span className="rounded-md bg-slab px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            live decision feed
          </span>
        </div>
        <button
          onClick={clearLog}
          className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] text-slate-500 hover:bg-slab hover:text-slate-300"
        >
          <Icon name="refresh" size={12} /> clear
        </button>
      </div>

      <div className="scroll-slim flex-1 overflow-y-auto px-3 py-3 font-mono text-[12px] leading-relaxed">
        {log.map((e) => (
          <div key={e.id} className="animate-log-in flex gap-2 py-[3px]">
            <span className="shrink-0 text-slate-600">{clock(e.ts)}</span>
            <span className={`shrink-0 font-semibold ${TAG_COLOR[e.tag]}`}>[{e.tag}]</span>
            <span className="text-slate-300">{e.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-hair px-4 py-2 font-mono text-[10px] text-slate-600">
        all backend services simulated · India seed · Bedrock = Claude (live when key set)
      </div>
    </div>
  );
}
