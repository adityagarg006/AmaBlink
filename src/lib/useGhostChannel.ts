"use client";
import { useEffect } from "react";
import { useBlink } from "./store";
import { getGhostChannel, myTab, pushRecentOrder, GhostMsg } from "./ghost";

// Mounted once at the Digital Twin level. When ANOTHER tab broadcasts an
// order, this opens a Ghost-Cart window here with the right dynamic state.
export function useGhostChannel() {
  const setGhostIncoming = useBlink((s) => s.setGhostIncoming);
  const addLog = useBlink((s) => s.addLog);

  useEffect(() => {
    const ch = getGhostChannel();
    if (!ch) return;
    const onMsg = (e: MessageEvent) => {
      const m = e.data as GhostMsg;
      if (!m || m.type !== "order" || m.tab === myTab()) return;
      const count = pushRecentOrder(m.at);
      const inB = useBlink.getState().courierInBuilding;
      const mode = inB ? "in-building" : count >= 2 ? "extended" : "countdown";
      const window = mode === "in-building" ? 0 : mode === "extended" ? 120 : 45;
      setGhostIncoming({ from: "a neighbour", window, mode, items: m.items });
      addLog(
        "GHOST",
        `Cross-tab order on your floor (#${count} in 10 min) → ${
          mode === "in-building"
            ? "window OPEN (courier in building)"
            : mode === "extended"
            ? "window extended to 2:00"
            : "45s window"
        }`
      );
    };
    ch.addEventListener("message", onMsg);
    return () => ch.removeEventListener("message", onMsg);
  }, [setGhostIncoming, addLog]);
}
