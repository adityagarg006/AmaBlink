"use client";
import React from "react";
import { useBlink } from "@/lib/store";
import Icon from "./Icon";
import Toasts from "./ui/Toasts";

function StatusBar() {
  const lowBattery = useBlink((s) => s.lowBattery);
  const networkDown = useBlink((s) => s.networkDown);
  return (
    <div className="flex items-center justify-between px-6 pt-2.5 pb-1 text-[12px] font-semibold text-ink">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        {networkDown ? (
          <span className="text-alert">
            <Icon name="wifioff" size={14} strokeWidth={2.4} />
          </span>
        ) : (
          <span className="flex items-end gap-[2px]">
            <span className="h-1.5 w-1 rounded-sm bg-ink/70" />
            <span className="h-2 w-1 rounded-sm bg-ink/70" />
            <span className="h-2.5 w-1 rounded-sm bg-ink/70" />
            <span className="h-3 w-1 rounded-sm bg-ink/40" />
          </span>
        )}
        <span className={`ml-1 flex items-center gap-1 ${lowBattery ? "text-alert" : ""}`}>
          {lowBattery ? "1%" : "78%"}
          <span className="relative inline-flex h-3 w-6 items-center rounded-[3px] border border-current px-[1px]">
            <span
              className={`h-2 rounded-[1px] ${lowBattery ? "bg-alert" : "bg-ink"}`}
              style={{ width: lowBattery ? "8%" : "78%" }}
            />
            <span className="absolute -right-[3px] h-1.5 w-[2px] rounded-r bg-current" />
          </span>
        </span>
      </div>
    </div>
  );
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 py-1 ${
        active ? "text-blinkdk" : "text-ink/40"
      }`}
    >
      <Icon name={icon} size={21} strokeWidth={active ? 2.3 : 1.9} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { screen, setScreen, cart } = useBlink();
  return (
    <div className="relative">
      {/* device */}
      <div className="relative h-[812px] w-[390px] overflow-hidden rounded-phone border-[10px] border-black bg-cloud shadow-phone">
        {/* notch */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-30 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-black" />
        <StatusBar />
        <Toasts />

        {/* screen content */}
        <div className="scroll-app relative h-[688px] overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* bottom nav */}
        <div className="absolute inset-x-0 bottom-0 flex items-stretch border-t border-mist bg-white/95 px-3 pb-3 pt-1.5 backdrop-blur">
          <NavItem active={screen === "home"} onClick={() => setScreen("home")} icon="home" label="Home" />
          <NavItem
            active={screen === "ghost"}
            onClick={() => setScreen("ghost")}
            icon="ghost"
            label="Nearby"
          />
          <button
            onClick={() => setScreen("checkout")}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-1 text-ink/40"
          >
            <span className={screen === "checkout" ? "text-blinkdk" : ""}>
              <Icon name="bolt" size={21} strokeWidth={screen === "checkout" ? 2.3 : 1.9} />
            </span>
            {cart.length > 0 && (
              <span className="absolute right-5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-blink px-1 text-[9px] font-bold text-ink">
                {cart.reduce((a, c) => a + c.qty, 0)}
              </span>
            )}
            <span className={`text-[10px] font-medium ${screen === "checkout" ? "text-blinkdk" : ""}`}>
              Cart
            </span>
          </button>
          <NavItem
            active={screen === "zerobot"}
            onClick={() => setScreen("zerobot")}
            icon="shield"
            label="Help"
          />
          <NavItem
            active={screen === "trustlog"}
            onClick={() => setScreen("trustlog")}
            icon="receipt"
            label="Trust"
          />
        </div>
      </div>
    </div>
  );
}
