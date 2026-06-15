import React from "react";

type Props = { name: IconName; className?: string; size?: number; strokeWidth?: number };

export type IconName =
  | "camera"
  | "leaf"
  | "shield"
  | "bolt"
  | "ghost"
  | "map"
  | "wifioff"
  | "alert"
  | "pulse"
  | "battery"
  | "droplet"
  | "rain"
  | "check"
  | "x"
  | "sparkles"
  | "bot"
  | "send"
  | "plus"
  | "chevron"
  | "arrow"
  | "refresh"
  | "clock"
  | "lock"
  | "search"
  | "pin"
  | "receipt"
  | "flame"
  | "home"
  | "bell"
  | "fingerprint"
  | "link"
  | "cpu"
  | "building"
  | "eye"
  | "mic";

const P: Record<IconName, React.ReactNode> = {
  camera: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="3.2" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 21c0-7 4-13 14-15 1 9-3 15-11 15-1.5 0-3-.4-3-.4Z" />
      <path d="M8 18c3-4 6-6 9-7" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  ghost: (
    <>
      <path d="M5 21V11a7 7 0 0 1 14 0v10l-2.5-2-2.5 2-2-2-2 2-2.5-2z" />
      <circle cx="9.5" cy="11" r="1" />
      <circle cx="14.5" cy="11" r="1" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  wifioff: (
    <>
      <path d="M2 8.8a16 16 0 0 1 6-3.4M22 8.8a16 16 0 0 0-6.5-3.5" />
      <path d="M6 12.5a10 10 0 0 1 3-1.8M18 12.5a10 10 0 0 0-3.2-1.9" />
      <path d="M9.5 16a4.5 4.5 0 0 1 5 0" />
      <path d="M12 20h.01" />
      <path d="m3 3 18 18" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  pulse: <path d="M2 12h4l2-6 4 14 3-9 2 3h5" />,
  battery: (
    <>
      <rect x="2" y="8" width="16" height="9" rx="2" />
      <path d="M22 11v3" />
      <rect x="4" y="10" width="3" height="5" rx="0.5" fill="currentColor" stroke="none" />
    </>
  ),
  droplet: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  rain: (
    <>
      <path d="M7 15a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 7.5 3.5 3.5 0 0 1 17.5 15z" />
      <path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" />
    </>
  ),
  check: <path d="M5 12.5 10 17l9-10" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  sparkles: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
    </>
  ),
  bot: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 8V5M9 13h.01M15 13h.01M9 16h6" />
    </>
  ),
  send: <path d="M4 12 20 4l-7 16-2-7z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14-4.5L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14 4.5L20 16" />
      <path d="M20 20v-4h-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  receipt: (
    <>
      <path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  flame: <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c2 2 3 3.5 3 6a5 5 0 0 1-10 0c0-4 5-6 5-13z" />,
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  fingerprint: (
    <>
      <path d="M12 11c0-1.5-1.3-2.5-3-2.5S6 9.5 6 11v2.5" />
      <path d="M12 11v3a6 6 0 0 0 1.5 4" />
      <path d="M9 18.5A8 8 0 0 1 8 15v-4a4 4 0 0 1 8 0v4" />
      <path d="M16 13v2a8 8 0 0 0 .6 3" />
      <path d="M4.5 9a8 8 0 0 1 14.5 2" />
    </>
  ),
  link: (
    <>
      <path d="M9 12h6" />
      <path d="M10 8H8a4 4 0 0 0 0 8h2" />
      <path d="M14 8h2a4 4 0 0 1 0 8h-2" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M12 11h.01M15 11h.01M9 15h.01M15 15h.01" />
      <path d="M11 21v-3h2v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4M9 21h6" />
    </>
  ),
};

export default function Icon({ name, className = "", size = 20, strokeWidth = 1.9 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  );
}
