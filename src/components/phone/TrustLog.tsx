"use client";
import React from "react";
import { useBlink } from "@/lib/store";
import { inr } from "@/lib/data";
import Icon from "../Icon";
import { AppHeader } from "./Parts";

export default function TrustLog() {
  const { credits, cart, failureMemory, consolidated } = useBlink();
  const subs = cart.filter((c) => c.substitutedFrom);
  const empty = credits === 0 && subs.length === 0 && failureMemory.length === 0;

  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="Trust receipts" sub="Everything we caught before you did" />
      <div className="px-4 pb-8">
        {/* summary */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-mist bg-white p-3 text-center shadow-soft">
            <p className="text-lg font-extrabold text-trustdk">{inr(credits)}</p>
            <p className="text-[10px] text-ink/50">credits issued</p>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-3 text-center shadow-soft">
            <p className="text-lg font-extrabold text-ink">{subs.length}</p>
            <p className="text-[10px] text-ink/50">auto-swaps</p>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-3 text-center shadow-soft">
            <p className="text-lg font-extrabold text-ink">{failureMemory.length}</p>
            <p className="text-[10px] text-ink/50">stores avoided</p>
          </div>
        </div>

        {empty ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-trust/10 text-trustdk">
              <Icon name="receipt" size={28} strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold text-ink">Nothing to fix — yet</p>
            <p className="px-6 text-[12px] text-ink/50">
              When the system swaps a low-confidence item, issues a pre-emptive credit, or learns to avoid a dark
              store for you, it shows up here. Trust shown, not told.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {credits > 0 && (
              <div className="rounded-2xl border border-trust/30 bg-trust/10 p-3">
                <div className="flex items-center gap-2">
                  <Icon name="sparkles" size={16} className="text-trustdk" strokeWidth={2.4} />
                  <p className="text-[13px] font-bold text-ink">Apology credit · {inr(credits)}</p>
                </div>
                <p className="mt-1 text-[11px] text-ink/60">
                  Issued before you noticed a problem. The Apology Engine compensates pre-emptively, not after a
                  complaint.
                </p>
              </div>
            )}

            {subs.map((c) => (
              <div key={c.id} className="rounded-2xl border border-mist bg-white p-3 shadow-soft">
                <div className="flex items-center gap-2">
                  <Icon name="shield" size={16} className="text-trustdk" strokeWidth={2.4} />
                  <p className="text-[13px] font-bold text-ink">Protected swap</p>
                </div>
                <p className="mt-1 text-[12px] text-ink/70">
                  <span className="line-through text-ink/40">{c.substitutedFrom}</span> → <b>{c.name}</b>
                </p>
                {c.reason && <p className="mt-0.5 text-[11px] text-ink/50">{c.reason} — never cancelled.</p>}
              </div>
            ))}

            {failureMemory.map((f, i) => (
              <div key={i} className="rounded-2xl border border-mist bg-white p-3 shadow-soft">
                <div className="flex items-center gap-2">
                  <Icon name="map" size={16} className="text-trustdk" strokeWidth={2.4} />
                  <p className="text-[13px] font-bold text-ink">Routing memory</p>
                </div>
                <p className="mt-1 text-[12px] text-ink/70">
                  Avoiding <b>{f.store}</b> for <b>{f.sku}</b> on your urgent orders.
                </p>
                <p className="mt-0.5 text-[11px] text-ink/50">{f.note}</p>
              </div>
            ))}
          </div>
        )}

        {consolidated > 0 && (
          <p className="mt-4 text-center text-[11px] text-ink/45">
            {consolidated} delivery{consolidated === 1 ? "" : " runs"} consolidated with neighbours this session.
          </p>
        )}
      </div>
    </div>
  );
}
