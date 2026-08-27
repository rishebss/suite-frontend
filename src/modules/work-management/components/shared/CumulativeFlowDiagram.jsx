import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2, BarChart3 } from "lucide-react";
import { fetchCumulativeFlow } from "../../services/dashboardService";

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e", "#06b6d4", "#ec4899", "#6b7280"];

const CumulativeFlowDiagram = ({ projectId, compact = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data: flowData } = await fetchCumulativeFlow({ project: projectId, days: 30 });
      setData(Array.isArray(flowData) ? flowData : []);
    } catch (err) {
      console.error("Failed to load cumulative flow:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center py-8"><Loader2 size={16} className="animate-spin text-white/30" /></div>;
  if (!data.length) return <div className="text-center py-8 text-xs text-white/30">No cumulative flow data yet</div>;

  const statusKeys = Object.keys(data[0] || {}).filter((k) => k !== "date");
  const maxVal = Math.max(...data.map((d) => statusKeys.reduce((s, k) => s + (d[k] || 0), 0)), 1);
  const height = compact ? 120 : 200;
  const width = compact ? 300 : 600;
  const padding = { top: 10, right: 10, bottom: 20, left: compact ? 30 : 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xScale = (i) => padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v) => padding.top + chartH - (v / maxVal) * chartH;

  const buildAreaPath = (key, color, idx) => {
    const values = data.map((d) => d[key] || 0);
    if (idx > 0) {
      const prevKey = statusKeys[idx - 1];
      const prevValues = data.map((d) => d[prevKey] || 0);
      for (let i = 0; i < values.length; i++) values[i] += prevValues[i];
    }
    const top = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
    const bottom = values.map((v, i) => `${xScale(i)},${yScale(0)}`).reverse().join(" ");
    return `M ${xScale(0)},${yScale(0)} L ${top} L ${xScale(data.length - 1)},${yScale(0)} Z`;
  };

  return (
    <div className={cn("rounded-xl border border-zinc-800/50 bg-zinc-900/20 p-4", compact ? "overflow-hidden" : "")}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className="text-blue-400" />
        <span className="text-xs font-semibold text-white/70">Cumulative Flow</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {data.map((d, i) => (
          i % Math.max(Math.floor(data.length / 10), 1) === 0 && (
            <line key={i} x1={xScale(i)} y1={padding.top} x2={xScale(i)} y2={height - padding.bottom} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          )
        ))}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(255,255,255,0.1)" />
        {statusKeys.map((key, idx) => (
          <path key={key} d={buildAreaPath(key, COLORS[idx % COLORS.length], idx)} fill={COLORS[idx % COLORS.length]} fillOpacity={0.15 + (idx * 0.05)} />
        ))}
      </svg>
      {!compact && (
        <div className="flex flex-wrap gap-3 mt-3">
          {statusKeys.map((key, idx) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-[10px] text-white/50 capitalize">{key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CumulativeFlowDiagram;
