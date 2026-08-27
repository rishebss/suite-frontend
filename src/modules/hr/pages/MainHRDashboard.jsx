import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { employeeAPI, attendanceAPI, leaveAPI, masterDataAPI, complianceAPI, recruitmentAPI } from "../services/hrAPI";
import HROverview from "../components/HROverview";
import HRModules from "../components/HRModules";
import HRAdminView from "../components/HRAdminView";

const TABS = {
  OVERVIEW: "overview",
  MODULES: "modules",
  ADMIN: "admin",
};

const MainHRDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeaves: 0,
    openRequisitions: 0,
    overdueCompliance: 0,
    upcomingEvents: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, leaveRes, reqRes, compRes, holidayRes] = await Promise.all([
        employeeAPI.getEmployees().catch(() => ({ data: { results: [] } })),
        attendanceAPI.getTodayAttendance().catch(() => ({ data: [] })),
        leaveAPI.getLeaveApplications({ approval_status: "PENDING" }).catch(() => ({ data: { results: [] } })),
        recruitmentAPI.getRequisitions().catch(() => ({ data: { results: [] } })),
        complianceAPI.getOverdueCompliance().catch(() => ({ data: [] })),
        masterDataAPI.getCurrentYearHolidays().catch(() => ({ data: [] })),
      ]);

      const employees = empRes.data?.results || empRes.data || [];
      const todayAttendance = attRes.data || [];
      const pendingLeaves = leaveRes.data?.results || leaveRes.data || [];
      const requisitions = reqRes.data?.results || reqRes.data || [];
      const overdueItems = compRes.data?.results || compRes.data || [];
      const holidays = holidayRes.data?.results || holidayRes.data || [];

      setData({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === "ACTIVE").length,
        presentToday: todayAttendance.filter((a) => a.status === "PRESENT").length,
        onLeave: todayAttendance.filter((a) => a.status === "ON_LEAVE").length,
        pendingLeaves: pendingLeaves.length,
        openRequisitions: requisitions.filter((r) => r.status === "Approved" || r.status === "Pending").length,
        overdueCompliance: overdueItems.length,
        upcomingEvents: [
          ...pendingLeaves.slice(0, 3).map((l) => ({
            type: "leave",
            title: `${l.employee_name || "Employee"} — ${l.leave_type_name || "Leave"}`,
            date: l.date_from,
            priority: "medium",
          })),
          ...holidays.slice(0, 3).map((h) => ({
            type: "holiday",
            title: h.name,
            date: h.holiday_date,
            priority: "low",
          })),
          ...overdueItems.slice(0, 2).map((c) => ({
            type: "compliance",
            title: `${c.compliance_type}: ${c.title}`,
            date: c.due_date,
            priority: "high",
          })),
        ],
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col h-full bg-black">
        <header className="px-10 py-8 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-white">HR Dashboard</h1>
          <p className="text-sm text-white/40 font-medium mt-1">Loading your workspace...</p>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader size={24} className="text-blue-400 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* === UNIFIED HEADER === */}
      <header className="px-10 py-8 border-b border-zinc-800 shrink-0 bg-black/50 backdrop-blur-xl z-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">HR Dashboard</h1>
          <p className="text-sm text-white/40 font-medium">
            Enterprise HR management at a glance
          </p>
        </div>
      </header>

      {/* === TABS === */}
      <div className="px-10 py-6 shrink-0 bg-black/30">
        <div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md inline-flex">
          <div 
            className={cn(
              "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
              activeTab === TABS.OVERVIEW 
                ? "left-0 w-1/3 rounded-l rounded-r-none bg-blue-500/20" 
                : activeTab === TABS.MODULES
                ? "left-1/3 w-1/3 bg-blue-500/20"
                : "left-2/3 w-1/3 rounded-r rounded-l-none bg-blue-500/20"
            )}
          />
          <button
            onClick={() => setActiveTab(TABS.OVERVIEW)}
            className={cn(
              "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center text-center w-1/3 whitespace-nowrap",
              activeTab === TABS.OVERVIEW ? "text-blue-400" : "text-white/50 hover:text-white/80"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab(TABS.MODULES)}
            className={cn(
              "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center text-center w-1/3 whitespace-nowrap",
              activeTab === TABS.MODULES ? "text-blue-400" : "text-white/50 hover:text-white/80"
            )}
          >
            Modules
          </button>
          <button
            onClick={() => setActiveTab(TABS.ADMIN)}
            className={cn(
              "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center text-center w-1/3 whitespace-nowrap",
              activeTab === TABS.ADMIN ? "text-blue-400" : "text-white/50 hover:text-white/80"
            )}
          >
            Admin
          </button>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {activeTab === TABS.OVERVIEW && <HROverview data={data} />}
        {activeTab === TABS.MODULES && <HRModules />}
        {activeTab === TABS.ADMIN && <HRAdminView />}
      </main>
    </div>
  );
};

export default MainHRDashboard;
