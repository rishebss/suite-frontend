import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, DollarSign, TrendingUp, Shield, Calendar, LogOut, Award, Settings, Clock } from "lucide-react";

const ModuleCard = ({ title, description, icon, path, accent }) => {
  const navigate = useNavigate();

  const accentClasses = {
    blue: "border-blue-500/10 text-blue-400",
    green: "border-emerald-500/10 text-emerald-400",
    purple: "border-purple-500/10 text-purple-400",
    orange: "border-orange-500/10 text-orange-400",
    red: "border-red-500/10 text-red-400",
    cyan: "border-cyan-500/10 text-cyan-400",
    pink: "border-pink-500/10 text-pink-400",
    gray: "border-zinc-500/10 text-zinc-400",
  };

  return (
    <div
      onClick={() => navigate(path)}
      className={`p-6 rounded-2xl bg-zinc-900/30 border ${accentClasses[accent]} hover:border-white/20 transition-all cursor-pointer group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/5 ${accentClasses[accent]} group-hover:bg-white/10 transition-all`}>
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40">{description}</p>
    </div>
  );
};

const HRModules = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">All HR Modules</h2>
        <span className="text-[9px] text-white/20">10 modules</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ModuleCard title="Employee Master" description="Manage employee database, profiles, and onboarding" icon={<Users size={22} />} path="/hr/admin/employees" accent="blue" />
        <ModuleCard title="Recruitment & ATS" description="Job requisitions, candidates, and interview pipelines" icon={<Briefcase size={22} />} path="/hr/admin/recruitment" accent="purple" />
        <ModuleCard title="Payroll & Salary" description="Salary structures, payroll, loans, and reimbursements" icon={<DollarSign size={22} />} path="/hr/admin/payroll" accent="green" />
        <ModuleCard title="Performance (PMS)" description="Appraisals, goals, 360° feedback, and calibration" icon={<TrendingUp size={22} />} path="/hr/admin/performance" accent="orange" />
        <ModuleCard title="Statutory Compliance" description="PF, ESI, PT, TDS, Gratuity, Bonus automation" icon={<Shield size={22} />} path="/hr/admin/compliance" accent="red" />
        <ModuleCard title="Attendance & Shifts" description="Shift management, tracking, overtime" icon={<Clock size={22} />} path="/hr/ess/attendance" accent="cyan" />
        <ModuleCard title="Leave & Holidays" description="Leave types, policies, and holiday calendars" icon={<Calendar size={22} />} path="/hr/ess/leave" accent="purple" />
        <ModuleCard title="Exit Management" description="Resignations, clearances, and F&F settlements" icon={<LogOut size={22} />} path="/hr/admin/exits" accent="red" />
        <ModuleCard title="Training & L&D" description="Training programs, nominations, skill matrix" icon={<Award size={22} />} path="/hr/admin/training" accent="pink" />
        <ModuleCard title="Master Data" description="Designations, locations, cost centers, shifts" icon={<Settings size={22} />} path="/hr/admin/settings" accent="gray" />
      </div>
    </div>
  );
};

export default HRModules;
