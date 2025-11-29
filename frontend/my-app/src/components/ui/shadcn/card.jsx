import React from "react";
import { cn } from "../../../lib/utils";

export const Card = React.forwardRef(function CardComponent(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur-sm shadow-sm",
        className
      )}
      {...props}
    />
  );
});

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("space-y-2 px-6 py-5", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3
    className={cn(
      "text-lg font-semibold tracking-tight text-slate-900",
      className
    )}
    {...props}
  />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-slate-500", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("px-6 pb-6", className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div
    className={cn("px-6 pb-6 pt-0 flex items-center justify-between", className)}
    {...props}
  />
);


