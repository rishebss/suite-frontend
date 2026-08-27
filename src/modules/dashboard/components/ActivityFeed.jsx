import React from "react";
import {
  Workflow,
  Banknote,
  UserPlus,
  FileText,
  FolderKanban,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const typeConfig = {
  work_item: { icon: Workflow, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  payment: { icon: Banknote, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  contact: { icon: UserPlus, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  invoice: { icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  project: { icon: FolderKanban, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
};

const ActivityFeed = ({ items = [] }) => {
  if (!items.length) {
    return (
      <p className="py-10 text-center text-xs font-medium text-white/30">
        No recent activity yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {items.map((item, i) => {
        const cfg = typeConfig[item.type] || typeConfig.work_item;
        const Icon = cfg.icon;
        return (
          <div key={i} className="group flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02]">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cfg.color}`}
            >
              <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
              <p className="truncate text-xs text-white/35">{item.meta}</p>
            </div>
            <span className="shrink-0 text-[10px] font-medium text-white/25">
              {item.time ? formatDistanceToNow(new Date(item.time), { addSuffix: true }) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;