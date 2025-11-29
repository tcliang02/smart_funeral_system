import React from "react";
import { cn } from "../../../lib/utils";

const variantClasses = {
  default:
    "bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-300",
  outline:
    "border border-sky-200 text-sky-700 bg-white hover:bg-sky-50 focus-visible:ring-sky-200",
  ghost:
    "text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-200",
  soft:
    "bg-sky-100 text-sky-700 hover:bg-sky-200 focus-visible:ring-sky-200",
  muted:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-200"
};

export const Button = React.forwardRef(function ButtonComponent(
  { className, variant = "default", size = "md", ...props },
  ref
) {
  const sizeClasses =
    size === "lg"
      ? "h-11 px-6 text-sm"
      : size === "sm"
        ? "h-8 px-3 text-sm"
        : "h-10 px-5 text-sm";

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
        sizeClasses,
        variantClasses[variant] ?? variantClasses.default,
        className
      )}
      {...props}
    />
  );
});


