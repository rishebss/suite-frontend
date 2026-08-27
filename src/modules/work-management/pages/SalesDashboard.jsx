import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp, Trophy, BarChart3, RefreshCw, DollarSign, Target, Users } from "lucide-react";
import { useSalesAttainment, useSalesLeaderboard, useSalesForecast } from "../hooks/useSalesDashboard";
import AttainmentChart from "../components/sales-mode/AttainmentChart";
import Leaderboard from "../components/sales-mode/Leaderboard";
import ForecastWidget from "../components/sales-mode/ForecastWidget";

const TABS = [
  { id: "attainment", label: "Attainment", icon: Target },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

const SalesDashboard = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("attainment");

  const { attainment, loading: attainmentLoading, refetch: refetchAttainment } = useSalesAttainment();
  const { leaderboard, loading: boardLoading, refetch: refetchBoard } = useSalesLeaderboard();
  const { forecast, loading: forecastLoading, refetch: refetchForecast } = useSalesForecast(
    projectId ? { project: projectId } : {}
  );

  const handleRefresh = () => {
    refetchAttainment();
    refetchBoard();
    refetchForecast();
  };

  const loading = attainmentLoading || boardLoading || forecastLoading;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-10 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => projectId ? navigate(`/work/${workspaceId}/${projectId}`) : navigate(`/work/${workspaceId}`)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-bold text-white">
            <span className="text-amber-400">Sales</span> Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-zinc-900 rounded-lg border border-zinc-800 p-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all",
                    activeTab === tab.id
                      ? "bg-zinc-800 text-white"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw size={12} className={cn(loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {activeTab === "attainment" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/20 flex items-center justify-center">
                <Target size={16} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Target Attainment</h2>
                <p className="text-xs text-white/40">Real-time progress against sales targets</p>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
              <AttainmentChart attainment={attainment} loading={attainmentLoading} />
            </div>
          </div>
        )}

        {activeTab === "forecast" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forecast Main */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 flex items-center justify-center">
                  <TrendingUp size={16} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Pipeline Forecast</h2>
                  <p className="text-xs text-white/40">Weighted revenue forecast from active deals</p>
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
                <ForecastWidget forecast={forecast} loading={forecastLoading} />
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 flex items-center justify-center">
                  <BarChart3 size={16} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Quick Stats</h2>
                  <p className="text-xs text-white/40">At a glance</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={14} className="text-emerald-400" />
                    <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Pipeline Value</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {forecast ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(forecast.total_pipeline_value) : "-"}
                  </p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-blue-400" />
                    <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Weighted Forecast</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {forecast ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(forecast.total_weighted_forecast) : "-"}
                  </p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-amber-400" />
                    <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Active Deals</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{forecast?.deal_count || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 flex items-center justify-center">
                <Trophy size={16} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sales Leaderboard</h2>
                <p className="text-xs text-white/40">Top performers ranked by achieved revenue</p>
              </div>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
              <Leaderboard leaderboard={leaderboard} loading={boardLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SalesDashboard;
