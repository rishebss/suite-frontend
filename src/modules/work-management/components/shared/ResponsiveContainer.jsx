import React from "react";
import { cn } from "@/lib/utils";

const ResponsiveContainer = ({ children, className, ...props }) => (
  <div
    className={cn(
      "px-3 sm:px-4 md:px-6 lg:px-8",
      "max-w-7xl mx-auto",
      "w-full",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const ResponsiveGrid = ({ children, cols = { default: 1, sm: 2, lg: 3 }, className, ...props }) => {
  const colMap = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "xl:grid-cols-4",
  };
  const classes = Object.entries(cols)
    .map(([bp, n]) => {
      if (bp === "default") return `grid-cols-${n}`;
      return `${bp}:grid-cols-${n}`;
    })
    .join(" ");

  return (
    <div className={cn("grid gap-3 sm:gap-4", classes, className)} {...props}>
      {children}
    </div>
  );
};

export const ResponsiveStack = ({ children, className, ...props }) => (
  <div
    className={cn(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between",
      "gap-3 sm:gap-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const ScrollableTable = ({ children, className, ...props }) => (
  <div className={cn("overflow-x-auto -mx-3 sm:mx-0", className)} {...props}>
    <div className="inline-block min-w-full align-middle">
      {children}
    </div>
  </div>
);

export default ResponsiveContainer;
