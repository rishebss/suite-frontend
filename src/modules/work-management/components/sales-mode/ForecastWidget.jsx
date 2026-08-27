import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, DollarSign, Target, BarChart3, Loader2 } from "lucide-react";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ForecastWidget = ({ forecast, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={20} className="animate-spin text-white/20" />
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={32} className="mx-auto text-white/20 mb-2" />
        <p className="text-sm text-white/40">No pipeline forecast data</p>
      </div>
    );
  }

  const { total_pipeline_value, total_weighted_forecast, deal_count, stage_breakdown } = forecast;
  const stageEntries = stage_breakdown ? Object.entries(stage_breakdown) : [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={12} className="text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Pipeline</span>
          </div>
          <p className="text-lg font-bold text-white">{formatter.format(total_pipeline_value)}</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Forecast</span>
          </div>
          <p className="text-lg font-bold text-emerald-400">{formatter.format(total_weighted_forecast)}</p>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Target size={12} className="text-amber-400" />
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Deals</span>
          </div>
          <p className="text-lg font-bold text-white">{deal_count}</p>
        </div>
      </div>

      {/* Stage Breakdown */}
      {stageEntries.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Stage Breakdown</h4>
          <div className="space-y-1.5">
            {stageEntries.map(([stageName, stage]) => (
              <div key={stageName} className="flex items-center justify-between p-2 rounded bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white font-medium">{stageName}</span>
                  <span className="text-[10px] text-white/40">({stage.deal_count})</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">{formatter.format(stage.total_value)}</p>
                  <p className="text-[10px] text-emerald-400">
                    Weighted: {formatter.format(stage.weighted_value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastWidget;
