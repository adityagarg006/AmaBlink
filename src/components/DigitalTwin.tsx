"use client";
import React, { useEffect, useState } from "react";
import { useBlink } from "@/lib/store";
import { inr } from "@/lib/data";
import { useGhostChannel } from "@/lib/useGhostChannel";
import PhoneApp from "./PhoneApp";
import SystemBrain from "./SystemBrain";
import DirectorConsole from "./DirectorConsole";
import CityMap from "./CityMap";

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-hair/70 bg-slab/60 px-3 py-1.5">
      <p className={`text-[15px] font-extrabold leading-none ${accent ?? "text-cloud"}`}>{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-wide text-cloud/40">{label}</p>
    </div>
  );
}

/* TTLA — Time-to-Leave-App. Ticks live while a decision is in flight, then
   freezes green when the order is placed. The headline speed number. */
function TtlaMetric() {
  const ttlaStart = useBlink((s) => s.ttlaStart);
  const ttlaFinal = useBlink((s) => s.ttlaFinal);
  const [, force] = useState(0);
  useEffect(() => {
    if (ttlaStart == null || ttlaFinal != null) return;
    const t = setInterval(() => force((n) => n + 1), 100);
    return () => clearInterval(t);
  }, [ttlaStart, ttlaFinal]);
  const value =
    ttlaFinal != null
      ? `${ttlaFinal.toFixed(1)}s`
      : ttlaStart != null
      ? `${((Date.now() - ttlaStart) / 1000).toFixed(1)}s`
      : "—";
  return <Metric label="TTLA" value={value} accent={ttlaFinal != null ? "text-trust" : "text-blink"} />;
}

function Header() {
  const { credits, dispatched, consolidated, failureMemory, liveSeen, crisisMesh, meshOrders } = useBlink();
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blink text-ink shadow-glow">
          <span className="text-xl font-black">b</span>
        </div>
        <div>
          <h1 className="flex items-center gap-2 text-[19px] font-black leading-none text-cloud">
            amazon <span className="text-blink">blink</span>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${liveSeen ? "bg-trust text-white" : "bg-slab text-cloud/50"}`}>
              {liveSeen ? "LIVE CLAUDE" : "DEMO MODE"}
            </span>
          </h1>
          <p className="mt-1 text-[11px] text-cloud/45">
            Digital Twin · urgent-commerce control room · Theme 2
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TtlaMetric />
        <Metric label="credits issued" value={inr(credits)} accent="text-blink" />
        <Metric label="dispatches" value={String(dispatched)} />
        <Metric label="runs merged" value={String(consolidated)} accent="text-sky" />
        <Metric label="stores avoided" value={String(failureMemory.length)} accent="text-trust" />
        {crisisMesh && <Metric label="homes served" value={String(meshOrders)} accent="text-warn" />}
      </div>
    </header>
  );
}

export default function DigitalTwin() {
  useGhostChannel();
  return (
    <div className="stage-bg min-h-screen w-full text-cloud">
      <div className="mx-auto flex max-w-[1540px] flex-col gap-3 p-3 lg:p-5">
        <Header />
        <DirectorConsole />
        <div className="grid gap-3 lg:grid-cols-[390px_minmax(0,1fr)]">
          <div className="flex justify-center lg:justify-start">
            <PhoneApp />
          </div>
          <div className="grid h-[812px] grid-rows-[minmax(220px,38%)_minmax(0,1fr)] gap-3 max-lg:h-auto max-lg:grid-rows-none">
            <CityMap />
            <div className="max-lg:h-[460px]">
              <SystemBrain />
            </div>
          </div>
        </div>
        <p className="px-1 text-center text-[10px] text-cloud/30">
          All backend services (inventory, stock confidence, weather, courier fleet) are mocked with India-context
          seed data. “Bedrock” calls a real Claude model when an API key is set, else a scripted demo fallback.
        </p>
      </div>
    </div>
  );
}
