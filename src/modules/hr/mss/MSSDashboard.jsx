import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader,
  ChevronLeft,
  UserCheck,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { employeeAPI, leaveAPI, attendanceAPI } from "../services/hrAPI";

export const MSSDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    total: 0,
    present: 0,
    onLeave: 0,
    absent: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamBirthdays, setTeamBirthdays] = useState([]);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const empRes = await employeeAPI.getEmployees();
      const employees = empRes.data?.results || empRes.data || [];

      const attRes = await attendanceAPI.getTodayAttendance();
      const todayAttendance = attRes.data || [];

      const leaveRes = await leaveAPI.getLeaveApplications({ approval_status: "PENDING" });
      const pending = leaveRes.data?.results || leaveRes.data || [];

      const presentCount = todayAttendance.filter(
        (a) => a.status === "PRESENT"
      ).length;
      const leaveCount = todayAttendance.filter(
        (a) => a.status === "ON_LEAVE"
      ).length;
      const absentCount = todayAttendance.filter(
        (a) => a.status === "ABSENT"
      ).length;

      setTeamStats({
        total: employees.length,
        present: presentCount,
        onLeave: leaveCount,
        absent: absentCount,
      });

      setPendingLeaves(pending.slice(0, 5));

      const todayDate = new Date();
      const birthdays = employees.filter((emp) => {
        if (!emp.date_of_birth) return false;
        const dob = new Date(emp.date_of_birth);
        const thisYear = new Date(
          todayDate.getFullYear(),
          dob.getMonth(),
          dob.getDate()
        );
        const diffDays = Math.ceil(
          (thisYear - todayDate) / (1000 * 60 * 60 * 24)
        );
        return diffDays >= 0 && diffDays <= 14;
      });
      setTeamBirthdays(birthdays);
    } catch (err) {
      console.error("Failed to load manager data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveAPI.approveLeave(id, "Approved by manager");
      fetchManagerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveAPI.rejectLeave(id, "Rejected by manager");
      fetchManagerData();
    } catch (err) {
      console.error(err);
    }
  };

  const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/40 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${
          color === "blue" ? "bg-blue-500/10 text-blue-400" :
          color === "green" ? "bg-green-500/10 text-green-400" :
          color === "orange" ? "bg-orange-500/10 text-orange-400" :
          "bg-red-500/10 text-red-400"
        }`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white/40">Loading your team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            <UserCheck size={10} className="text-green-400" />
            Manager Self-Service
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users size={32} className="text-green-500" />
            Manager Dashboard
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Real-time view of your team's attendance, leave, and performance.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatsCard title="Team Size" value={teamStats.total} icon={Users} color="blue" subtitle="Total team members" />
          <StatsCard title="Present Today" value={teamStats.present} icon={Clock} color="green" subtitle="Checked in" />
          <StatsCard title="On Leave" value={teamStats.onLeave} icon={Calendar} color="orange" subtitle="Approved leaves" />
          <StatsCard title="Absent" value={teamStats.absent} icon={AlertCircle} color="red" subtitle="Marked absent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar size={20} className="text-yellow-400" />
                Pending Leave Approvals
              </h2>
              {pendingLeaves.length > 0 && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2.5 py-1 rounded-full font-medium">
                  {pendingLeaves.length} pending
                </span>
              )}
            </div>
            <div className="space-y-3">
              {pendingLeaves.length === 0 ? (
                <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">All caught up! No pending leave requests.</p>
                </div>
              ) : (
                pendingLeaves.map((leave) => (
                  <div key={leave.id} className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-white">{leave.employee_name || "Employee"}</p>
                        <p className="text-xs text-white/50 mt-0.5">{leave.leave_type_name}</p>
                      </div>
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                        {leave.number_of_days} day(s)
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{leave.date_from} → {leave.date_to}</p>
                    <p className="text-xs text-white/40 mb-4 italic">"{leave.reason?.slice(0, 80)}"</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(leave.id)}
                        className="flex-1 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-all text-sm font-medium">
                        <CheckCircle2 size={14} className="inline mr-1" /> Approve
                      </button>
                      <button onClick={() => handleReject(leave.id)}
                        className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium">
                        <XCircle size={14} className="inline mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-pink-400" />
                Upcoming Celebrations
              </h2>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                {teamBirthdays.length === 0 ? (
                  <p className="text-sm text-white/40">No birthdays or anniversaries in the next 14 days.</p>
                ) : (
                  <div className="space-y-3">
                    {teamBirthdays.map((emp) => (
                      <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-white/40">Birthday 🎂</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-400" />
                Quick Reports
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => navigate("/hr/admin")}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3"><Users size={18} className="text-blue-400" /><span className="text-sm font-medium text-white">Team Attendance Report</span></div>
                  <span className="text-white/30">→</span>
                </button>
                <button onClick={() => navigate("/hr/admin/employees")}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3"><Calendar size={18} className="text-green-400" /><span className="text-sm font-medium text-white">Team Leave Summary</span></div>
                  <span className="text-white/30">→</span>
                </button>
                <button onClick={() => navigate("/hr/admin/performance")}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3"><BarChart3 size={18} className="text-orange-400" /><span className="text-sm font-medium text-white">Performance Overview</span></div>
                  <span className="text-white/30">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MSSDashboard;
