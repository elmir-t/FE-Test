import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export default function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3.5 py-2 text-sm",
  }[size];

  const variants: Record<Variant, string> = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-300 shadow-sm",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300",
    outline:
      "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300 shadow-sm",
  };

  return (
    <button
      className={twMerge(clsx(base, sizes, variants[variant], className))}
      {...props}
    />
  );
}
