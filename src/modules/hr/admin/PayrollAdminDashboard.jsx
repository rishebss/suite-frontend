import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  ChevronLeft,
  Loader,
  AlertCircle,
  CheckCircle2,
  FileText,
  Download,
  BarChart3,
  Users,
  TrendingUp,
  Play,
  CheckSquare,
  RefreshCw,
} from "lucide-react";
import { payrollEnhancedAPI } from "../services/hrAPI";
import { formatCurrency } from "../utils/helpers";

const PAYROLL_TABS = {
  OVERVIEW: "overview",
  PROCESS: "process",
  REPORTS: "reports",
  BANK: "bank",
};

export const PayrollAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(PAYROLL_TABS.OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [testMode, setTestMode] = useState(true);

  const [stats, setStats] = useState(null);
  const [processResults, setProcessResults] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("salary_register");

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await payrollEnhancedAPI.getDashboardStats(selectedMonth, selectedYear);
      setStats(res.data);
    } catch (err) {
      setError("Failed to load payroll stats");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    setProcessing(true);
    setError(null);
    setSuccessMsg(null);
    setProcessResults(null);
    try {
      const res = await payrollEnhancedAPI.processPayroll(
        selectedMonth, selectedYear, testMode
      );
      setProcessResults(res.data);
      if (res.data.success > 0 || res.data.total > 0) {
        setSuccessMsg(
          testMode
            ? `Test run complete: ${res.data.success} processed, ${res.data.skipped} skipped, ${res.data.errors} errors`
            : `Payroll processed: ${res.data.success} employees, ${res.data.skipped} skipped`
        );
      }
      fetchDashboardStats();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process payroll");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await payrollEnhancedAPI.bulkApprove([], true);
      setSuccessMsg(res.data.status);
      fetchDashboardStats();
    } catch (err) {
      setError("Failed to approve payroll");
    } finally {
      setProcessing(false);
    }
  };

  const handleFetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (reportType === "salary_register") {
        res = await payrollEnhancedAPI.getSalaryRegister(selectedMonth, selectedYear);
      } else if (reportType === "department_summary") {
        res = await payrollEnhancedAPI.getDepartmentSummary(selectedMonth, selectedYear);
      } else if (reportType === "variance_report") {
        res = await payrollEnhancedAPI.getVarianceReport(selectedMonth, selectedYear);
      }
      setReportData(res?.data || []);
    } catch (err) {
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBankFile = async (format = "NEFT") => {
    setLoading(true);
    try {
      const res = await payrollEnhancedAPI.getBankFile(selectedMonth, selectedYear, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `salary_transfer_${format}_${selectedMonth}_${selectedYear}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`${format} file downloaded`);
    } catch (err) {
      setError("Failed to generate bank file");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg ${
          color === "green" ? "bg-green-500/10 text-green-400" :
          color === "red" ? "bg-red-500/10 text-red-400" :
          color === "purple" ? "bg-purple-500/10 text-purple-400" :
          "bg-blue-500/10 text-blue-400"
        }`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <DollarSign size={32} className="text-emerald-500" />
            Payroll Management
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Process, approve, and manage monthly payroll with statutory compliance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1} className="bg-[#0a0a0a] text-white">{new Date(2000, i).toLocaleString("default", { month: "long" })}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
            {Array.from({ length: 5 }, (_, i) => {
              const y = now.getFullYear() - 2 + i;
              return <option key={y} value={y} className="bg-[#0a0a0a] text-white">{y}</option>;
            })}
          </select>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-10 py-4 bg-black/30 border-b border-white/5">
        {Object.values(PAYROLL_TABS).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); if (tab === PAYROLL_TABS.REPORTS) handleFetchReport(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}>
            {tab === PAYROLL_TABS.OVERVIEW ? "Overview" : tab === PAYROLL_TABS.PROCESS ? "Process" : tab === PAYROLL_TABS.REPORTS ? "Reports" : "Bank File"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400 text-xs">Dismiss</button>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{successMsg}</p>
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-400/60 hover:text-green-400 text-xs">Dismiss</button>
          </div>
        )}

        {/* === OVERVIEW TAB === */}
        {activeTab === PAYROLL_TABS.OVERVIEW && (
          <div className="space-y-8">
            {loading && !stats ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard title="Gross Payroll" value={formatCurrency(stats.current_month.total_gross)} icon={DollarSign} color="blue"
                    subtitle={`${stats.current_month.employee_count} employees`} />
                  <StatCard title="Net Payroll" value={formatCurrency(stats.current_month.total_net)} icon={BarChart3} color="green"
                    subtitle={`Deductions: ${formatCurrency(stats.current_month.total_deductions)}`} />
                  <StatCard title="Approved" value={stats.current_month.approved} icon={CheckCircle2} color="purple"
                    subtitle={`${stats.current_month.paid} paid`} />
                  <StatCard title="YTD Gross" value={formatCurrency(stats.ytd.gross)} icon={TrendingUp} color="emerald"
                    subtitle={`Net: ${formatCurrency(stats.ytd.net)}`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
                    <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button onClick={() => setActiveTab(PAYROLL_TABS.PROCESS)}
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Play size={16} className="text-emerald-400" />
                          <span className="text-sm text-white">Process Payroll</span>
                        </div>
                        <span className="text-white/30">→</span>
                      </button>
                      <button onClick={handleBulkApprove} disabled={processing}
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between disabled:opacity-50">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-blue-400" />
                          <span className="text-sm text-white">Approve All Processed</span>
                        </div>
                        <span className="text-white/30">→</span>
                      </button>
                      <button onClick={() => navigate("/hr/admin/payroll/revisions")}
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingUp size={16} className="text-orange-400" />
                          <span className="text-sm text-white">Salary Revisions</span>
                        </div>
                        <span className="text-white/30">→</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-white/50" />
                      Month Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 rounded-lg bg-white/[0.03]">
                        <span className="text-sm text-white/50">Total Gross</span>
                        <span className="text-sm font-bold text-white">{formatCurrency(stats.current_month.total_gross)}</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-white/[0.03]">
                        <span className="text-sm text-white/50">Total Deductions</span>
                        <span className="text-sm font-bold text-red-400">{formatCurrency(stats.current_month.total_deductions)}</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-emerald-500/10">
                        <span className="text-sm text-white/50">Total Net Pay</span>
                        <span className="text-sm font-bold text-emerald-400">{formatCurrency(stats.current_month.total_net)}</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-lg bg-white/[0.03]">
                        <span className="text-sm text-white/50">Employees</span>
                        <span className="text-sm font-bold text-white">{stats.current_month.employee_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
                <DollarSign size={40} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No payroll data for this period.</p>
                <button onClick={() => setActiveTab(PAYROLL_TABS.PROCESS)}
                  className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20">
                  Process Payroll
                </button>
              </div>
            )}
          </div>
        )}

        {/* === PROCESS TAB === */}
        {activeTab === PAYROLL_TABS.PROCESS && (
          <div className="max-w-3xl space-y-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
              <h2 className="text-xl font-bold text-white mb-6">Payroll Processing</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={testMode} onChange={e => setTestMode(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-sm text-white/70">Test Mode (Draft — no live changes)</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleProcessPayroll} disabled={processing}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                    {processing ? <Loader className="w-4 h-4 animate-spin" /> : <Play size={16} />}
                    {processing ? "Processing..." : testMode ? "Run Test (Draft)" : "Process Payroll"}
                  </button>
                  <button onClick={() => { setTestMode(false); handleProcessPayroll(); }} disabled={processing}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20">
                    <RefreshCw size={16} /> Process Live
                  </button>
                </div>
              </div>
            </div>

            {processResults && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Processing Results
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{processResults.success || 0}</p>
                    <p className="text-xs text-white/40 mt-1">Processed</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{processResults.skipped || 0}</p>
                    <p className="text-xs text-white/40 mt-1">Skipped</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <p className="text-2xl font-bold text-red-400">{processResults.errors || 0}</p>
                    <p className="text-xs text-white/40 mt-1">Errors</p>
                  </div>
                </div>

                {processResults.details?.filter(d => d.status === "error").length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-red-400 mb-2">Errors:</p>
                    <div className="space-y-2">
                      {processResults.details.filter(d => d.status === "error").slice(0, 5).map((err, i) => (
                        <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-sm text-red-400">
                          {err.employee_name || err.employee_id}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* === REPORTS TAB === */}
        {activeTab === PAYROLL_TABS.REPORTS && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <select value={reportType} onChange={e => setReportType(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                <option value="salary_register" className="bg-[#0a0a0a] text-white">Salary Register</option>
                <option value="department_summary" className="bg-[#0a0a0a] text-white">Department Summary</option>
                <option value="variance_report" className="bg-[#0a0a0a] text-white">Variance Report</option>
              </select>
              <button onClick={handleFetchReport} disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw size={14} />}
                Generate
              </button>
            </div>

            {reportType === "salary_register" && reportData && Array.isArray(reportData) && (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full bg-[#0a0a0a]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-white/40">Employee</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-white/40">Gross</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-white/40">Deductions</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-white/40">Net</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-white/40">Arrears</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-white/40">Final</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase text-white/40">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reportData.length === 0 ? (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-white/40">No payroll records</td></tr>
                    ) : reportData.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm text-white">{row.employee_name}</td>
                        <td className="px-4 py-3 text-sm text-white/60 text-right">{formatCurrency(row.gross_salary)}</td>
                        <td className="px-4 py-3 text-sm text-red-400/60 text-right">{formatCurrency(row.total_deductions)}</td>
                        <td className="px-4 py-3 text-sm text-emerald-400 text-right font-medium">{formatCurrency(row.net_salary)}</td>
                        <td className="px-4 py-3 text-sm text-white/60 text-right">{formatCurrency(row.arrears)}</td>
                        <td className="px-4 py-3 text-sm text-white font-bold text-right">{formatCurrency(row.final_salary)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            row.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
                            row.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "department_summary" && reportData && Array.isArray(reportData) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportData.map((dept, i) => (
                  <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                    <h3 className="font-bold text-white mb-3">{dept.department || "Unassigned"}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-white/50">Employees</span><span className="text-white">{dept.employee_count}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Gross</span><span className="text-white">{formatCurrency(dept.total_gross)}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Deductions</span><span className="text-red-400">{formatCurrency(dept.total_deductions)}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Net</span><span className="text-emerald-400 font-bold">{formatCurrency(dept.total_net)}</span></div>
                    </div>
                  </div>
                ))}
                {reportData.length === 0 && (
                  <div className="col-span-full text-center py-8 text-white/40">No department data</div>
                )}
              </div>
            )}

            {reportType === "variance_report" && reportData && !Array.isArray(reportData) && (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4">Month-over-Month Variance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Gross Salary Variance</p>
                    <p className={`text-2xl font-bold ${(reportData.gross_variance_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {reportData.gross_variance_pct != null ? `${reportData.gross_variance_pct >= 0 ? '+' : ''}${reportData.gross_variance_pct.toFixed(2)}%` : 'N/A'}
                    </p>
                    <p className="text-xs text-white/40 mt-1">Prev: {formatCurrency(reportData.total_gross_previous)} → Curr: {formatCurrency(reportData.total_gross_current)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Net Salary Variance</p>
                    <p className={`text-2xl font-bold ${(reportData.net_variance_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {reportData.net_variance_pct != null ? `${reportData.net_variance_pct >= 0 ? '+' : ''}${reportData.net_variance_pct.toFixed(2)}%` : 'N/A'}
                    </p>
                    <p className="text-xs text-white/40 mt-1">Prev: {formatCurrency(reportData.total_net_previous)} → Curr: {formatCurrency(reportData.total_net_current)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Headcount Change</p>
                    <p className={`text-2xl font-bold ${(reportData.employee_count_current || 0) >= (reportData.employee_count_previous || 0) ? 'text-green-400' : 'text-red-400'}`}>
                      {reportData.employee_count_current || 0} <span className="text-sm text-white/40">({reportData.employee_count_previous || 0})</span>
                    </p>
                    <p className="text-xs text-white/40 mt-1">Current vs Previous period</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === BANK FILE TAB === */}
        {activeTab === PAYROLL_TABS.BANK && (
          <div className="max-w-xl space-y-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
              <h2 className="text-xl font-bold text-white mb-2">Bank File Generation</h2>
              <p className="text-sm text-white/50 mb-6">Generate NEFT/RTGS compliant bank transfer files for salary disbursement.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-white/50 mb-1">Period</label>
                    <p className="text-white font-medium">{new Date(2000, selectedMonth - 1).toLocaleString("default", { month: "long" })} {selectedYear}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleDownloadBankFile("NEFT")} disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download size={16} />}
                    Download NEFT File
                  </button>
                  <button onClick={() => handleDownloadBankFile("RTGS")} disabled={loading}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download size={16} />}
                    Download RTGS File
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="font-bold text-white mb-2">Format Details</h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">•</span> NEFT: Standard NEFT format with header, employee records, and footer</li>
                <li className="flex items-start gap-2"><span className="text-purple-400 mt-1">•</span> RTGS: Compatible format for RTGS transfers</li>
                <li className="flex items-start gap-2"><span className="text-white/30 mt-1">•</span> Includes Employee ID, Account Number, IFSC, Amount, and Name</li>
                <li className="flex items-start gap-2"><span className="text-white/30 mt-1">•</span> Only includes APPROVED payroll records</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollAdminDashboard;
