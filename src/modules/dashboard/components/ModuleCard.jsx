import React from "react";
import { cn } from "@/lib/utils";

const ModuleCard = ({
  title,
  icon: Icon,
  subtitle,
  action,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] transition-colors hover:border-white/10",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60">
              <Icon size={16} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {subtitle && (
              <p className="text-[10px] font-medium text-white/30">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
};

export default ModuleCard;