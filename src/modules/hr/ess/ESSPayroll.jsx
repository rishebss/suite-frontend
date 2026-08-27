import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Search,
  Loader,
  AlertCircle,
  DollarSign,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { payrollAPI } from "../services/hrAPI";
import { formatCurrency } from "../utils/helpers";

export const ESSPayroll = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [salary, setSalary] = useState(null);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchMonth, setSearchMonth] = useState("");

  useEffect(() => {
    fetchPayrollData();
  }, [selectedYear]);

  const fetchPayrollData = async () => {
    setLoadingState(true);
    try {
      const [salaryRes, payrollRes] = await Promise.all([
        payrollAPI.getEmployeeSalary().catch(() => ({ data: [] })),
        payrollAPI.getPayroll({ year: selectedYear }).catch(() => ({ data: [] })),
      ]);

      if (salaryRes.data && salaryRes.data.length > 0) {
        setSalary(salaryRes.data[0]);
      }
      setPayrollRecords(payrollRes.data || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const filteredRecords = payrollRecords.filter(
    (record) => !searchMonth || record.payroll_period?.toLowerCase().includes(searchMonth.toLowerCase())
  );

  const calculateYTD = (field) =>
    filteredRecords.reduce((sum, r) => sum + (r[field] || 0), 0);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "APPROVED": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "PROCESSING": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      default: return "bg-white/10 text-white/40";
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/ess')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            <DollarSign size={10} className="text-purple-400" />
            Employee Self-Service
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <DollarSign size={32} className="text-purple-500" />
            Payroll & Salary
          </h1>
          <p className="text-sm text-white/40 font-medium">
            View payslips, salary structure, and YTD earnings.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Current Salary Summary */}
        {salary && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign size={18} className="text-purple-400" />
                Current Salary Structure
              </h2>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-1">CTC (Annual)</p>
                <p className="text-xl font-bold text-white">₹{salary.ctc?.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-1">Gross Salary</p>
                <p className="text-xl font-bold text-white">₹{salary.gross_salary?.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-1">Basic Salary</p>
                <p className="text-xl font-bold text-white">₹{salary.basic_salary?.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <p className="text-xs text-emerald-400/60 mb-1">Net Salary (Monthly)</p>
                <p className="text-xl font-bold text-emerald-400">₹{salary.net_salary?.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-4">Effective from: {salary.effective_from}</p>
          </div>
        )}

        {/* YTD Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-white/40 mb-1">YTD Gross Salary</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(calculateYTD("gross_salary"))}</p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-white/40 mb-1">YTD Net Salary</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(calculateYTD("net_salary"))}</p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-white/40 mb-1">Total Deductions YTD</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(calculateYTD("total_deductions"))}</p>
          </div>
        </div>

        {/* Payroll Records */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-white/50" />
              Payslips
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text" placeholder="Search by month..."
                  value={searchMonth}
                  onChange={(e) => setSearchMonth(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-white/30 w-48"
                />
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Period</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white/40">Gross</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white/40">Deductions</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white/40">Net Salary</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{record.payroll_period}</td>
                      <td className="px-6 py-4 text-sm text-white/60 text-right">{formatCurrency(record.gross_salary)}</td>
                      <td className="px-6 py-4 text-sm text-white/60 text-right">{formatCurrency(record.total_deductions)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-400 text-right">{formatCurrency(record.net_salary)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors inline-flex items-center gap-1.5">
                          <Download size={12} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
              <DollarSign size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-1">No payslips available</p>
              <p className="text-white/30 text-xs">No payslips found for {selectedYear}.</p>
            </div>
          )}
        </div>

        {/* Salary Certificate */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            Salary Certificate
          </h3>
          <p className="text-sm text-white/50 mb-4">
            Request a signed salary certificate for loan applications, visa processing, or other purposes.
          </p>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
            Request Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ESSPayroll;
