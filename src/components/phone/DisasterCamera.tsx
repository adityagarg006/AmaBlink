"use client";
import React, { useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import { bedrock } from "@/lib/bedrock";
import { AppHeader } from "./Parts";
import Icon from "../Icon";
import Button from "../ui/Button";
import { TriagePlan } from "@/lib/types";
import { inr } from "@/lib/data";

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

export default function DisasterCamera() {
  const { addLog, addItem, setScreen } = useBlink();
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TriagePlan | null>(null);
  const [src, setSrc] = useState<"live" | "demo" | null>(null);
  const [answered, setAnswered] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setImg(null);
    setPlan(null);
    setSrc(null);
    setAnswered(false);
  };

  async function analyze(opts: { imageBase64?: string; mediaType?: string; scenarioHint?: string; preview?: string }) {
    setImg(opts.preview || null);
    setLoading(true);
    setPlan(null);
    addLog("BEDROCK", "Disaster Camera frame received → vision analysis…");
    const r = await bedrock({
      action: "disaster",
      imageBase64: opts.imageBase64,
      mediaType: opts.mediaType,
      scenarioHint: opts.scenarioHint,
    });
    setSrc(r.source);
    setPlan(r.plan);
    setLoading(false);
    addLog(
      "BEDROCK",
      `Disaster radius: ${r.plan.title} → bundling ${r.plan.items.length} items + triage plan${
        r.source === "live" ? " (live Claude)" : ""
      }`
    );
  }

  async function useSample(s: (typeof SAMPLES)[number]) {
    let b64: string | undefined;
    try {
      b64 = await urlToB64(s.file);
    } catch {
      /* image may not exist; demo mode still works via hint */
    }
    analyze({ imageBase64: b64, mediaType: "image/png", scenarioHint: s.hint, preview: s.file });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = String(fr.result);
      analyze({
        imageBase64: dataUrl.split(",")[1],
        mediaType: f.type || "image/jpeg",
        preview: dataUrl,
      });
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
    analyze({ imageBase64: dataUrl.split(",")[1], mediaType: "image/jpeg", preview: dataUrl });
  }

  return (
    <div>
      <AppHeader title="Disaster Camera" sub="Crisis command, not just shopping" />
      <div className="px-4 py-4">
        {!plan && !loading && !camOn && (
          <>
            <div className="grid h-44 place-items-center rounded-2xl border-2 border-dashed border-mist bg-white text-center">
              <div>
                <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-blink/15 text-blinkdk">
                  <Icon name="camera" size={24} />
                </span>
                <p className="text-[13px] font-semibold text-ink">Point at the emergency</p>
                <p className="text-[11px] text-ink/50">Bedrock reads the scene and bundles the fix</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button variant="dark" size="sm" onClick={startCam} className="flex-col !py-3">
                <Icon name="camera" size={18} /> Live cam
              </Button>
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="flex-col !py-3">
                <Icon name="arrow" size={18} className="-rotate-90" /> Upload
              </Button>
              <Button variant="ghost" size="sm" onClick={reset} className="flex-col !py-3">
                <Icon name="refresh" size={18} /> Reset
              </Button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

            <p className="mb-2 mt-5 px-1 text-[12px] font-bold uppercase tracking-wide text-ink/50">
              Or try a sample
            </p>
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

        {camOn && (
          <div>
            <div className="overflow-hidden rounded-2xl bg-black">
              <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
            </div>
            <Button onClick={capture} size="lg" className="mt-3">
              <Icon name="camera" size={20} /> Capture & analyse
            </Button>
          </div>
        )}

        {loading && (
          <div className="mt-2">
            {img && <img src={img} className="h-40 w-full rounded-2xl object-cover" alt="scene" />}
            <div className="mt-4 flex items-center justify-center gap-2 text-blinkdk">
              <Icon name="sparkles" size={18} className="animate-spinslow" />
              <span className="text-[13px] font-semibold">Bedrock reading the scene…</span>
            </div>
          </div>
        )}

        {plan && (
          <div className="animate-slide-up">
            {img && (
              <img src={img} className="mb-3 h-32 w-full rounded-2xl object-cover" alt="scene" />
            )}
            <div className="rounded-2xl border border-blink/30 bg-blink/5 p-3.5">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-alert/15 text-alert">
                  <Icon name="alert" size={18} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-ink">{plan.title}</p>
                  <p className="text-[11px] text-ink/55">{plan.radius}</p>
                </div>
                <span
                  className={`ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                    src === "live" ? "bg-trust/15 text-trustdk" : "bg-mist text-ink/50"
                  }`}
                >
                  {src === "live" ? "LIVE CLAUDE" : "DEMO"}
                </span>
              </div>
            </div>

            {/* one clarifying question */}
            {!answered && (
              <div className="mt-3 rounded-2xl border border-mist bg-white p-3">
                <p className="text-[12px] font-semibold text-ink">{plan.question}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setAnswered(true);
                      addLog("BEDROCK", "Clarifier answered → triage confirmed, severity held high");
                    }}
                    className="flex-1 rounded-lg bg-alert/10 py-2 text-[12px] font-bold text-alert"
                  >
                    Yes / still active
                  </button>
                  <button
                    onClick={() => {
                      setAnswered(true);
                      addLog("BEDROCK", "Clarifier answered → severity de-escalated, plan retained");
                    }}
                    className="flex-1 rounded-lg bg-mist py-2 text-[12px] font-bold text-ink/70"
                  >
                    No / contained
                  </button>
                </div>
              </div>
            )}

            {/* triage steps */}
            <p className="mb-1.5 mt-4 px-1 text-[12px] font-bold uppercase tracking-wide text-ink/50">
              Do this now
            </p>
            <ol className="space-y-1.5">
              {plan.steps.map((st, i) => (
                <li key={i} className="flex gap-2.5 rounded-xl border border-mist bg-white p-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[12px] leading-snug text-ink/80">{st}</span>
                </li>
              ))}
            </ol>

            {/* bundled cart */}
            <p className="mb-1.5 mt-4 px-1 text-[12px] font-bold uppercase tracking-wide text-ink/50">
              One-tap repair bundle
            </p>
            <div className="space-y-1.5">
              {plan.items.map((it, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl border border-mist bg-white p-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-cloud text-lg">
                    {it.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-ink">{it.name}</p>
                    <p className="text-[10px] text-ink/50">{it.why}</p>
                  </div>
                  <span className="text-[12px] font-bold text-ink/80">{inr(it.price)}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="mt-3"
              onClick={() => {
                plan.items.forEach((it, i) =>
                  addItem({
                    id: `triage-${i}-${it.name.slice(0, 6)}`,
                    name: it.name,
                    price: it.price,
                    emoji: it.emoji,
                    category: "Repair bundle",
                    stockCheckedSecAgo: 60,
                    pickerRating: 4.7,
                  })
                );
                addLog("BEDROCK", "Repair bundle committed → cart");
                setScreen("checkout");
              }}
            >
              <Icon name="bolt" size={18} /> Add bundle ·{" "}
              {inr(plan.items.reduce((a, b) => a + b.price, 0))}
            </Button>
            <button onClick={reset} className="mt-2 w-full text-center text-[12px] font-medium text-ink/40">
              Scan something else
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
