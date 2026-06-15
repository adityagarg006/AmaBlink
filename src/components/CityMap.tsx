"use client";
import React, { useEffect, useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import { COURIERS, DARK_STORES, HOME_PIN, BUILDING } from "@/lib/data";
import Icon from "./Icon";

type P = { x: number; y: number };

export default function CityMap() {
  const { rainIncoming, courierInBuilding, mapEvent, addLog, crisisMesh, meshOrders } = useBlink();
  const [pos, setPos] = useState<Record<string, P>>(
    () => Object.fromEntries(COURIERS.map((c) => [c.id, { x: c.x, y: c.y }]))
  );
  const rainWas = useRef(false);

  useEffect(() => {
    if (rainIncoming && !rainWas.current) {
      addLog("MAP", "Pre-Crime: umbrella stock animating from warehouse shelf → dispatch counter (3 dark stores)");
    }
    rainWas.current = rainIncoming;
  }, [rainIncoming, addLog]);

  // Floating-node drift + Regret intercept + in-building parking
  useEffect(() => {
    const t = setInterval(() => {
      setPos((prev) => {
        const next: Record<string, P> = { ...prev };
        for (const c of COURIERS) {
          let { x, y } = next[c.id];
          if (mapEvent === "intercept" && c.id === "rider-04") {
            const tgt = next["rider-01"];
            x += (tgt.x - x) * 0.2;
            y += (tgt.y - y) * 0.2;
          } else if (courierInBuilding && c.id === "rider-01") {
            x += (HOME_PIN.x - x) * 0.25;
            y += (HOME_PIN.y - y) * 0.25;
          } else {
            x += (Math.random() - 0.5) * 3.2;
            y += (Math.random() - 0.5) * 3.2;
            x = Math.max(8, Math.min(92, x));
            y = Math.max(12, Math.min(88, y));
          }
          next[c.id] = { x, y };
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(t);
  }, [mapEvent, courierInBuilding]);

  const r1 = pos["rider-01"];
  const r4 = pos["rider-04"];

  return (
    <div className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-hair/70 bg-abyss">
      <div className="flex items-center justify-between px-3 pt-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cloud/50">
          <Icon name="map" size={13} strokeWidth={2.4} /> Live fleet · Indiranagar
        </span>
        <div className="flex gap-1">
          {rainIncoming && (
            <span className="rounded-full bg-sky/20 px-2 py-0.5 text-[9px] font-bold text-sky">PRE-CRIME</span>
          )}
          {mapEvent === "intercept" && (
            <span className="rounded-full bg-blink/20 px-2 py-0.5 text-[9px] font-bold text-blink">INTERCEPT</span>
          )}
          {courierInBuilding && (
            <span className="rounded-full bg-trust/20 px-2 py-0.5 text-[9px] font-bold text-trust">IN BUILDING</span>
          )}
          {crisisMesh && (
            <span className="rounded-full bg-warn/20 px-2 py-0.5 text-[9px] font-bold text-warn">CRISIS MESH</span>
          )}
        </div>
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="map-grid h-full w-full flex-1">
        {/* faint road lines */}
        <g stroke="#283543" strokeWidth="0.5" opacity="0.6">
          <line x1="0" y1="33" x2="100" y2="40" />
          <line x1="0" y1="66" x2="100" y2="60" />
          <line x1="34" y1="0" x2="40" y2="100" />
          <line x1="70" y1="0" x2="64" y2="100" />
        </g>

        {/* Regret-window intercept path */}
        {mapEvent === "intercept" && r1 && r4 && (
          <line
            x1={r4.x} y1={r4.y} x2={r1.x} y2={r1.y}
            stroke="#FF9900" strokeWidth="0.7" strokeDasharray="2 1.6"
            className="animate-dash-move" opacity="0.9"
          />
        )}

        {/* dark stores + Pre-Crime umbrellas */}
        {DARK_STORES.map((d) => (
          <g key={d.id}>
            <rect x={d.x - 2.4} y={d.y - 2.4} width="4.8" height="4.8" rx="1.1" fill="#1B2530" stroke="#3B9DFF" strokeWidth="0.5" />
            <text x={d.x} y={d.y + 0.9} textAnchor="middle" fontSize="2.4" fill="#3B9DFF">▣</text>
            <text x={d.x} y={d.y + 5.6} textAnchor="middle" fontSize="2.2" fill="#6b7a8d">{d.name.replace(" DS", "")}</text>
            {rainIncoming && (
              <g>
                <text fontSize="3.4" textAnchor="middle">
                  <animateMotion
                    dur="2.6s"
                    repeatCount="indefinite"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    calcMode="linear"
                    path={`M ${d.x} ${d.y} L ${d.x} ${d.y - 7}`}
                  />
                  ☂
                </text>
              </g>
            )}
          </g>
        ))}

        {/* home pin (you) */}
        <g>
          <circle cx={HOME_PIN.x} cy={HOME_PIN.y} r="4.4" fill="none" stroke="#15C39A" strokeWidth="0.5" className="animate-breathe" opacity="0.7" />
          <circle cx={HOME_PIN.x} cy={HOME_PIN.y} r="1.9" fill="#15C39A" />
          <text x={HOME_PIN.x} y={HOME_PIN.y - 5.4} textAnchor="middle" fontSize="2.3" fill="#15C39A" fontWeight="bold">You · 3F</text>
        </g>

        {/* Crisis Mesh: building-level group push + consolidation to nearest store */}
        {crisisMesh &&
          (() => {
            const store = DARK_STORES.find((d) => d.id === "ds-indiranagar") || DARK_STORES[0];
            const bx = HOME_PIN.x;
            const by = HOME_PIN.y;
            const cols = 4;
            const rows = 4;
            const gap = 2.0;
            const w = 1.35;
            const gridW = cols * gap;
            const gridH = rows * gap;
            const ox = bx - gridW / 2 + gap / 2;
            const oy = by - gridH / 2 + gap / 2;
            const windows = [];
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                const lit = idx < meshOrders;
                windows.push(
                  <rect
                    key={idx}
                    x={ox + c * gap - w / 2}
                    y={oy + r * gap - w / 2}
                    width={w}
                    height={w}
                    rx="0.3"
                    fill={lit ? "#FFB020" : "#283543"}
                    opacity={lit ? 0.95 : 0.6}
                  />
                );
              }
            }
            return (
              <g>
                <line
                  x1={bx}
                  y1={by}
                  x2={store.x}
                  y2={store.y}
                  stroke="#FFB020"
                  strokeWidth="0.6"
                  strokeDasharray="2 1.6"
                  className="animate-dash-move"
                  opacity="0.8"
                />
                <rect
                  x={bx - gridW / 2 - 0.8}
                  y={by - gridH / 2 - 0.8}
                  width={gridW + 1.6}
                  height={gridH + 1.6}
                  rx="0.8"
                  fill="#0B0F14"
                  stroke="#FFB020"
                  strokeWidth="0.4"
                  opacity="0.92"
                />
                {windows}
                <text x={bx} y={by + gridH / 2 + 4} textAnchor="middle" fontSize="2.2" fill="#FFB020" fontWeight="bold">
                  {meshOrders}/{BUILDING.flats} flats
                </text>
              </g>
            );
          })()}

        {/* couriers (Floating Nodes) */}
        {COURIERS.map((c) => {
          const p = pos[c.id];
          const inBldg = courierInBuilding && c.id === "rider-01";
          const isInt = mapEvent === "intercept" && c.id === "rider-04";
          const color = inBldg ? "#15C39A" : isInt ? "#FF9900" : "#E9ECF1";
          return (
            <g key={c.id} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: "transform 1.2s linear" }}>
              <circle r="2.2" fill={color} opacity="0.95" />
              <circle r="3.6" fill="none" stroke={color} strokeWidth="0.4" opacity="0.5" />
              <text x="0" y="-4.6" textAnchor="middle" fontSize="2.1" fill={color}>{c.label}</text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-3 px-3 pb-2 pt-1 text-[9px] text-cloud/40">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-sky/70" /> Dark store</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-cloud/70" /> Courier</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-trust" /> You</span>
      </div>
    </div>
  );
}
