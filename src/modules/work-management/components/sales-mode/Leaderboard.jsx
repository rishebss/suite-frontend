import React from "react";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, DollarSign } from "lucide-react";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const RANK_COLORS = {
  1: "from-yellow-500 to-amber-600",
  2: "from-gray-300 to-gray-400",
  3: "from-amber-600 to-amber-800",
};

const RANK_ICONS = {
  1: Trophy,
  2: Medal,
  3: Medal,
};

const Leaderboard = ({ leaderboard = [], loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-zinc-800/50 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!leaderboard.length) {
    return (
      <div className="text-center py-8">
        <Trophy size={32} className="mx-auto text-white/20 mb-2" />
        <p className="text-sm text-white/40">No leaderboard data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((entry) => {
        const RankIcon = RANK_ICONS[entry.rank] || null;
        const rankColor = RANK_COLORS[entry.rank] || "from-zinc-700 to-zinc-800";

        return (
          <div
            key={entry.user_id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all",
              entry.rank <= 3
                ? "bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/20"
                : "bg-zinc-900/40 border-white/5"
            )}
          >
            {/* Rank Badge */}
            <div className={cn(
              "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold shrink-0",
              rankColor,
              entry.rank <= 3 ? "text-white" : "text-white/40 bg-zinc-800"
            )}>
              {entry.rank <= 3 && RankIcon ? <RankIcon size={14} /> : entry.rank}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{entry.name}</p>
              <p className="text-[10px] text-white/40">{entry.role}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-400">{formatter.format(entry.total_achieved)}</p>
              <p className="text-[10px] text-white/40">Target: {formatter.format(entry.total_target)}</p>
            </div>

            {/* Attainment */}
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold",
              entry.attainment_pct >= 100
                ? "bg-emerald-500/10 text-emerald-400"
                : entry.attainment_pct >= 50
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-red-500/10 text-red-400"
            )}>
              {entry.attainment_pct >= 100 ? <TrendingUp size={12} />
                : entry.attainment_pct >= 50 ? <TrendingUp size={12} />
                : <TrendingDown size={12} />}
              {entry.attainment_pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Leaderboard;
