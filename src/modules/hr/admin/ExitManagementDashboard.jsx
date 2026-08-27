import React, { useState, useEffect } from 'react';
import { LogOut, FileText, CheckCircle, Loader, ChevronLeft, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exitAPI, employeeAPI } from '../services/hrAPI';

export default function ExitManagementDashboard() {
  const navigate = useNavigate();
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, empRes] = await Promise.all([
        exitAPI.getResignations(),
        employeeAPI.getEmployees().catch(() => ({ data: [] })),
      ]);
      setResignations(res.data.results || res.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
      await exitAPI.createResignation({ ...formData, status: 'Pending' });
    setShowModal(false);
    fetchData();
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate('/hr/admin')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <LogOut size={32} className="text-red-500" />
            Exit Management
          </h1>
          <p className="text-sm text-white/40 font-medium">Handle resignations, departmental clearances, and full & final settlements.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition-all">
          <Plus size={16} /> New Resignation
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-red-500 animate-spin mr-2" />
            <span className="text-white/40">Loading exit data...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white">Resignations</h2>

            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full bg-[#0a0a0a]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Submitted On</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Last Working Day</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resignations.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-white/40">No resignations found.</td></tr>
                  ) : resignations.map(resig => (
                    <tr key={resig.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{resig.employee_name || resig.employee?.first_name || 'Unknown'}</div>
                        <div className="text-xs text-white/40">Emp ID: {resig.employee_id_field || resig.employee?.employee_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-white/70 text-sm">{resig.submitted_on}</td>
                      <td className="px-6 py-4 text-white/70 text-sm">{resig.approved_last_working_day || resig.requested_last_working_day}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          resig.status === 'Approved' ? 'bg-green-500/10 text-green-400' :
                          resig.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                          resig.status === 'Withdrawn' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-orange-500/10 text-orange-400'
                        }`}>
                          {resig.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => navigate('/hr/admin/exits/enhanced')}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors flex items-center gap-1.5">
                            <CheckCircle size={12} /> Clearance
                          </button>
                          <button onClick={() => navigate('/hr/admin/exits/enhanced')}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded transition-colors flex items-center gap-1.5">
                            <FileText size={12} /> F&F
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-green-400" /> Full & Final Settlements (F&F)</h3>
                <p className="text-sm text-white/40 mb-4">Calculate final payroll, leave encashment, gratuity, and loan recoveries for exiting employees.</p>
                <button onClick={() => navigate('/hr/admin/exits/enhanced')} className="text-sm text-green-400 hover:text-green-300">Process F&F &rarr;</button>
              </div>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><LogOut size={18} className="text-blue-400" /> Alumni Portal</h3>
                <p className="text-sm text-white/40 mb-4">Manage alumni access for payslips, Form 16, and experience letters.</p>
                <button onClick={() => navigate('/hr/admin/exits/enhanced')} className="text-sm text-blue-400 hover:text-blue-300">Manage Alumni &rarr;</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <NewResignationModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

function NewResignationModal({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({ employee: "", reason: "", requested_last_working_day: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === 'object' ? Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(', ')}`).join(' | ') : "Failed to create resignation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">New Resignation</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Employee *</label>
            <select required value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm">
              <option value="">Select Employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Requested Last Working Day *</label>
            <input required type="date" value={form.requested_last_working_day}
              onChange={e => setForm({...form, requested_last_working_day: e.target.value})}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Reason *</label>
            <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={4}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
            {loading ? "Creating..." : "Create Resignation"}
          </button>
        </form>
      </div>
    </div>
  );
}
