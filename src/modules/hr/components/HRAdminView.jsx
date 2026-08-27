import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users, Briefcase, Calendar, TrendingUp, Shield, LogOut,
  DollarSign, Settings, Clock, Award, Loader,
} from 'lucide-react';
import axios from 'axios';

const adminModules = [
  { title: 'Employee Master', description: 'Core employee database, profiles, onboarding, and document management.', icon: <Users size={22} />, path: '/hr/admin/employees', accent: 'blue' },
  { title: 'Recruitment & ATS', description: 'Job requisitions, candidates, interview pipelines, and offer management.', icon: <Briefcase size={22} />, path: '/hr/admin/recruitment', accent: 'purple' },
  { title: 'Payroll & Salary', description: 'Salary structures, payroll processing, loans, advances, and reimbursements.', icon: <DollarSign size={22} />, path: '/hr/admin/payroll', accent: 'green' },
  { title: 'Performance (PMS)', description: 'Appraisal cycles, goals, 360° feedback, calibration, and PIP management.', icon: <TrendingUp size={22} />, path: '/hr/admin/performance', accent: 'orange' },
  { title: 'Statutory Compliance', description: 'PF, ESI, PT, TDS, Gratuity, Bonus automation with compliance calendar.', icon: <Shield size={22} />, path: '/hr/admin/compliance', accent: 'red' },
  { title: 'Attendance & Shifts', description: 'Shift management, attendance tracking, overtime, and regularisation.', icon: <Clock size={22} />, path: '/hr/admin/attendance', accent: 'cyan' },
  { title: 'Leave & Holidays', description: 'Leave types, policies, holiday calendars, and encashment rules.', icon: <Calendar size={22} />, path: '/hr/ess/leave', accent: 'purple' },
  { title: 'Leave Administration', description: 'Review, approve, and manage employee leave applications.', icon: <Clock size={22} />, path: '/hr/admin/leaves', accent: 'cyan' },
  { title: 'Exit Management', description: 'Resignations, clearance checklists, F&F settlements, and alumni portal.', icon: <LogOut size={22} />, path: '/hr/admin/exits', accent: 'red' },
  { title: 'Training & L&D', description: 'Training programs, nominations, skill matrix, and certifications.', icon: <Award size={22} />, path: '/hr/admin/training', accent: 'pink' },
  { title: 'Master Data', description: 'Designations, locations, cost centers, shifts, and salary components.', icon: <Settings size={22} />, path: '/hr/admin/settings', accent: 'gray' },
];

const HRAdminView = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ employees: '—', active: '—', requisitions: '—', critical: '—' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [empRes, reqRes] = await Promise.all([
          axios.get('/api/hr/employees/').catch(() => ({ data: { results: [] } })),
          axios.get('/api/hr/job-requisitions/').catch(() => ({ data: { results: [] } })),
        ]);
        const employees = empRes.data?.results || empRes.data || [];
        const requisitions = reqRes.data?.results || reqRes.data || [];
        setMetrics({
          employees: employees.length.toLocaleString(),
          active: employees.filter(e => e.status === 'ACTIVE').length.toLocaleString(),
          requisitions: requisitions.filter(r => r.status === 'Approved' || r.status === 'Pending').length.toString(),
          critical: requisitions.filter(r => r.priority === 'Critical').length.toString(),
        });
      } catch (err) { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-blue-400 animate-spin mr-3" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Employees', value: metrics.employees, icon: <Users size={18} />, trend: `${metrics.active} active`, accent: 'blue' },
          { label: 'Open Requisitions', value: metrics.requisitions, icon: <Briefcase size={18} />, trend: `${metrics.critical} critical`, accent: 'purple' },
          { label: 'Compliance', value: 'View Calendar', icon: <Calendar size={18} />, trend: 'PF / ESI / TDS', accent: 'green' },
          { label: 'Pending Reviews', value: metrics.requisitions, icon: <TrendingUp size={18} />, trend: 'Current cycle', accent: 'orange' },
        ].map((metric, i) => (
          <div key={i} className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">{metric.label}</p>
              <div className={cn(
                "p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110",
                metric.accent === 'blue' && 'bg-blue-500/10 text-blue-400',
                metric.accent === 'purple' && 'bg-purple-500/10 text-purple-400',
                metric.accent === 'green' && 'bg-emerald-500/10 text-emerald-400',
                metric.accent === 'orange' && 'bg-amber-500/10 text-amber-400',
              )}>{metric.icon}</div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{metric.value}</p>
            <p className="text-[10px] text-white/30 mt-1 font-medium">{metric.trend}</p>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">HR Sub-Modules</h2>
          <span className="text-[9px] text-white/20">{adminModules.length} modules</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, i) => (
            <button key={i} onClick={() => navigate(module.path)}
              className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-800/40 hover:border-zinc-700 transition-all duration-300 group text-left"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border mb-5 group-hover:scale-110 transition-transform duration-300",
                module.accent === 'blue' && 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                module.accent === 'purple' && 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                module.accent === 'green' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                module.accent === 'orange' && 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                module.accent === 'red' && 'bg-red-500/10 border-red-500/20 text-red-400',
                module.accent === 'cyan' && 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                module.accent === 'pink' && 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                module.accent === 'gray' && 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
              )}>{module.icon}</div>
              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-blue-400 transition-colors">{module.title}</h3>
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">{module.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRAdminView;
