import React from "react";
import { cn } from "../../../lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors";

  const variants = {
    default:
      "border-transparent bg-sky-100 text-sky-700",
    outline:
      "border-sky-200 text-sky-700",
    success:
      "border-transparent bg-emerald-100 text-emerald-700",
    muted:
      "border-transparent bg-slate-100 text-slate-600"
  };

  return (
    <span
      className={cn(base, variants[variant] ?? variants.default, className)}
      {...props}
    />
  );
}


