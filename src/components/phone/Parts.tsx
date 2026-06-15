"use client";
import React from "react";
import { useBlink } from "@/lib/store";
import Icon from "../Icon";
import { Product } from "@/lib/types";
import { inr } from "@/lib/data";

export function AppHeader({ title, sub }: { title: string; sub?: string }) {
  const setScreen = useBlink((s) => s.setScreen);
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-mist bg-white/90 px-4 py-3 backdrop-blur">
      <button
        onClick={() => setScreen("home")}
        className="grid h-8 w-8 place-items-center rounded-full bg-mist text-ink/70 hover:bg-[#dde2ea]"
      >
        <Icon name="chevron" size={18} className="rotate-180" />
      </button>
      <div>
        <h1 className="text-[15px] font-bold leading-tight text-ink">{title}</h1>
        {sub && <p className="text-[11px] text-ink/50">{sub}</p>}
      </div>
    </div>
  );
}

export function SectionTitle({
  children,
  icon,
  accent = "text-ink",
}: {
  children: React.ReactNode;
  icon?: any;
  accent?: string;
}) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-1.5 px-1">
      {icon && (
        <span className={accent}>
          <Icon name={icon} size={15} strokeWidth={2.3} />
        </span>
      )}
      <h3 className="text-[12px] font-bold uppercase tracking-wide text-ink/50">{children}</h3>
    </div>
  );
}

export function ProductTile({ p, onAdd }: { p: Product; onAdd?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-mist bg-white p-2.5 shadow-soft">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cloud text-2xl">
        {p.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{p.name}</p>
        <p className="text-[12px] font-bold text-ink/80">{inr(p.price)}</p>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blink text-ink hover:bg-blinkdk"
        >
          <Icon name="plus" size={18} strokeWidth={2.6} />
        </button>
      )}
    </div>
  );
}

export function Money({ n, className = "" }: { n: number; className?: string }) {
  return <span className={className}>{inr(n)}</span>;
}
