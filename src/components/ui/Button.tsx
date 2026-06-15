import React from "react";

type Variant = "primary" | "trust" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-blink text-ink hover:bg-blinkdk shadow-sm",
  trust: "bg-trust text-white hover:bg-trustdk shadow-sm",
  ghost: "bg-mist text-ink hover:bg-[#dfe4ec]",
  danger: "bg-alert text-white hover:brightness-95",
  dark: "bg-ink text-white hover:bg-[#0d1620]",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-[15px] px-5 py-3.5 w-full",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
