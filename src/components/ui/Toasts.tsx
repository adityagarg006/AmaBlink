"use client";
import React, { useEffect } from "react";
import { useBlink, Toast } from "@/lib/store";
import Icon from "../Icon";

const styleFor: Record<Toast["kind"], { ring: string; icon: any; iconColor: string }> = {
  trust: { ring: "border-trust/40", icon: "shield", iconColor: "text-trust" },
  apology: { ring: "border-blink/50", icon: "sparkles", iconColor: "text-blinkdk" },
  info: { ring: "border-sky/40", icon: "bell", iconColor: "text-sky" },
  alert: { ring: "border-alert/40", icon: "alert", iconColor: "text-alert" },
};

function ToastCard({ t }: { t: Toast }) {
  const dismiss = useBlink((s) => s.dismissToast);
  useEffect(() => {
    const id = setTimeout(() => dismiss(t.id), 5200);
    return () => clearTimeout(id);
  }, [t.id, dismiss]);
  const s = styleFor[t.kind];
  return (
    <div
      className={`animate-toastin pointer-events-auto rounded-2xl border bg-white/95 backdrop-blur px-3.5 py-3 shadow-lift ${s.ring}`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 ${s.iconColor}`}>
          <Icon name={s.icon} size={18} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight text-ink">{t.title}</p>
          {t.body && <p className="mt-0.5 text-[12px] leading-snug text-ink/60">{t.body}</p>}
        </div>
        <button onClick={() => dismiss(t.id)} className="text-ink/30 hover:text-ink/60">
          <Icon name="x" size={15} />
        </button>
      </div>
    </div>
  );
}

export default function Toasts() {
  const toasts = useBlink((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-40 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastCard key={t.id} t={t} />
      ))}
    </div>
  );
}
