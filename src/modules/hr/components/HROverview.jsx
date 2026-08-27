import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Calendar, AlertCircle, Briefcase, User, CheckCircle2, ChevronRight } from "lucide-react";

const StatCard = ({ label, value, trend, icon, accent, onClick }) => {
  const accentClasses = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-emerald-400 bg-emerald-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    red: "text-red-400 bg-red-500/10",
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-white/10 transition-all cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${accentClasses[accent]}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">{label}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        <p className="text-xs text-white/50 mt-1">{trend}</p>
      </div>
    </div>
  );
};

const EventItem = ({ event }) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
      <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
        <Calendar size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{event.title}</p>
        <p className="text-xs text-white/40">{event.date}</p>
      </div>
      {event.priority === "high" && (
        <div className="w-2 h-2 rounded-full bg-red-400" />
      )}
    </div>
  );
};

const HROverview = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* ---- Metrics Grid ---- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Key Metrics</h2>
          <span className="text-[9px] text-white/20">Updated live</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Employees"
            value={data.totalEmployees}
            trend={`${data.activeEmployees} active`}
            icon={<Users size={18} />}
            accent="blue"
            onClick={() => navigate("/hr/admin/employees")}
          />
          <StatCard
            label="Present Today"
            value={data.presentToday}
            trend={`${data.onLeave} on leave`}
            icon={<Clock size={18} />}
            accent="green"
          />
          <StatCard
            label="Pending Leaves"
            value={data.pendingLeaves}
            trend="Awaiting approval"
            icon={<Calendar size={18} />}
            accent="orange"
            onClick={() => navigate("/hr/admin")}
          />
          <StatCard
            label="Compliance Overdue"
            value={data.overdueCompliance}
            trend="Needs attention"
            icon={<AlertCircle size={18} />}
            accent={data.overdueCompliance > 0 ? "red" : "green"}
            onClick={() => navigate("/hr/admin/compliance")}
          />
        </div>
      </div>

      {/* ---- Quick Stats Row ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Requisitions */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Recruitment</p>
              <p className="text-2xl font-bold text-white mt-1">{data.openRequisitions}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Briefcase size={20} />
            </div>
          </div>
          <p className="text-[10px] text-white/30 mb-4">Open positions to fill</p>
          <button
            onClick={() => navigate("/hr/admin/recruitment")}
            className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            View Recruitment <ChevronRight size={12} />
          </button>
        </div>

        {/* Quick Access */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Employee Self-Service</p>
              <p className="text-sm text-white mt-1">Access your portal</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <User size={20} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/hr/ess")}
              className="flex-1 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
              ESS Portal
            </button>
            <button onClick={() => navigate("/hr/mss")}
              className="flex-1 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-[10px] font-medium uppercase tracking-[0.2em]">
              Manager Portal
            </button>
          </div>
        </div>
      </div>

      {/* ---- Upcoming Events ---- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Upcoming Events & Alerts</h2>
          <span className="text-[9px] text-white/20">{data.upcomingEvents.length} items</span>
        </div>
        {data.upcomingEvents.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center">
            <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-xs text-white/40">All clear — no pending events or alerts.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.upcomingEvents.map((event, i) => (
              <EventItem key={i} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HROverview;
