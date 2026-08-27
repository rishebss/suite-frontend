import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Loader,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { attendanceAPI } from "../services/hrAPI";
import { formatDate, formatTime } from "../utils/helpers";

const extractError = (err) =>
  err.response?.data?.error || err.response?.data?.detail || err.message || "Something went wrong";

export const ESSAttendance = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, showToast } = useHR();
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyStats, setMonthlyStats] = useState({ present: 0, absent: 0, halfDay: 0, wfh: 0 });

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceData = async () => {
    setLoadingState(true);
    try {
      const [todayRes, monthlyRes, attendanceRes] = await Promise.all([
        attendanceAPI.getTodayAttendance().catch(() => ({ data: [] })),
        attendanceAPI.getMonthlyReport(selectedMonth, selectedYear).catch(() => ({ data: {} })),
        attendanceAPI.getAttendance({ date__month: selectedMonth, date__year: selectedYear }).catch(() => ({ data: [] })),
      ]);

      if (todayRes.data && todayRes.data.length > 0) {
        const today = todayRes.data[0];
        setTodayAttendance(today);
        setCheckedIn(!!today.check_in_time && !today.check_out_time);
      } else {
        setTodayAttendance(null);
        setCheckedIn(false);
      }

      const stats = monthlyRes.data || {};
      setMonthlyStats({
        present: stats.present_days || 0,
        absent: stats.absent_days || 0,
        halfDay: stats.half_day_count || 0,
        wfh: stats.wfh_days || 0,
      });

      setAttendance(attendanceRes.data?.results || attendanceRes.data || []);
    } catch (err) {
      showToast(extractError(err));
    } finally {
      setLoadingState(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoadingState(true);
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-GB").split(" ")[0];
      await attendanceAPI.checkIn({
        date: now.toISOString().split("T")[0],
        check_in_time: timeString,
        check_in_location: "Office",
        status: "PRESENT",
      });
      setCheckedIn(true);
      fetchAttendanceData();
    } catch (err) {
      showToast(extractError(err));
    } finally {
      setLoadingState(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;
    try {
      setLoadingState(true);
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-GB").split(" ")[0];
      await attendanceAPI.checkOut(todayAttendance.id, {
        check_out_time: timeString,
        check_out_location: "Office",
      });
      setCheckedIn(false);
      fetchAttendanceData();
    } catch (err) {
      showToast(extractError(err));
    } finally {
      setLoadingState(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/40 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${
          color === "green" ? "bg-green-500/10 text-green-400" :
          color === "red" ? "bg-red-500/10 text-red-400" :
          color === "yellow" ? "bg-yellow-500/10 text-yellow-400" :
          "bg-blue-500/10 text-blue-400"
        }`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "ABSENT": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "HALF_DAY": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "WFH": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: return "bg-white/10 text-white/40";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT": return <CheckCircle2 size={14} className="text-green-400" />;
      case "ABSENT": return <XCircle size={14} className="text-red-400" />;
      case "HALF_DAY": return <AlertCircle size={14} className="text-yellow-400" />;
      case "WFH": return <MapPin size={14} className="text-blue-400" />;
      default: return <Clock size={14} className="text-white/40" />;
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
            <Clock size={10} className="text-blue-400" />
            Employee Self-Service
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Clock size={32} className="text-blue-500" />
            Attendance Management
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Track your daily check-in and check-out records.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">

        {/* Today's Check-in/out */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-blue-400" />
              Today's Attendance
            </h2>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>

          {todayAttendance ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-2">Check-in Time</p>
                <p className="text-2xl font-bold text-white">{todayAttendance.check_in_time ? formatTime(todayAttendance.check_in_time) : "--:--"}</p>
                <p className="text-xs text-white/40 mt-1">Location: {todayAttendance.check_in_location || "Office"}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-2">Check-out Time</p>
                <p className="text-2xl font-bold text-white">{todayAttendance.check_out_time ? formatTime(todayAttendance.check_out_time) : "--:--"}</p>
                <p className="text-xs text-white/40 mt-1">Location: {todayAttendance.check_out_location || "—"}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-xs text-white/40 mb-2">Today's Status</p>
                <p className="text-2xl font-bold text-white flex items-center gap-2">
                  {getStatusIcon(todayAttendance.status)}
                  {todayAttendance.status?.replace(/_/g, " ") || "—"}
                </p>
                <p className="text-xs text-white/40 mt-1">Working Hours: {todayAttendance.working_hours || 0}h</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 mb-4">No attendance record for today.</p>
            </div>
          )}

          <div className="flex gap-3">
            {!checkedIn ? (
              <button onClick={handleCheckIn} disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Clock size={16} />}
                {loading ? "Checking In..." : "Check In"}
              </button>
            ) : (
              <button onClick={handleCheckOut} disabled={loading}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Clock size={16} />}
                {loading ? "Checking Out..." : "Check Out"}
              </button>
            )}
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Monthly Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Present" value={monthlyStats.present} icon={CheckCircle2} color="green" />
            <StatCard title="Absent" value={monthlyStats.absent} icon={XCircle} color="red" />
            <StatCard title="Half Days" value={monthlyStats.halfDay} icon={AlertCircle} color="yellow" />
            <StatCard title="Work From Home" value={monthlyStats.wfh} icon={MapPin} color="blue" />
          </div>
        </div>

        {/* Month Filter */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        {/* Attendance Records */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-white/50" />
            Attendance Records —{" "}
            {new Date(2000, selectedMonth - 1).toLocaleString("default", { month: "long" })} {selectedYear}
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full bg-[#0a0a0a]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Check-in</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Check-out</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Hours</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-white">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{record.check_in_time ? formatTime(record.check_in_time) : "--"}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{record.check_out_time ? formatTime(record.check_out_time) : "--"}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{record.working_hours || 0}h</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/40">
                        {record.is_late && <span className="text-orange-400 mr-2">Late</span>}
                        {record.is_regularized && <span className="text-green-400">Regularized</span>}
                        {!record.is_late && !record.is_regularized && "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
              <Calendar size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm">
                No attendance records for {new Date(2000, selectedMonth - 1).toLocaleString("default", { month: "long" })} {selectedYear}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESSAttendance;
