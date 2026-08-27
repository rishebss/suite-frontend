import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, Loader, Edit, Eye, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/hr/employees/');
      // Handles paginated or raw array response
      setEmployees(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/hr/admin')}
            className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to HR Admin
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users size={32} className="text-blue-500" />
            Employee Master
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Manage the centralized database of all enterprise employees.
          </p>
        </div>

        <button onClick={() => navigate('/hr/admin/employees/new')} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors font-medium text-sm">
          <Plus size={18} />
          Onboard Employee
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        <div className="flex gap-4 mb-8">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter size={16} /> Filters
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size={24} className="text-blue-500 animate-spin mr-2" />
            <span className="text-white/40">Loading employees...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full bg-[#0a0a0a]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Designation</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{emp.first_name} {emp.last_name}</div>
                      <div className="text-xs text-white/40">{emp.work_email || emp.personal_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-white/70">{emp.employee_id}</span>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {/* Department details depend on serializer expansion, using fallback if nested */}
                      {typeof emp.department === 'object' ? emp.department?.name : emp.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {typeof emp.designation === 'object' ? emp.designation?.name : emp.designation || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        emp.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/10 text-white/40'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate(`/hr/admin/employees/${emp.id}`)} className="p-2 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white" title="View Profile">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => navigate(`/hr/admin/employees/${emp.id}/edit`)} className="p-2 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white" title="Edit Employee">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-white/40">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
