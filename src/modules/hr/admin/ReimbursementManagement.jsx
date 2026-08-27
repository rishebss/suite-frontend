import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  ChevronLeft,
  Loader,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  DollarSign,
  Upload,
} from "lucide-react";
import { reimbursementAPI, employeeAPI } from "../services/hrAPI";

const StatusBadge = ({ status }) => {
  const colors = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    APPROVED: "bg-green-500/10 text-green-400 border border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border border-red-500/20",
    PAID: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || ""}`}>{status}</span>;
};

const ReimbursementManagement = () => {
  const navigate = useNavigate();
  const [reimbursements, setReimbursements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    employee: "", expense_type: "TRAVEL", amount: "",
    expense_date: "", description: "", bill_number: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reimbRes, empRes] = await Promise.all([
        reimbursementAPI.getReimbursements(),
        employeeAPI.getEmployees(),
      ]);
      setReimbursements(reimbRes.data?.results || reimbRes.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      await reimbursementAPI.createReimbursement({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowForm(false);
      setFormData({
        employee: "", expense_type: "TRAVEL", amount: "",
        expense_date: "", description: "", bill_number: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create reimbursement");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setLoading(true);
      if (action === "approve") await reimbursementAPI.approveReimbursement(id);
      else if (action === "reject") await reimbursementAPI.rejectReimbursement(id, "Rejected");
      else if (action === "pay") await reimbursementAPI.markReimbursementPaid(id);
      fetchData();
    } catch (err) {
      setError("Action failed");
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "ALL" ? reimbursements : reimbursements.filter(r => r.status === filter);

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate("/hr/admin/payroll")} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to Payroll
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Receipt size={32} className="text-cyan-500" />
            Expense Reimbursements
          </h1>
          <p className="text-sm text-white/40 font-medium">Manage medical, travel, and other expense claims.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 font-medium text-sm">
            <Plus size={18} /> New Claim
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

        {showForm && (
          <div className="mb-8 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Expense Claim</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-sm">Cancel</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Employee *</label>
                  <select required value={formData.employee} onChange={e => setFormData({...formData, employee: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    <option value="">Select...</option>
                    {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Expense Type *</label>
                  <select required value={formData.expense_type} onChange={e => setFormData({...formData, expense_type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    <option value="TRAVEL">Travel</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="MOBILE">Mobile</option>
                    <option value="INTERNET">Internet</option>
                    <option value="CONVEYANCE">Conveyance</option>
                    <option value="FUEL">Fuel</option>
                    <option value="FOOD">Food</option>
                    <option value="STATIONERY">Stationery</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Amount *</label>
                  <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Expense Date *</label>
                  <input required type="date" value={formData.expense_date} onChange={e => setFormData({...formData, expense_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Bill Number</label>
                  <input value={formData.bill_number} onChange={e => setFormData({...formData, bill_number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Description *</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" placeholder="Describe the expense..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                  {formLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
                  {formLoading ? "Submitting..." : "Submit Claim"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
          {["ALL", "PENDING", "APPROVED", "PAID", "REJECTED"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === s ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading && !showForm ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-cyan-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
            <Receipt size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No reimbursements found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-white">{item.employee_name}</h3>
                    <p className="text-xs text-white/40">{item.expense_type?.replace(/_/g, " ")} • {item.employee_id_field}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-4 text-sm mb-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">₹{Number(item.amount).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-white/40">{item.description?.slice(0, 60)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  {item.status === "PENDING" && (
                    <>
                      <button onClick={() => handleAction(item.id, "approve")} className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Approve
                      </button>
                      <button onClick={() => handleAction(item.id, "reject")} className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 flex items-center gap-1">
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                  {item.status === "APPROVED" && (
                    <button onClick={() => handleAction(item.id, "pay")} className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Mark Paid
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

export default ReimbursementManagement;
