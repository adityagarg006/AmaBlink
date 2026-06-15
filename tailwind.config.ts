import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Amazon-derived chrome
        ink: "#131A22", // amazon dark navy (header, brain)
        abyss: "#0B0F14", // near-black panel
        slab: "#1B2530", // raised dark surface
        hair: "#283543", // dark hairline
        // action
        blink: "#FF9900", // amazon orange — actions, speed
        blinkdk: "#E88B00",
        // trust layer (the differentiator) — verified/safe
        trust: "#15C39A",
        trustdk: "#0E9E7E",
        // states
        alert: "#FF4D4F", // cancellation / high severity
        warn: "#FFB020", // caution / decay
        sky: "#3B9DFF", // logistics / map
        // phone app neutrals
        cloud: "#F4F5F7",
        mist: "#E9ECF1",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(19,26,34,0.06), 0 12px 28px rgba(19,26,34,0.08)",
        lift: "0 8px 24px rgba(19,26,34,0.12), 0 24px 60px rgba(19,26,34,0.14)",
        phone: "0 30px 80px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgba(255,153,0,0.4), 0 0 24px rgba(255,153,0,0.25)",
        trustglow: "0 0 0 1px rgba(21,195,154,0.45), 0 0 22px rgba(21,195,154,0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
        phone: "2.4rem",
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "log-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulsedot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "dash-move": {
          to: { strokeDashoffset: "-200" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        spinslow: { to: { transform: "rotate(360deg)" } },
        toastin: {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shrinkbar: { from: { width: "100%" }, to: { width: "0%" } },
      },
      animation: {
        "slide-up": "slide-up 0.35s ease-out",
        "log-in": "log-in 0.28s ease-out",
        pulsedot: "pulsedot 1.4s ease-in-out infinite",
        sheen: "sheen 1.6s ease-in-out infinite",
        "dash-move": "dash-move 1.4s linear infinite",
        breathe: "breathe 2.4s ease-in-out infinite",
        spinslow: "spinslow 1s linear infinite",
        toastin: "toastin 0.4s cubic-bezier(0.2,0.9,0.3,1.2)",
      },
    },
  },
  plugins: [],
};

export default config;
