"use client";
import React, { useRef, useState } from "react";
import Icon from "../Icon";

export default function SwipeToConfirm({
  label = "Swipe to order",
  doneLabel = "Confirmed",
  onConfirm,
  disabled,
  tone = "primary",
}: {
  label?: string;
  doneLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  tone?: "primary" | "trust";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState(false);
  const knob = 52;

  const maxX = () => (trackRef.current?.clientWidth || 300) - knob - 6;

  const move = (clientX: number) => {
    if (!trackRef.current || done) return;
    const rect = trackRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(clientX - rect.left - knob / 2, maxX()));
    setX(nx);
    if (nx >= maxX() - 4) {
      setDone(true);
      setDrag(false);
      setX(maxX());
      onConfirm();
    }
  };

  const start = () => !disabled && setDrag(true);
  const end = () => {
    setDrag(false);
    if (!done) setX(0);
  };

  const fill = tone === "trust" ? "bg-trust" : "bg-blink";
  const knobColor = tone === "trust" ? "text-trust" : "text-blinkdk";

  return (
    <div
      ref={trackRef}
      className={`relative h-14 w-full rounded-2xl overflow-hidden select-none ${
        done ? "bg-trust/15" : "bg-mist"
      }`}
      onMouseMove={(e) => drag && move(e.clientX)}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchMove={(e) => drag && move(e.touches[0].clientX)}
      onTouchEnd={end}
    >
      <div
        className={`absolute inset-y-0 left-0 ${done ? "bg-trust" : fill} opacity-90`}
        style={{ width: x + knob }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-sm font-semibold ${
            done ? "text-white" : x > 40 ? "text-white" : "text-ink/60"
          }`}
        >
          {done ? doneLabel : label}
        </span>
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onMouseDown={start}
        onTouchStart={start}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !done && !disabled) {
            setDone(true);
            setX(maxX());
            onConfirm();
          }
        }}
        className={`absolute top-[6px] h-[44px] w-[46px] rounded-xl bg-white shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing ${knobColor}`}
        style={{ left: x + 4, transition: drag ? "none" : "left .25s cubic-bezier(.2,.9,.3,1.2)" }}
      >
        <Icon name={done ? "check" : "arrow"} size={22} strokeWidth={2.4} />
      </div>
    </div>
  );
}
