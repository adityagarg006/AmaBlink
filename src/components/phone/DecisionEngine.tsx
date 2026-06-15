"use client";
import React, { useEffect, useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import { bedrock } from "@/lib/bedrock";
import { AMBIENT, ENGINE_EXAMPLES, inr, product } from "@/lib/data";
import { DecisionPackage, PackageLine } from "@/lib/types";
import { AppHeader } from "./Parts";
import Icon from "../Icon";
import Button from "../ui/Button";

const SAMPLES = [
  { hint: "burst-pipe", label: "Burst pipe", emoji: "🚰", file: "/samples/burst-pipe.png" },
  { hint: "blown-fuse", label: "Blown fuse", emoji: "⚡", file: "/samples/blown-fuse.png" },
  { hint: "gas-leak", label: "Gas smell", emoji: "🔥", file: "/samples/gas-leak.png" },
];

async function urlToB64(url: string): Promise<string> {
  const r = await fetch(url);
  const b = await r.blob();
  return new Promise((res) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(",")[1]);
    fr.readAsDataURL(b);
  });
}

export default function DecisionEngine() {
  const { addLog, addToCart, setScreen, startTTLA, markLive } = useBlink();
  const [mode, setMode] = useState<"describe" | "camera">("describe");
  const [query, setQuery] = useState("");
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState<DecisionPackage | null>(null);
  const [replay, setReplay] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);

  // TTLA spans the real decide→buy journey: start the clock on entry.
  useEffect(() => {
    startTTLA();
  }, [startTTLA]);

  function reset() {
    setPkg(null);
    setImg(null);
    setReplay(false);
  }

  async function solve(opts: { query?: string; imageBase64?: string; mediaType?: string; scenarioHint?: string; preview?: string }) {
    setLoading(true);
    setPkg(null);
    setImg(opts.preview || null);
    addLog("ENGINE", opts.imageBase64 ? "Bedrock vision: reading the scene…" : `Bedrock: parsing situation → "${opts.query}"`);
    const r = await bedrock({
      action: "solve",
      query: opts.query,
      imageBase64: opts.imageBase64,
      mediaType: opts.mediaType,
      scenarioHint: opts.scenarioHint,
    });
    const p: DecisionPackage = { diagnosis: r.diagnosis, triage: r.triage || [], lines: r.lines || [], source: r.source };
    setPkg(p);
    setLoading(false);
    if (p.source === "live") markLive();

    const deps = p.lines.filter((l) => l.kind === "dependency");
    const locks = p.lines.filter((l) => l.neverSwap);
    addLog("ENGINE", `Assembled a complete ${p.lines.length}-item package — "${p.diagnosis}" (${p.source === "live" ? "live model" : "demo"})`);
    deps.forEach((d) =>
      addLog("GUARD", `Dependency Guardrail: added ${d.name} — ${d.forItem || "a chosen item"} can't work without it`)
    );
    if (locks.length)
      addLog("SHIELD", `${locks.map((l) => l.name).join(", ")} locked NEVER_SWAP — protected from any auto-substitution`);
  }

  function loadAmbient(key: string) {
    const a = AMBIENT[key];
    if (!a) return;
    const lines: PackageLine[] = a.skus
      .map((id) => product(id))
      .filter(Boolean)
      .map((p) => ({ sku_id: p!.id, name: p!.name, emoji: p!.emoji, price: p!.price, reason: "pre-staged for your context", kind: "primary" as const, neverSwap: !!p!.neverSwap }));
    setImg(null);
    setReplay(false);
    setPkg({ diagnosis: a.label, triage: [a.note], lines, source: "demo" });
    addLog("PREDICT", `Ambient trigger: ${a.label.toLowerCase()} → ${lines.length} SKUs pre-staged before any input`);
  }

  async function useSample(s: (typeof SAMPLES)[number]) {
    let b64: string | undefined;
    try {
      b64 = await urlToB64(s.file);
    } catch {
      /* demo still works via hint */
    }
    solve({ imageBase64: b64, mediaType: "image/png", scenarioHint: s.hint, preview: s.file, query: "" });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = String(fr.result);
      solve({ imageBase64: dataUrl.split(",")[1], mediaType: f.type || "image/jpeg", preview: dataUrl, query: "" });
    };
    fr.readAsDataURL(f);
  }

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCamOn(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      addLog("SYSTEM", "Camera unavailable — use a sample or upload instead");
    }
  }
  function capture() {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.8);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCamOn(false);
    solve({ imageBase64: dataUrl.split(",")[1], mediaType: "image/jpeg", preview: dataUrl, query: "" });
  }

  function commit() {
    if (!pkg) return;
    setScanning(true);
    addLog("ENGINE", "Biometric requested → WebAuthn fingerprint");
    setTimeout(() => {
      pkg.lines.forEach((l) => addToCart(l.sku_id));
      addLog("ENGINE", `Package committed → cart in one decision (${pkg.lines.length} items, zero searches)`);
      setScanning(false);
      setScreen("checkout");
    }, 850);
  }

  const total = pkg ? pkg.lines.reduce((a, l) => a + l.price, 0) : 0;
  const primary = pkg?.lines.filter((l) => l.kind === "primary") || [];
  const deps = pkg?.lines.filter((l) => l.kind === "dependency") || [];
  // "what a normal search would've returned" = just the single most obvious item.
  const searchWouldFind = primary.slice(0, 1);
  const blinkExtra = pkg ? pkg.lines.length - searchWouldFind.length : 0;

  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="Blink it" sub="Describe it · we decide · you don't search" />
      <div className="px-4 pb-8 pt-3">
        {!pkg && !loading && (
          <>
            {/* ambient: a package is already waiting for the open-app context */}
            <p className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">
              Already staged for your context
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(AMBIENT).map(([k, a]) => (
                <button
                  key={k}
                  onClick={() => loadAmbient(k)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-mist bg-white py-2.5 shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="text-xl">{a.emoji}</span>
                  <span className="text-[10px] font-semibold capitalize text-ink">{k}</span>
                </button>
              ))}
            </div>

            {/* mode switch */}
            <div className="mt-4 flex gap-1 rounded-xl bg-mist p-1">
              <button
                onClick={() => setMode("describe")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold ${mode === "describe" ? "bg-white text-ink shadow-soft" : "text-ink/50"}`}
              >
                <Icon name="mic" size={15} /> Describe
              </button>
              <button
                onClick={() => setMode("camera")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-bold ${mode === "camera" ? "bg-white text-ink shadow-soft" : "text-ink/50"}`}
              >
                <Icon name="camera" size={15} /> Camera
              </button>
            </div>

            {mode === "describe" ? (
              <div className="mt-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What's happening? e.g. my kid has a fever and we're out of everything"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-mist bg-white p-3 text-[13px] text-ink shadow-soft outline-none placeholder:text-ink/35 focus:border-blink"
                />
                <Button size="lg" className="mt-2" disabled={!query.trim()} onClick={() => solve({ query })}>
                  <Icon name="bolt" size={18} /> Solve it
                </Button>
                <p className="mb-1.5 mt-4 px-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">Try one</p>
                <div className="space-y-1.5">
                  {ENGINE_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => {
                        setQuery(ex);
                        solve({ query: ex });
                      }}
                      className="flex w-full items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2 text-left text-[12px] text-ink/70 shadow-soft hover:border-blink/40"
                    >
                      <Icon name="chevron" size={14} className="text-blinkdk" /> {ex}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3">
                {camOn ? (
                  <div>
                    <div className="overflow-hidden rounded-2xl bg-black">
                      <video ref={videoRef} className="h-52 w-full object-cover" muted playsInline />
                    </div>
                    <Button size="lg" className="mt-2" onClick={capture}>
                      <Icon name="camera" size={18} /> Capture & solve
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="dark" size="sm" onClick={startCam} className="flex-col !py-3">
                        <Icon name="camera" size={18} /> Live cam
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="flex-col !py-3">
                        <Icon name="arrow" size={18} className="-rotate-90" /> Upload photo
                      </Button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                    <p className="mb-1.5 mt-4 px-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">Or a sample</p>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLES.map((s) => (
                        <button
                          key={s.hint}
                          onClick={() => useSample(s)}
                          className="flex flex-col items-center gap-1 rounded-2xl border border-mist bg-white py-3 shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
                        >
                          <span className="text-2xl">{s.emoji}</span>
                          <span className="text-[11px] font-semibold text-ink">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="mt-6">
            {img && <img src={img} className="h-40 w-full rounded-2xl object-cover" alt="scene" />}
            <div className="mt-5 flex items-center justify-center gap-2 text-blinkdk">
              <Icon name="cpu" size={18} className="animate-spinslow" />
              <span className="text-[13px] font-semibold">Assembling your complete package…</span>
            </div>
          </div>
        )}

        {pkg && (
          <div className="animate-slide-up">
            {img && <img src={img} className="mb-3 h-28 w-full rounded-2xl object-cover" alt="scene" />}

            {/* diagnosis */}
            <div className="rounded-2xl border border-blink/30 bg-blink/5 p-3.5">
              <div className="flex items-start gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blink/20 text-blinkdk">
                  <Icon name="cpu" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold leading-snug text-ink">{pkg.diagnosis}</p>
                </div>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${pkg.source === "live" ? "bg-trust/15 text-trustdk" : "bg-mist text-ink/50"}`}>
                  {pkg.source === "live" ? "LIVE CLAUDE" : "DEMO"}
                </span>
              </div>
            </div>

            {/* triage */}
            {pkg.triage.length > 0 && (
              <ol className="mt-3 space-y-1.5">
                {pkg.triage.map((st, i) => (
                  <li key={i} className="flex gap-2.5 rounded-xl border border-mist bg-white p-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                    <span className="text-[12px] leading-snug text-ink/80">{st}</span>
                  </li>
                ))}
              </ol>
            )}

            {/* primary items */}
            {primary.length > 0 && (
              <>
                <p className="mb-1.5 mt-4 px-1 text-[11px] font-bold uppercase tracking-wide text-ink/45">The package</p>
                <div className="space-y-1.5">
                  {primary.map((l) => (
                    <Line key={l.sku_id} l={l} />
                  ))}
                </div>
              </>
            )}

            {/* dependency guardrail — the part a search/recommender misses */}
            {deps.length > 0 && (
              <>
                <p className="mb-1.5 mt-4 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-blinkdk">
                  <Icon name="link" size={13} strokeWidth={2.4} /> Added so it actually works
                </p>
                <div className="space-y-1.5">
                  {deps.map((l) => (
                    <Line key={l.sku_id} l={l} dependency />
                  ))}
                </div>
              </>
            )}

            {/* Decision Replay — dramatises the whole thesis */}
            <button
              onClick={() => setReplay((v) => !v)}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-ink/15 bg-ink/[0.03] px-3 py-2.5 text-left"
            >
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
                <Icon name="eye" size={14} strokeWidth={2.3} /> Decision Replay
              </span>
              <span className="text-[11px] font-semibold text-blinkdk">{replay ? "hide" : "what a search would've missed"}</span>
            </button>
            {replay && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-mist bg-white p-2.5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink/40">Normal search</p>
                  {searchWouldFind.map((l) => (
                    <p key={l.sku_id} className="text-[12px] text-ink/70">{l.emoji} {l.name}</p>
                  ))}
                  <p className="mt-1 text-[10px] text-alert">…and you'd discover the rest too late.</p>
                </div>
                <div className="rounded-xl border border-trust/30 bg-trust/5 p-2.5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-trustdk">Blink decided</p>
                  <p className="text-[12px] font-semibold text-ink">All {pkg.lines.length} items, complete</p>
                  <p className="mt-1 text-[10px] text-trustdk">+{blinkExtra} you would've forgotten, in one tap.</p>
                </div>
              </div>
            )}

            {/* commit — biometric */}
            <div className="mt-4 rounded-2xl border border-mist bg-white p-3 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-ink/60">Complete package</span>
                <span className="text-base font-extrabold text-ink">{inr(total)}</span>
              </div>
              <button
                onClick={commit}
                disabled={scanning || pkg.lines.length === 0}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blink py-3 text-[15px] font-bold text-ink transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Icon name="fingerprint" size={20} className={scanning ? "animate-pulsedot" : ""} />
                {scanning ? "Hold to confirm…" : "Buy now · one fingerprint"}
              </button>
              <p className="mt-1.5 text-center text-[10px] text-ink/45">
                Payment authorises in the background — you won't wait for it.
              </p>
            </div>

            <button onClick={reset} className="mt-2 w-full text-center text-[12px] font-medium text-ink/40">
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ l, dependency }: { l: PackageLine; dependency?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${dependency ? "border-blink/25 bg-blink/[0.04]" : "border-mist bg-white"}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cloud text-lg">{l.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-ink">
          {l.name}
          {l.neverSwap && (
            <span className="inline-flex items-center gap-0.5 rounded bg-alert/10 px-1 py-0.5 text-[9px] font-bold text-alert">
              <Icon name="lock" size={9} strokeWidth={2.6} /> NO-SWAP
            </span>
          )}
        </p>
        <p className="truncate text-[10px] text-ink/50">
          {dependency && l.forItem ? `${l.forItem} needs it · ` : ""}
          {l.reason}
        </p>
      </div>
      <span className="shrink-0 text-[12px] font-bold text-ink/80">{inr(l.price)}</span>
    </div>
  );
}
