import React, { useEffect, useState } from "react";
import {
  Shield,
  ChevronLeft,
  Loader,
  AlertCircle,
  CheckCircle2,
  Calendar,
  TrendingUp,
  DollarSign,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { complianceAPI, lwfAPI } from "../services/hrAPI";
import { formatDate } from "../utils/helpers";

export const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pfConfig: null,
    esiConfig: null,
    tdsConfig: null,
    gratuityConfig: null,
    bonusConfig: null,
    lwfConfigs: [],
    lwfSummary: [],
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [overdueEvents, setOverdueEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        pfRes, esiRes, tdsRes, gratuityRes, bonusRes,
        upcomingRes, overdueRes, lwfRes, lwfSumRes
      ] = await Promise.all([
        complianceAPI.getPFConfigs().catch(() => ({ data: [] })),
        complianceAPI.getESIConfigs().catch(() => ({ data: [] })),
        complianceAPI.getTDSConfigs().catch(() => ({ data: [] })),
        complianceAPI.getGratuityConfigs().catch(() => ({ data: [] })),
        complianceAPI.getBonusConfigs().catch(() => ({ data: [] })),
        complianceAPI.getUpcomingCompliance(60).catch(() => ({ data: [] })),
        complianceAPI.getOverdueCompliance().catch(() => ({ data: [] })),
        lwfAPI.getConfigs().catch(() => ({ data: [] })),
        lwfAPI.getSummaryByState(new Date().getFullYear()).catch(() => ({ data: [] })),
      ]);

      setStats({
        pfConfig: pfRes.data?.results?.[0] || pfRes.data?.[0] || null,
        esiConfig: esiRes.data?.results?.[0] || esiRes.data?.[0] || null,
        tdsConfig: tdsRes.data?.results?.[0] || tdsRes.data?.[0] || null,
        gratuityConfig: gratuityRes.data?.results?.[0] || gratuityRes.data?.[0] || null,
        bonusConfig: bonusRes.data?.results?.[0] || bonusRes.data?.[0] || null,
        lwfConfigs: lwfRes.data?.results || lwfRes.data || [],
        lwfSummary: lwfSumRes.data?.results || lwfSumRes.data || [],
      });
      setUpcomingEvents(upcomingRes.data?.results || upcomingRes.data || []);
      setOverdueEvents(overdueRes.data?.results || overdueRes.data || []);
    } catch (err) {
      console.error("Failed to load compliance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (id, title) => {
    try {
      await complianceAPI.markComplianceCompleted(id, `Completed: ${title}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, status }) => (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-white/40">{title}</p>
        <div className={`p-2 rounded-lg ${
          color === "blue" ? "bg-blue-500/10 text-blue-400" :
          color === "green" ? "bg-green-500/10 text-green-400" :
          color === "orange" ? "bg-orange-500/10 text-orange-400" :
          color === "red" ? "bg-red-500/10 text-red-400" :
          "bg-purple-500/10 text-purple-400"
        }`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
      {status && (
        <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
          status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
          status === "warning" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
          "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {status === "active" ? "Configured" : status === "warning" ? "Needs Review" : "Not Set"}
        </span>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Shield size={32} className="text-red-500" />
            Compliance & Statutory
          </h1>
          <p className="text-sm text-white/40 font-medium">
            PF, ESI, PT, TDS, Gratuity & Bonus — automated statutory compliance.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "compliance", label: "Compliance Calendar", icon: Calendar },
            { id: "lwf", label: "LWF Compliance", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-red-500 animate-spin mr-2" />
            <span className="text-white/40">Loading compliance data...</span>
          </div>
        ) : activeTab === "overview" ? (
          <div className="space-y-8">
            {/* Statutory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Provident Fund (PF)"
                value={stats.pfConfig ? `${stats.pfConfig.employee_contribution_pct}% Employee` : "Not Configured"}
                subtitle={stats.pfConfig ? `Employer: ${stats.pfConfig.employer_epf_pct}% EPF + ${stats.pfConfig.employer_eps_pct}% EPS` : "Set up PF configuration"}
                icon={Shield}
                color="blue"
                status={stats.pfConfig ? "active" : "warning"}
              />
              <StatCard
                title="Employee State Insurance (ESI)"
                value={stats.esiConfig ? `${stats.esiConfig.employee_contribution_pct}% Employee` : "Not Configured"}
                subtitle={stats.esiConfig ? `Employer: ${stats.esiConfig.employer_contribution_pct}% | Ceiling: ₹${stats.esiConfig.wage_ceiling?.toLocaleString('en-IN')}` : "Set up ESI configuration"}
                icon={Shield}
                color="green"
                status={stats.esiConfig ? "active" : "warning"}
              />
              <StatCard
                title="Professional Tax (PT)"
                value={stats.pfConfig ? "State-wise Slabs" : "Configure Slabs"}
                subtitle="Multi-state PT slab management"
                icon={FileText}
                color="orange"
                status="warning"
              />
              <StatCard
                title="TDS / Income Tax"
                value={stats.tdsConfig ? `FY ${stats.tdsConfig.financial_year}` : "Not Configured"}
                subtitle={stats.tdsConfig ? `Old Regime: ₹${stats.tdsConfig.standard_deduction_old?.toLocaleString('en-IN')} Std. Deduction` : "Set up TDS for the financial year"}
                icon={DollarSign}
                color="red"
                status={stats.tdsConfig ? "active" : "warning"}
              />
              <StatCard
                title="Gratuity"
                value={stats.gratuityConfig ? `${stats.gratuityConfig.formula_numerator}/${stats.gratuityConfig.formula_denominator} × Years` : "Not Configured"}
                subtitle={stats.gratuityConfig ? `${stats.gratuityConfig.min_service_years} years min. service` : "Configure gratuity rules"}
                icon={TrendingUp}
                color="purple"
                status={stats.gratuityConfig ? "active" : "warning"}
              />
              <StatCard
                title="Bonus"
                value={stats.bonusConfig ? `${stats.bonusConfig.minimum_bonus_pct}% – ${stats.bonusConfig.maximum_bonus_pct}%` : "Not Configured"}
                subtitle={stats.bonusConfig ? `Ceiling: ₹${stats.bonusConfig.wage_ceiling?.toLocaleString('en-IN')} | FY ${stats.bonusConfig.financial_year}` : "Set up bonus rules"}
                icon={DollarSign}
                color="green"
                status={stats.bonusConfig ? "active" : "warning"}
              />
            </div>

            {/* Compliance Calendar Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-yellow-400" />
                  Upcoming Compliance Due Dates
                </h2>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-white/40">No upcoming compliance events in the next 60 days.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                        <div>
                          <p className="text-sm font-medium text-white">{event.title}</p>
                          <p className="text-xs text-white/40">{event.compliance_type} — {event.frequency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-yellow-400">{formatDate(event.due_date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400" />
                  Overdue Compliance
                </h2>
                {overdueEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-white/40">No overdue compliance items. All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overdueEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <div>
                          <p className="text-sm font-medium text-white">{event.title}</p>
                          <p className="text-xs text-white/40">{event.compliance_type} — Due: {formatDate(event.due_date)}</p>
                        </div>
                        <button
                          onClick={() => handleMarkCompleted(event.id, event.title)}
                          className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors"
                        >
                          Mark Done
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
              <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/hr/admin/compliance/calendar')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition-all"
                >
                  View Full Compliance Calendar
                </button>
                <button
                  onClick={() => navigate('/hr/admin/employees')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition-all"
                >
                  Generate PF ECR Report
                </button>
                <button
                  onClick={() => navigate('/hr/admin/employees')}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition-all"
                >
                  Generate ESI Challan
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "compliance" ? (
          /* Compliance Calendar Tab */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Full Compliance Calendar</h2>
              <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                {upcomingEvents.length + overdueEvents.length} events
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full bg-[#0a0a0a]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Frequency</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Due Date</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...overdueEvents, ...upcomingEvents].length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-white/40">No compliance events found.</td></tr>
                  ) : (
                    [...overdueEvents, ...upcomingEvents].map((event) => (
                      <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            event.compliance_type === 'PF' ? 'bg-blue-500/10 text-blue-400' :
                            event.compliance_type === 'ESI' ? 'bg-green-500/10 text-green-400' :
                            event.compliance_type === 'TDS' ? 'bg-red-500/10 text-red-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>{event.compliance_type}</span>
                        </td>
                        <td className="px-6 py-4 text-white text-sm font-medium">{event.title}</td>
                        <td className="px-6 py-4 text-white/60 text-sm">{event.frequency}</td>
                        <td className="px-6 py-4 text-white/70 text-sm">{formatDate(event.due_date)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            event.status === 'OVERDUE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            event.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>{event.status}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {event.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleMarkCompleted(event.id, event.title)}
                              className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* LWF Compliance Tab */
          <div className="space-y-8 animate-fade-in">
            {/* Config List */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Labour Welfare Fund Slab Configurations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.lwfConfigs.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No LWF configurations found.</p>
                ) : (
                  stats.lwfConfigs.map((cfg) => (
                    <div key={cfg.id} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white">{cfg.state}</h3>
                        <p className="text-xs text-zinc-400 mt-1">
                          Employee: ₹{cfg.employee_contribution} | Employer: ₹{cfg.employer_contribution}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Frequency: {cfg.frequency}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        cfg.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {cfg.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Contributions Summary */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">LWF Contribution Deductions Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4">State</th>
                      <th className="px-6 py-4">Transactions Count</th>
                      <th className="px-6 py-4">Employee Share</th>
                      <th className="px-6 py-4">Employer Share</th>
                      <th className="px-6 py-4 font-bold text-white">Total Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {stats.lwfSummary.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-zinc-500">No LWF contribution summaries available for the current year.</td>
                      </tr>
                    ) : (
                      stats.lwfSummary.map((sum, index) => (
                        <tr key={index} className="hover:bg-zinc-900/40 transition">
                          <td className="px-6 py-4 font-semibold text-white">{sum.state}</td>
                          <td className="px-6 py-4 text-zinc-400">{sum.count} deductions</td>
                          <td className="px-6 py-4 text-zinc-400">₹{parseFloat(sum.total_employee).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 text-zinc-400">₹{parseFloat(sum.total_employer).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4 font-bold text-emerald-400">₹{parseFloat(sum.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboard;
