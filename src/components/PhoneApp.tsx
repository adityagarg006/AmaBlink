"use client";
import React from "react";
import { useBlink } from "@/lib/store";
import PhoneFrame from "./PhoneFrame";
import HomeFeed from "./phone/HomeFeed";
import DecisionEngine from "./phone/DecisionEngine";
import DisasterCamera from "./phone/DisasterCamera";
import FreshnessPassport from "./phone/FreshnessPassport";
import Checkout from "./phone/Checkout";
import GhostCart from "./phone/GhostCart";
import DeadZone from "./phone/DeadZone";
import ZeroBot from "./phone/ZeroBot";
import BatteryMode from "./phone/BatteryMode";
import Heartbeat from "./phone/Heartbeat";
import TrustLog from "./phone/TrustLog";

export default function PhoneApp() {
  const screen = useBlink((s) => s.screen);

  const view = (() => {
    switch (screen) {
      case "home": return <HomeFeed />;
      case "engine": return <DecisionEngine />;
      case "camera": return <DisasterCamera />;
      case "freshness": return <FreshnessPassport />;
      case "checkout": return <Checkout />;
      case "ghost": return <GhostCart />;
      case "deadzone": return <DeadZone />;
      case "zerobot": return <ZeroBot />;
      case "battery": return <BatteryMode />;
      case "heartbeat": return <Heartbeat />;
      case "trustlog": return <TrustLog />;
      default: return <HomeFeed />;
    }
  })();

  return <PhoneFrame>{view}</PhoneFrame>;
}
