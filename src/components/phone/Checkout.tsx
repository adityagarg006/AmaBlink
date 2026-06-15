"use client";
import React, { useEffect, useRef, useState } from "react";
import { useBlink } from "@/lib/store";
import { COMPANION, inr, product } from "@/lib/data";
import { Product } from "@/lib/types";
import { broadcastOrder } from "@/lib/ghost";
import Icon from "../Icon";
import Button from "../ui/Button";
import SwipeToConfirm from "../ui/SwipeToConfirm";
import ConfidenceChip from "../ui/ConfidenceChip";
import { AppHeader } from "./Parts";

// Verified-available replacements used by the Cancellation Shield when a
// live stock-confidence drop fires. In production these come from the same
// confidence service that powers the chip.
const SHIELD_SUB: Record<string, Product> = {
  tomato: { id: "tomato-v", name: "Hybrid Tomatoes 500g", price: 36, emoji: "🍅", category: "Vegetables", perishable: true, stockCheckedSecAgo: 15, pickerRating: 4.8, freshnessChecked: true },
  milk: { id: "milk-v", name: "Amul Gold Milk 1L", price: 78, emoji: "🥛", category: "Dairy & Eggs", perishable: true, stockCheckedSecAgo: 15, pickerRating: 4.8, freshnessChecked: true },
  eggs: { id: "eggs-v", name: "Eggoz Protein Eggs (12)", price: 99, emoji: "🥚", category: "Dairy & Eggs", perishable: true, stockCheckedSecAgo: 15, pickerRating: 4.9, freshnessChecked: true },
  bread: { id: "bread-v", name: "Modern Brown Bread", price: 48, emoji: "🍞", category: "Bakery", perishable: true, stockCheckedSecAgo: 20, pickerRating: 4.8, freshnessChecked: true },
  redbull: { id: "redbull-v", name: "Monster Energy 350ml", price: 130, emoji: "🥤", category: "Beverages", stockCheckedSecAgo: 18, pickerRating: 4.7 },
  paracetamol: { id: "paracetamol-v", name: "Calpol 650 (strip of 15)", price: 33, emoji: "💊", category: "Pharmacy", stockCheckedSecAgo: 12, pickerRating: 4.9 },
};

function verifiedVariant(p: Product): Product {
  return { ...p, id: p.id + "-v", name: p.name + " · verified lot", stockCheckedSecAgo: 15, pickerRating: 4.9, freshnessChecked: true };
}

