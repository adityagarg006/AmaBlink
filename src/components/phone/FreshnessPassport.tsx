"use client";
import React, { useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import { bedrock } from "@/lib/bedrock";
import { AppHeader } from "./Parts";
import Icon from "../Icon";
import Button from "../ui/Button";
import { FreshnessResult } from "@/lib/types";

const SAMPLES = [
  { id: "eggs", label: "Egg tray", emoji: "🥚", file: "/samples/eggs.png", name: "Farm Eggs (tray of 12)" },
  { id: "tomatoes", label: "Tomatoes", emoji: "🍅", file: "/samples/tomatoes.png", name: "Tomatoes 500g" },
  { id: "milk", label: "Milk", emoji: "🥛", file: "/samples/milk.png", name: "Amul Taaza Milk 1L" },
];

async function urlToB64(url: string): Promise<string | undefined> {
  try {
    const r = await fetch(url);
    const b = await r.blob();
    return await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(",")[1]);
      fr.readAsDataURL(b);
    });
  } catch {
    return undefined;
  }
}

export default function FreshnessPassport() {
  const { addLog, addItem, setScreen, pushToast } = useBlink();
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<FreshnessResult[] | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [src, setSrc] = useState<"live" | "demo" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function scan(opts: { sampleId?: string; itemName?: string; b64?: string; mediaType?: string; preview?: string }) {
    setScanning(true);
    setResults(null);
    setPreview(opts.preview || null);
    addLog("FRESHNESS", `Pack-time scan started → ${opts.itemName || "perishable"}`);
    const r = await bedrock({
      action: "freshness",
      sampleId: opts.sampleId,
      itemName: opts.itemName,
      imageBase64: opts.b64,
      mediaType: opts.mediaType,
    });
    setSrc(r.source);
    setResults(r.results);
    setScanning(false);
    (r.results as FreshnessResult[]).forEach((res) => {
      if (res.verdict === "flag") {
        addLog(
          "FRESHNESS",
          `${res.item} flagged (score ${res.score}) → substituting ${res.substitute?.name}`
        );
      } else {
        addLog("FRESHNESS", `${res.item} cleared (score ${res.score}) → dispatch ok`);
      }
    });
  }

  async function useSample(s: (typeof SAMPLES)[number]) {
    const b64 = await urlToB64(s.file);
    scan({ sampleId: s.id, itemName: s.name, b64, mediaType: "image/png", preview: s.file });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const d = String(fr.result);
      scan({ b64: d.split(",")[1], mediaType: f.type, preview: d, itemName: "uploaded perishable" });
    };
    fr.readAsDataURL(f);
  }

  return (
    <div>
      <AppHeader title="Freshness Passport" sub="The quality gate before it leaves the store" />
      <div className="px-4 py-4">
        <div className="rounded-2xl border border-trust/30 bg-trust/5 p-3">
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-trustdk">
            <Icon name="leaf" size={15} /> Every perishable is scanned at pack-time
          </p>
          <p className="mt-0.5 text-[11px] text-ink/55">
            Spoiled items are caught and swapped <b>before dispatch</b> — never discovered after delivery.
          </p>
        </div>

        {!results && !scanning && (
          <>
            <p className="mb-2 mt-4 px-1 text-[12px] font-bold uppercase tracking-wide text-ink/50">
              Scan a pack-time photo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => useSample(s)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-mist bg-white py-4 shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-[11px] font-semibold text-ink">{s.label}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" className="mt-3" onClick={() => fileRef.current?.click()}>
              <Icon name="arrow" size={16} className="-rotate-90" /> Upload your own
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          </>
        )}

        {scanning && (
          <div className="mt-4">
            {preview && <img src={preview} className="h-40 w-full rounded-2xl object-cover" alt="perishable" />}
            <div className="mt-4 flex items-center justify-center gap-2 text-trustdk">
              <Icon name="leaf" size={18} className="animate-spinslow" />
              <span className="text-[13px] font-semibold">Scanning shell, bruising, seal…</span>
            </div>
          </div>
        )}

        {results &&
          results.map((res, i) => (
            <div key={i} className="mt-4 animate-slide-up">
              {preview && (
                <img src={preview} className="mb-3 h-28 w-full rounded-2xl object-cover" alt="scanned" />
              )}
              <div
                className={`flex items-center justify-between rounded-2xl border p-3 ${
                  res.verdict === "flag"
                    ? "border-alert/30 bg-alert/5"
                    : "border-trust/30 bg-trust/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{res.emoji}</span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">{res.item}</p>
                    <p className="text-[11px] text-ink/55">{res.note}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-full text-[14px] font-extrabold ${
                      res.verdict === "flag" ? "bg-alert/15 text-alert" : "bg-trust/15 text-trustdk"
                    }`}
                  >
                    {res.score}
                  </div>
                  <p className="mt-0.5 text-[9px] font-bold uppercase text-ink/40">freshness</p>
                </div>
              </div>

              {res.verdict === "flag" && res.substitute && (
                <div className="mt-2 rounded-2xl border border-trust/30 bg-white p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-trustdk">
                    <Icon name="shield" size={14} /> Auto-substituted before dispatch
                  </p>
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className="flex-1 rounded-lg bg-alert/5 p-2 text-ink/50 line-through">
                      {res.emoji} {res.item} · {res.score}
                    </span>
                    <Icon name="arrow" size={18} className="text-trust" />
                    <span className="flex-1 rounded-lg bg-trust/10 p-2 font-semibold text-trustdk">
                      {res.substitute.emoji} {res.substitute.name} · {res.substitute.score}
                    </span>
                  </div>
                  <Button
                    variant="trust"
                    className="mt-3"
                    onClick={() => {
                      addItem({
                        id: `fresh-${i}`,
                        name: res.substitute!.name,
                        price: 89,
                        emoji: res.substitute!.emoji,
                        category: "Verified fresh",
                        stockCheckedSecAgo: 60,
                        pickerRating: 4.9,
                        freshnessChecked: true,
                      });
                      pushToast({
                        kind: "trust",
                        title: "Verified-fresh item added",
                        body: "Swapped before it could reach your door",
                      });
                      setScreen("checkout");
                    }}
                  >
                    <Icon name="check" size={18} /> Add the verified one
                  </Button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                    src === "live" ? "bg-trust/15 text-trustdk" : "bg-mist text-ink/50"
                  }`}
                >
                  {src === "live" ? "LIVE CLAUDE VISION" : "DEMO"}
                </span>
                <button
                  onClick={() => setResults(null)}
                  className="text-[12px] font-medium text-ink/40"
                >
                  Scan another
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
