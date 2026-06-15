import React from "react";
import Icon from "../Icon";
import { Product } from "@/lib/types";

export default function ConfidenceChip({ p }: { p: Product }) {
  if (!p?.stockCheckedSecAgo) return null;
  const parts: { icon: React.ComponentProps<typeof Icon>["name"]; text: string }[] = [
    { icon: "check", text: `In stock ${p.stockCheckedSecAgo}s ago` },
  ];
  if (p.pickerRating) parts.push({ icon: "sparkles", text: `Picker ${p.pickerRating}★` });
  if (p.freshnessChecked) parts.push({ icon: "leaf", text: "Freshness checked" });

  return (
    <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-trust/10 px-2.5 py-1.5 text-[11px] font-medium text-trustdk">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-trust/40">·</span>}
          <Icon name={part.icon} size={13} strokeWidth={2.4} />
          {part.text}
        </span>
      ))}
    </div>
  );
}