const isHighStakes = (p: Product) =>
  Boolean(p.perishable) || p.category === "Pharmacy" || p.price >= 500;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function Checkout() {
  const {
    cart, removeFromCart, substituteInCart, clearCart,
    addLog, addItem, setScreen, issueCredit, pushToast,
    bumpDispatched, setMapEvent, stockDrop, freezeTTLA,
  } = useBlink();

  const [phase, setPhase] = useState<"cart" | "placing" | "done">("cart");
  const [dispatchMs, setDispatchMs] = useState<number | null>(null);
  const [ordered, setOrdered] = useState<{ id: string; name: string }[]>([]);
  const [suggest, setSuggest] = useState<{ p: Product; pct: number } | null>(null);
  const [regret, setRegret] = useState(180);
  const [bioScan, setBioScan] = useState(false);

  const prevStock = useRef(false);
  const shieldFired = useRef(false);

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);

  // ── Cancellation Shield: react to a live stock-confidence drop ──
  useEffect(() => {
    if (stockDrop && !prevStock.current && phase === "cart") fireShield();
    prevStock.current = stockDrop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockDrop, cart.length, phase]);

  function fireShield() {
    if (shieldFired.current) return;
    const live = useBlink.getState().cart;
    if (live.length === 0) {
      addLog("SHIELD", "Stock-confidence event — cart empty, nothing to protect");
      return;
    }
    shieldFired.current = true;

    const locked = live.filter((c) => c.neverSwap);
    // Only ever substitute a swap-SAFE item; medicine / formula are off-limits.
    const target =
      live.find((c) => !c.neverSwap && (SHIELD_SUB[c.id] || c.perishable)) ||
      live.find((c) => !c.neverSwap);

    // Always state what the safety locks protected.
    if (locked.length) {
      addLog(
        "SHIELD",
        `NEVER_SWAP lock held: ${locked.map((c) => c.name).join(", ")} left untouched — health-critical items are never auto-substituted.`
      );
    }

    if (!target) {
      // Everything in the cart is locked → we do NOT swap. Source a verified lot instead.
      addLog(
        "SHIELD",
        "Every item in this cart is NEVER_SWAP → no substitution made. Sourcing a verified-fresh lot from another dark store; ETA unchanged, no cancellation."
      );
      const credit = 40;
      issueCredit(credit);
      addLog("APOLOGY", `Pre-emptive ${inr(credit)} credit issued for the stock wobble — before you noticed.`);
      pushToast({
        kind: "trust",
        title: `${inr(40)} credit added`,
        body: "Your medicine is protected — we’re sourcing a verified lot rather than swapping it.",
      });
      return;
    }

    const sub = SHIELD_SUB[target.id] || verifiedVariant(target);
    const reason = "stock confidence fell below threshold mid-fulfilment";
    substituteInCart(target.id, sub, reason);
    addLog(
      "SHIELD",
      `${target.name} confidence dropped to 38% → auto-substituted ${sub.name} (verified 15s ago). No cancellation issued.`
    );
    // ── Apology Engine: compensate before the user notices ──
    const credit = 40;
    issueCredit(credit);
    addLog("APOLOGY", `Pre-emptive ${inr(credit)} credit issued — detected substitution before customer saw it`);
    pushToast({
      kind: "apology",
      title: `We’ve already added a ${inr(credit)} credit`,
      body: `${target.name} was swapped for a verified-fresh unit so your order isn’t cancelled.`,
    });
  }

  // ── One-Swipe + Speculative Dispatch ──
  function placeOrder() {
    if (cart.length === 0) return;
    freezeTTLA(); // stop the Time-to-Leave-App clock — the decision is done
    const items = cart.map((c) => ({ id: c.id, name: c.name }));
    setOrdered(items);
    setPhase("placing");
    addLog("DISPATCH", "Order committed locally (8ms) — optimistic local commit");
    setTimeout(() => addLog("DISPATCH", "Risk engine OK → speculative warehouse dispatch authorized"), 280);
    setTimeout(() => {
      const ms = 240 + Math.floor(Math.random() * 180);
      setDispatchMs(ms);
      bumpDispatched();
      addLog("DISPATCH", `Payment handshake confirmed async (${ms}ms) — warehouse already moving`);
      broadcastOrder(items.map((i) => i.id)); // notify other tabs → Ghost-Cart
      // Regret-window companion (Bedrock would generate live)
      const hit = items.map((i) => i.id).find((id) => COMPANION[id]);
      if (hit) {
        const c = COMPANION[hit];
        const p = product(c.id);
        if (p) setSuggest({ p, pct: c.pct });
      }
      clearCart();
      setPhase("done");
      setRegret(180);
    }, 950);
  }

  // ── Regret Window countdown ──
  useEffect(() => {
    if (phase !== "done") return;
    if (regret <= 0) return;
    const t = setInterval(() => setRegret((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, regret]);

  function acceptCompanion() {
    if (!suggest) return;
    addItem(suggest.p);
    addLog("MAP", `Regret-window add: ${suggest.p.name} → computing interception, Rider_04 → Rider_01 hand-off`);
    setMapEvent("intercept");
    setTimeout(() => setMapEvent("idle"), 12000);
    pushToast({ kind: "info", title: "Added to the live route", body: `${suggest.p.name} folded into your in-flight delivery.` });
    setSuggest(null);
  }

  // ───────────────────────────── render ─────────────────────────────
  if (phase === "placing") {
    return (
      <div className="grid h-full place-items-center bg-cloud">
        <div className="flex flex-col items-center gap-3">
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-blink/30" />
            <span className="grid h-16 w-16 place-items-center rounded-full bg-blink text-ink">
              <Icon name="bolt" size={30} strokeWidth={2.4} />
            </span>
          </span>
          <p className="text-sm font-semibold text-ink">Committing your order…</p>
          <p className="text-[11px] text-ink/50">Speculative dispatch in flight</p>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="min-h-full bg-cloud px-4 pb-6">
        <div className="flex flex-col items-center gap-2 pt-10 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-trust text-white shadow-trustglow">
            <Icon name="check" size={32} strokeWidth={2.6} />
          </span>
          <h1 className="mt-1 text-lg font-bold text-ink">Order confirmed</h1>
          <p className="text-[12px] text-ink/50">
            Committed in {dispatchMs ?? 320}ms · warehouse already picking
          </p>
        </div>

        {/* Regret Window */}
        {regret > 0 ? (
          <div className="mt-6 rounded-2xl border border-blink/30 bg-blink/10 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-blinkdk">
                <Icon name="clock" size={14} strokeWidth={2.4} /> Regret window
              </span>
              <span className="font-mono text-sm font-bold text-blinkdk">{fmt(regret)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-blink/20">
              <div className="h-full bg-blink transition-all" style={{ width: `${(regret / 180) * 100}%` }} />
            </div>
            {suggest ? (
              <div className="mt-3 rounded-xl bg-white p-3 shadow-soft">
                <p className="text-[12px] text-ink/70">
                  You ordered something that pairs with{" "}
                  <span className="font-semibold text-ink">{suggest.p.name}</span>.
                </p>
                <p className="mt-0.5 text-[12px] font-semibold text-ink">
                  {suggest.pct}% of users also needed it — add to the same run?
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-cloud text-xl">{suggest.p.emoji}</div>
                  <span className="text-[13px] font-bold text-ink">{inr(suggest.p.price)}</span>
                  <div className="ml-auto flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSuggest(null)}>No thanks</Button>
                    <Button variant="primary" size="sm" onClick={acceptCompanion}>
                      <Icon name="plus" size={14} strokeWidth={2.6} /> Add it
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[12px] text-ink/55">
                Forgot something? Add it now and it joins the same courier — no second trip.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-mist bg-white p-4 text-center shadow-soft">
            <p className="text-[13px] font-semibold text-ink">Regret window closed</p>
            <p className="mt-0.5 text-[11px] text-ink/50">Your order is locked to its route. On the way.</p>
          </div>
        )}

        <Button variant="dark" size="lg" className="mt-6" onClick={() => { setPhase("cart"); setScreen("home"); }}>
          Back to home
        </Button>
      </div>
    );
  }

  // phase === "cart"
  return (
    <div className="min-h-full bg-cloud">
      <AppHeader title="Urgent checkout" sub="One swipe · confidence-gated" />
      <div className="px-4 pb-8">
        {cart.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-mist text-ink/40">
              <Icon name="bolt" size={28} />
            </div>
            <p className="text-sm font-semibold text-ink">Your urgent cart is empty</p>
            <p className="px-8 text-[12px] text-ink/50">
              Add items from the Disaster Camera, Freshness Passport, or the home feed.
            </p>
            <Button variant="primary" size="md" onClick={() => setScreen("home")}>Go to home</Button>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-2">
              {cart.map((c) => (
                <div key={c.id} className="rounded-2xl border border-mist bg-white p-3 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cloud text-2xl">{c.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-ink">
                        {c.name}
                        {c.neverSwap && (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-alert/10 px-1 py-0.5 text-[9px] font-bold text-alert">
                            <Icon name="lock" size={9} strokeWidth={2.6} /> NO-SWAP
                          </span>
                        )}
                      </p>
                      {c.substitutedFrom ? (
                        <p className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-trust/10 px-1.5 py-0.5 text-[10px] font-medium text-trustdk">
                          <Icon name="shield" size={11} strokeWidth={2.4} /> swapped from {c.substitutedFrom}
                        </p>
                      ) : (
                        <p className="text-[11px] text-ink/45">Qty {c.qty}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-ink">{inr(c.price * c.qty)}</p>
                      <button onClick={() => removeFromCart(c.id)} className="text-[11px] text-ink/40 hover:text-alert">
                        remove
                      </button>
                    </div>
                  </div>
                  {isHighStakes(c) && (
                    <div className="mt-2">
                      <ConfidenceChip p={c} />
                    </div>
                  )}
                  {c.reason && (
                    <p className="mt-1.5 text-[11px] text-ink/55">
                      <span className="font-semibold text-trustdk">Why swapped:</span> {c.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-mist bg-white p-3 shadow-soft">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink/60">Subtotal</span>
                <span className="font-semibold text-ink">{inr(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink/60">Priority delivery</span>
                <span className="font-semibold text-trustdk">FREE · 8 min</span>
              </div>
              <div className="mt-2 border-t border-mist pt-2 flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink">Total</span>
                <span className="text-base font-extrabold text-ink">{inr(subtotal)}</span>
              </div>
            </div>

            <div className="mt-4">
              <SwipeToConfirm label="Swipe to order now" doneLabel="Committing…" tone="primary" onConfirm={placeOrder} />
              <div className="my-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-ink/30">
                <span className="h-px flex-1 bg-mist" /> or <span className="h-px flex-1 bg-mist" />
              </div>
              <button
                onClick={() => {
                  if (bioScan) return;
                  setBioScan(true);
                  addLog("DISPATCH", "Biometric requested → WebAuthn fingerprint");
                  setTimeout(() => {
                    setBioScan(false);
                    placeOrder();
                  }, 850);
                }}
                disabled={bioScan}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-white py-3 text-[14px] font-bold text-ink shadow-soft transition-all active:scale-[0.98] disabled:opacity-60"
              >
                <Icon name="fingerprint" size={20} className={bioScan ? "animate-pulsedot text-blinkdk" : "text-blinkdk"} />
                {bioScan ? "Hold to confirm…" : "Confirm with fingerprint"}
              </button>
              <p className="mt-2 text-center text-[11px] text-ink/45">
                Payment authorises in the background — you won’t wait for it.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
