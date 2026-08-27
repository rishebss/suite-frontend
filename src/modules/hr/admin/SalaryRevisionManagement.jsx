import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TrendingUp,
  ChevronLeft,
  Loader,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  Users,
  DollarSign,
} from "lucide-react";
import { salaryRevisionAPI, employeeAPI, payrollAPI } from "../services/hrAPI";

const StatusBadge = ({ status }) => {
  const colors = {
    DRAFT: "bg-white/10 text-white/50",
    PENDING_MANAGER: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    PENDING_HR: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    PENDING_FINANCE: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    APPROVED: "bg-green-500/10 text-green-400 border border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  const labels = {
    DRAFT: "Draft",
    PENDING_MANAGER: "Pending Manager",
    PENDING_HR: "Pending HR",
    PENDING_FINANCE: "Pending Finance",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-white/10 text-white/50"}`}>
      {labels[status] || status}
    </span>
  );
};

const SalaryRevisionManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [revisions, setRevisions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(searchParams.has('employee'));
  const [formLoading, setFormLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    employee: searchParams.get('employee') || "", previous_ctc: "", previous_gross: "", previous_basic: "",
    revised_ctc: "", revised_gross: "", revised_basic: "",
    revision_type: "ANNUAL_INCREMENT", reason: "",
    effective_month: new Date().getMonth() + 1,
    effective_year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const empId = searchParams.get('employee');
    if (empId && employees.length > 0) {
      handleEmployeeSelect(empId);
    }
  }, [employees]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, empRes] = await Promise.all([
        salaryRevisionAPI.getRevisions(),
        employeeAPI.getEmployees({ status: "ACTIVE" }),
      ]);
      setRevisions(revRes.data?.results || revRes.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      const f = formData;
      const pCtc = parseFloat(f.previous_ctc) || 0;
      const pGross = parseFloat(f.previous_gross) || 0;
      const pBasic = parseFloat(f.previous_basic) || 0;
      const rCtc = parseFloat(f.revised_ctc) || 0;
      const rGross = parseFloat(f.revised_gross) || Math.round(rCtc * 0.85 * 100) / 100;
      const rBasic = parseFloat(f.revised_basic) || Math.round(rCtc * 0.5 * 100) / 100;

      await salaryRevisionAPI.createRevision({
        employee: f.employee,
        previous_ctc: pCtc, previous_gross: pGross, previous_basic: pBasic,
        revised_ctc: rCtc, revised_gross: rGross, revised_basic: rBasic,
        revision_type: f.revision_type,
        reason: f.reason,
        effective_month: parseInt(f.effective_month) || new Date().getMonth() + 1,
        effective_year: parseInt(f.effective_year) || new Date().getFullYear(),
      });
      setShowForm(false);
      setFormData({
        employee: "", previous_ctc: "", previous_gross: "", previous_basic: "",
        revised_ctc: "", revised_gross: "", revised_basic: "",
        revision_type: "ANNUAL_INCREMENT", reason: "",
        effective_month: new Date().getMonth() + 1,
        effective_year: new Date().getFullYear(),
      });
      fetchData();
    } catch (err) {
      const d = err.response?.data;
      if (d && typeof d === 'object') {
        setError(Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | '));
      } else {
        setError(d?.detail || "Failed to create revision");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setLoading(true);
      if (action === "approve_manager") await salaryRevisionAPI.approveManager(id);
      else if (action === "approve_hr") await salaryRevisionAPI.approveHR(id);
      else if (action === "approve_finance") await salaryRevisionAPI.approveFinance(id);
      else if (action === "reject") await salaryRevisionAPI.rejectRevision(id, "Rejected");
      fetchData();
    } catch (err) {
      setError("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = async (empId) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      try {
        const salaryRes = await payrollAPI.getEmployeeSalary({ employee: empId, is_active: true });
        const salary = salaryRes?.data?.[0];
        setFormData(prev => ({
          ...prev, employee: empId,
          previous_ctc: salary?.ctc || "",
          previous_gross: salary?.gross_salary || "",
          previous_basic: salary?.basic_salary || "",
          revised_ctc: salary?.ctc ? (salary.ctc * 1.1).toFixed(2) : "",
          revised_gross: salary?.gross_salary ? (salary.gross_salary * 1.1).toFixed(2) : "",
          revised_basic: salary?.basic_salary ? (salary.basic_salary * 1.1).toFixed(2) : "",
        }));
      } catch {
        setFormData(prev => ({
          ...prev, employee: empId,
          previous_ctc: "", previous_gross: "", previous_basic: "",
          revised_ctc: "", revised_gross: "", revised_basic: "",
        }));
      }
    }
  };

  const filteredRevisions = activeFilter === "ALL" 
    ? revisions 
    : revisions.filter(r => r.status === activeFilter);

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate("/hr/admin/payroll")} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to Payroll
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <TrendingUp size={32} className="text-orange-500" />
            Salary Revisions
          </h1>
          <p className="text-sm text-white/40 font-medium">Manage increments, promotions, and salary corrections.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/20 font-medium text-sm">
            <Plus size={18} /> New Revision
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-8 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Salary Revision</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-sm">Cancel</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Employee *</label>
                  <select required value={formData.employee} onChange={e => handleEmployeeSelect(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    <option value="">Select Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Revision Type</label>
                  <select value={formData.revision_type} onChange={e => setFormData({...formData, revision_type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    <option value="ANNUAL_INCREMENT">Annual Increment</option>
                    <option value="PROMOTION">Promotion</option>
                    <option value="MERIT">Merit Increase</option>
                    <option value="CORRECTION">Correction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Previous CTC *</label>
                  <input required type="number" value={formData.previous_ctc} onChange={e => setFormData({...formData, previous_ctc: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Revised CTC *</label>
                  <input required type="number" value={formData.revised_ctc} onChange={e => setFormData({...formData, revised_ctc: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Effective Month</label>
                  <select value={formData.effective_month} onChange={e => setFormData({...formData, effective_month: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString("default", { month: "long" })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Effective Year</label>
                  <select value={formData.effective_year} onChange={e => setFormData({...formData, effective_year: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    {Array.from({ length: 3 }, (_, i) => {
                      const y = new Date().getFullYear() - 1 + i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Reason</label>
                <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Reason for revision..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20">
                  {formLoading ? "Creating..." : "Create Revision"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
          {["ALL", "PENDING_MANAGER", "PENDING_HR", "PENDING_FINANCE", "APPROVED", "REJECTED"].map(status => (
            <button key={status} onClick={() => setActiveFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === status ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}>
              {status === "ALL" ? "All" : status.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
            </button>
          ))}
        </div>

        {/* Revisions List */}
        {loading && !showForm ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : filteredRevisions.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
            <TrendingUp size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No salary revisions found.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/20">
              Create First Revision
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRevisions.map(rev => (
              <div key={rev.id} className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{rev.employee_name}</h3>
                    <p className="text-xs text-white/40">{rev.employee_id_field} • {rev.department_name || "—"}</p>
                  </div>
                  <StatusBadge status={rev.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Previous CTC</p>
                    <p className="text-sm font-bold text-white">₹{Number(rev.previous_ctc).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Revised CTC</p>
                    <p className="text-sm font-bold text-emerald-400">₹{Number(rev.revised_ctc).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400/60 mb-1">Increase</p>
                    <p className="text-sm font-bold text-green-400">
                      {rev.percentage_increase ? `${rev.percentage_increase}%` : "—"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Effective</p>
                    <p className="text-sm font-bold text-white">{rev.effective_month}/{rev.effective_year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                  <FileText size={12} /> {rev.revision_type?.replace(/_/g, " ")}
                  {rev.is_processed && <span className="text-green-400 ml-2">✓ Processed</span>}
                </div>

                {/* Approval Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  {rev.status === "PENDING_MANAGER" && (
                    <>
                      <button onClick={() => handleAction(rev.id, "approve_manager")} className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors flex items-center gap-1">
                        <CheckCircle2 size={12} /> Approve as Manager
                      </button>
                      <button onClick={() => handleAction(rev.id, "reject")} className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                  {rev.status === "PENDING_HR" && (
                    <button onClick={() => handleAction(rev.id, "approve_hr")} className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/20 transition-colors flex items-center gap-1">
                      <CheckCircle2 size={12} /> Approve as HR
                    </button>
                  )}
                  {rev.status === "PENDING_FINANCE" && (
                    <button onClick={() => handleAction(rev.id, "approve_finance")} className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors flex items-center gap-1">
                      <CheckCircle2 size={12} /> Approve as Finance
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryRevisionManagement;
