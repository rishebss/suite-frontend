import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  Loader,
  ArrowRight,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sun,
  Repeat,
  Gift,
} from "lucide-react";
import { useHR } from "../context/HRContext";
import {
  attendanceAPI,
  leaveAPI,
  payrollAPI,
} from "../services/hrAPI";

export const ESSDashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    setLoadingState,
    error,
    setErrorState,
    leaveBalance,
    updateLeaveBalance,
    todayAttendance,
    setTodayAttendance,
    employeeSalary,
    setEmployeeSalary,
  } = useHR();

  const [stats, setStats] = useState({
    leaveBalance: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingState(true);
    try {
      const [attendanceRes, leaveBalRes, salaryRes] = await Promise.all([
        attendanceAPI.getTodayAttendance().catch(() => ({ data: [] })),
        leaveAPI.getCurrentYearBalance().catch(() => ({ data: [] })),
        payrollAPI.getEmployeeSalary().catch(() => ({ data: [] })),
      ]);

      if (attendanceRes.data && attendanceRes.data.length > 0) {
        setTodayAttendance(attendanceRes.data[0]);
      }
      if (leaveBalRes.data) {
        updateLeaveBalance(leaveBalRes.data);
        const totalLeave =
          leaveBalRes.data?.reduce(
            (sum, item) => sum + (Number(item.current_balance) || 0),
            0,
          ) || 0;
        setStats((prev) => ({ ...prev, leaveBalance: totalLeave }));
      }
      const salaryList = salaryRes.data?.results || salaryRes.data || [];
      if (salaryList.length > 0) {
        setEmployeeSalary(salaryList[0]);
      }
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/40 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${
          color === "blue" ? "bg-blue-500/10 text-blue-400" :
          color === "green" ? "bg-green-500/10 text-green-400" :
          color === "purple" ? "bg-purple-500/10 text-purple-400" :
          color === "orange" ? "bg-orange-500/10 text-orange-400" :
          color === "yellow" ? "bg-yellow-500/10 text-yellow-400" :
          color === "pink" ? "bg-pink-500/10 text-pink-400" :
          color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
          "bg-white/10 text-white/40"
        }`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  const ModuleCard = ({ title, description, icon: Icon, path, color = "blue", badge }) => (
    <div
      onClick={() => navigate(path)}
      className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          color === "blue" ? "bg-blue-500/10 text-blue-400" :
          color === "green" ? "bg-green-500/10 text-green-400" :
          color === "purple" ? "bg-purple-500/10 text-purple-400" :
          color === "orange" ? "bg-orange-500/10 text-orange-400" :
          color === "yellow" ? "bg-yellow-500/10 text-yellow-400" :
          color === "pink" ? "bg-pink-500/10 text-pink-400" :
          color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
          "bg-white/10 text-white/40"
        }`}>
          <Icon size={24} />
        </div>
        {badge && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{badge}</span>
        )}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 mb-4">{description}</p>
      <div className="flex items-center gap-1 text-xs font-medium text-blue-400 group-hover:gap-2 transition-all">
        Open <ArrowRight size={12} />
      </div>
    </div>
  );

  if (loading && !todayAttendance && !employeeSalary) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            <User size={10} className="text-blue-400" />
            Employee Self-Service
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Employee Portal
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Manage your attendance, leave, payroll, and profile.
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Available Leave"
            value={`${Math.round(stats.leaveBalance)} days`}
            subtitle="This year"
            icon={Calendar}
            color="blue"
          />
          {todayAttendance ? (
            <>
              <StatCard
                title="Check-in Today"
                value={todayAttendance.check_in_time || "--:--"}
                subtitle={todayAttendance.status?.replace(/_/g, " ")}
                icon={Clock}
                color="green"
              />
              <StatCard
                title="Working Hours"
                value={`${todayAttendance.working_hours || 0}h`}
                subtitle="Today"
                icon={Clock}
                color="purple"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Check-in Today"
                value="--:--"
                subtitle="Not checked in"
                icon={Clock}
                color="green"
              />
              <StatCard
                title="Working Hours"
                value="0h"
                subtitle="Today"
                icon={Clock}
                color="purple"
              />
            </>
          )}
          {employeeSalary ? (
            <StatCard
              title="Monthly CTC"
              value={`₹${(employeeSalary.ctc / 12)?.toLocaleString("en-IN")}`}
              subtitle="Net salary"
              icon={DollarSign}
              color="green"
            />
          ) : (
            <StatCard
              title="Monthly CTC"
              value="—"
              subtitle="Not available"
              icon={DollarSign}
              color="green"
            />
          )}
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <ModuleCard
            title="Attendance"
            description="View records, check in/out, and track your time."
            icon={Clock}
            path="attendance"
            color="blue"
            badge="Daily"
          />
          <ModuleCard
            title="Leave"
            description={`${Math.round(stats.leaveBalance)} days available — apply and track requests.`}
            icon={Calendar}
            path="leave"
            color="green"
            badge="ESS"
          />
          <ModuleCard
            title="Regularization"
            description="Request corrections for missed or incorrect attendance."
            icon={RotateCcw}
            path="regularization"
            color="yellow"
            badge="ESS"
          />
          <ModuleCard
            title="Overtime"
            description="Apply for overtime hours and approvals."
            icon={Sun}
            path="overtime"
            color="orange"
            badge="ESS"
          />
          <ModuleCard
            title="Shift Swap"
            description="Request to swap shifts with colleagues."
            icon={Repeat}
            path="shift-swap"
            color="purple"
            badge="ESS"
          />
          <ModuleCard
            title="Comp Off"
            description="Apply for compensatory off."
            icon={Gift}
            path="comp-off"
            color="pink"
            badge="ESS"
          />
          <ModuleCard
            title="Payroll"
            description={employeeSalary ? `CTC ₹${(employeeSalary.ctc / 12)?.toLocaleString("en-IN")}/mo` : "View payslips and salary info."}
            icon={DollarSign}
            path="payroll"
            color="emerald"
            badge="Monthly"
          />
          <ModuleCard
            title="Profile"
            description="Manage personal info, documents, and bank details."
            icon={User}
            path="profile"
            color="orange"
            badge="Profile"
          />
        </div>

        {/* Active Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-400" />
              Today's Status
            </h2>
            {todayAttendance ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                  <span className="text-sm text-white/50">Status</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                    todayAttendance.status === "PRESENT" ? "bg-green-500/10 text-green-400" :
                    todayAttendance.status === "HALF_DAY" ? "bg-yellow-500/10 text-yellow-400" :
                    todayAttendance.status === "WFH" ? "bg-blue-500/10 text-blue-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {todayAttendance.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                  <span className="text-sm text-white/50">Check-in</span>
                  <span className="text-sm font-medium text-white">{todayAttendance.check_in_time || "—"}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                  <span className="text-sm text-white/50">Check-out</span>
                  <span className="text-sm font-medium text-white">{todayAttendance.check_out_time || "—"}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03]">
                  <span className="text-sm text-white/50">Working Hours</span>
                  <span className="text-sm font-medium text-white">{todayAttendance.working_hours || 0}h</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm">No attendance record for today.</p>
                <button
                  onClick={() => navigate("attendance")}
                  className="mt-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
                >
                  Check In Now
                </button>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("attendance")}
                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Check In / Out</p>
                    <p className="text-xs text-white/40">Record your daily attendance</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-white/30" />
              </button>
              <button
                onClick={() => navigate("leave")}
                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Apply for Leave</p>
                    <p className="text-xs text-white/40">Submit a new leave request</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-white/30" />
              </button>
              <button
                onClick={() => navigate("payroll")}
                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={16} className="text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-white">View Payslips</p>
                    <p className="text-xs text-white/40">Download monthly salary slips</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-white/30" />
              </button>
            </div>
          </div>
        </div>

        {/* Salary Structure */}
        {employeeSalary && (
          <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-400" />
              Salary Structure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-1">CTC (Annual)</p>
                <p className="text-xl font-bold text-white">₹{Number(employeeSalary.ctc).toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-1">Gross Salary</p>
                <p className="text-xl font-bold text-white">₹{Number(employeeSalary.gross_salary).toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-1">Basic Salary</p>
                <p className="text-xl font-bold text-white">₹{Number(employeeSalary.basic_salary).toLocaleString("en-IN")}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                <p className="text-xs text-emerald-400/60 mb-1">Net Salary</p>
                <p className="text-xl font-bold text-emerald-400">₹{Number(employeeSalary.net_salary).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-4">Effective from: {employeeSalary.effective_from}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESSDashboard;
