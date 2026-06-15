"use client";
import React, { useState } from "react";
import { useBlink } from "@/lib/store";
import { bedrock } from "@/lib/bedrock";
import { inr } from "@/lib/data";
import { SeverityResult } from "@/lib/types";
import Icon from "../Icon";
import Button from "../ui/Button";
import { AppHeader } from "./Parts";

const QUICK = [
  "The eggs arrived cracked and smell off",
  "Wrong medicine was delivered",
  "My order is 40 minutes late",
  "The packaging was slightly torn",
];

// Map an issue to the dark-store/SKU it implicates, for Failure Mode Memory.
function blameTarget(text: string): { sku: string; store: string; label: string } | null {
  const t = text.toLowerCase();
  if (/(egg|omelet)/.test(t)) return { sku: "eggs", store: "Indiranagar DS", label: "Farm Eggs" };
  if (/(milk|curd|paneer)/.test(t)) return { sku: "milk", store: "Indiranagar DS", label: "Amul Taaza Milk" };
  if (/(medicine|tablet|dolo|pharma|paracetamol|strip)/.test(t)) return { sku: "paracetamol", store: "Koramangala DS", label: "Dolo 650" };
  if (/(tomato|veg|produce|onion)/.test(t)) return { sku: "tomato", store: "Indiranagar DS", label: "Tomatoes" };
  return null;
}

export default function ZeroBot() {
  const { addLog, issueCredit, rememberFailure, pushToast } = useBlink();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<SeverityResult | null>(null);
  const [src, setSrc] = useState<"live" | "demo" | null>(null);
  const [blamed, setBlamed] = useState<{ store: string; label: string } | null>(null);

  async function submit(desc: string) {
    if (!desc.trim()) return;
    setBusy(true);
    setRes(null);
    setBlamed(null);
    addLog("ESCALATE", `Issue report received → Bedrock severity classification…`);
    const r = await bedrock({ action: "severity", description: desc });
    setSrc(r.source);
    if (r.source === "live") useBlink.getState().markLive();
    const result: SeverityResult = r.result;
    setRes(result);

    if (result.severity === "high") {
      const refund = result.refund || 0;
      if (refund) issueCredit(refund);
      addLog(
        "ESCALATE",
        `HIGH severity (${result.category}) → ${refund ? `auto-refund ${inr(refund)} approved, ` : ""}routed to a human specialist. No bot loop.`
      );
      const blame = blameTarget(desc);
      if (blame) {
        rememberFailure(blame.sku, blame.store, `${result.category}: ${result.reason}`);
        setBlamed({ store: blame.store, label: blame.label });
        addLog("MEMORY", `Failure logged → future urgent ${blame.label} orders will route around ${blame.store}`);
      }
      pushToast({ kind: "trust", title: "Resolved automatically", body: `${refund ? inr(refund) + " refunded · " : ""}a specialist is already on it.` });
    } else {
      addLog("ESCALATE", `LOW severity (${result.category}) → standard 24h follow-up logged`);
    }
    setBusy(false);
  }

  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="Report an issue" sub="Severity-routed · zero bot loop" />
      <div className="px-4 pb-8">
        {!res ? (
          <>
            <p className="mt-3 text-[12px] text-ink/60">
              Tell us what went wrong. Serious problems are auto-resolved instantly — no chatbot runaround.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => setText(q)}
                  className="rounded-full border border-mist bg-white px-3 py-1.5 text-[11px] font-medium text-ink/70 hover:border-blink/40 hover:text-ink"
                >
                  {q}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Describe the issue…"
              className="mt-3 w-full resize-none rounded-2xl border border-mist bg-white p-3 text-[13px] text-ink shadow-soft outline-none focus:border-blink/50"
            />
            <Button variant="dark" size="lg" className="mt-3" disabled={busy || !text.trim()} onClick={() => submit(text)}>
              {busy ? "Classifying…" : "Submit report"}
            </Button>
          </>
        ) : (
          <div className="mt-4">
            {res.severity === "high" ? (
              <div className="rounded-2xl border border-trust/30 bg-trust/10 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-trust text-white">
                    <Icon name="shield" size={20} strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-ink">Already fixed</p>
                    <p className="text-[11px] text-ink/55">High severity · {res.category}</p>
                  </div>
                  {src && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${src === "live" ? "bg-trust text-white" : "bg-mist text-ink/50"}`}>
                      {src}
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {res.refund ? (
                    <div className="flex items-center gap-2 rounded-xl bg-white p-2.5">
                      <Icon name="check" size={16} className="text-trustdk" strokeWidth={2.6} />
                      <span className="text-[12px] text-ink">
                        <b>{inr(res.refund)} refunded automatically</b> — no questions asked
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 rounded-xl bg-white p-2.5">
                    <Icon name="bell" size={16} className="text-trustdk" strokeWidth={2.4} />
                    <span className="text-[12px] text-ink">{res.action || "Escalated to a human specialist"}</span>
                  </div>
                  {blamed && (
                    <div className="flex items-start gap-2 rounded-xl bg-white p-2.5">
                      <Icon name="map" size={16} className="text-trustdk" strokeWidth={2.4} />
                      <span className="text-[12px] text-ink">
                        Your future urgent <b>{blamed.label}</b> orders will skip <b>{blamed.store}</b>. You won’t have
                        to complain twice.
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[11px] text-ink/55">{res.reason}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-mist bg-white p-4 shadow-soft">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-sky/15 text-sky">
                    <Icon name="check" size={20} strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-ink">Logged</p>
                    <p className="text-[11px] text-ink/55">Standard · {res.category}</p>
                  </div>
                  {src && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${src === "live" ? "bg-trust text-white" : "bg-mist text-ink/50"}`}>
                      {src}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[12px] text-ink/70">{res.action || "We’ll follow up within 24 hours."}</p>
                <p className="mt-2 text-[11px] text-ink/50">{res.reason}</p>
              </div>
            )}
            <Button variant="ghost" size="md" className="mt-4" onClick={() => { setRes(null); setText(""); }}>
              Report something else
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
