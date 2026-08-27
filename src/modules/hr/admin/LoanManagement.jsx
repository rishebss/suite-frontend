import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  ChevronLeft,
  Loader,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  DollarSign,
  Calendar,
} from "lucide-react";
import { loanAPI, employeeAPI } from "../services/hrAPI";

const StatusBadge = ({ status }) => {
  const colors = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    APPROVED: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    ACTIVE: "bg-green-500/10 text-green-400 border border-green-500/20",
    CLOSED: "bg-white/10 text-white/40",
    REJECTED: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || ""}`}>{status}</span>
  );
};

const LoanManagement = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: "", loan_type: "PERSONAL", principal_amount: "",
    interest_rate: "0", emi_amount: "", total_emis: "12",
    sanction_date: "", purpose: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loanRes, empRes] = await Promise.all([
        loanAPI.getLoans(),
        employeeAPI.getEmployees(),
      ]);
      setLoans(loanRes.data?.results || loanRes.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);
    } catch (err) {
      setError("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      await loanAPI.createLoan({
        ...formData,
        principal_amount: parseFloat(formData.principal_amount),
        emi_amount: parseFloat(formData.emi_amount),
        total_emis: parseInt(formData.total_emis),
        interest_rate: parseFloat(formData.interest_rate),
      });
      setShowForm(false);
      setFormData({
        employee: "", loan_type: "PERSONAL", principal_amount: "",
        interest_rate: "0", emi_amount: "", total_emis: "12",
        sanction_date: "", purpose: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create loan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setLoading(true);
      if (action === "approve") await loanAPI.approveLoan(id);
      else if (action === "reject") await loanAPI.rejectLoan(id, "Rejected");
      else if (action === "close") await loanAPI.closeLoan(id);
      fetchData();
    } catch (err) {
      setError("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <div className="space-y-1">
          <button onClick={() => navigate("/hr/admin/payroll")} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
            <ChevronLeft size={16} /> Back to Payroll
          </button>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <CreditCard size={32} className="text-blue-500" />
            Employee Loans & Advances
          </h1>
          <p className="text-sm text-white/40 font-medium">Manage salary advances, personal loans, and EMI schedules.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 font-medium text-sm">
            <Plus size={18} /> New Loan
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
              <h2 className="text-xl font-bold text-white">New Loan / Advance</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-sm">Cancel</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Employee *</label>
                  <select required value={formData.employee} onChange={e => setFormData({...formData, employee: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    <option value="">Select...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Loan Type *</label>
                  <select required value={formData.loan_type} onChange={e => setFormData({...formData, loan_type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white">
                    <option value="PERSONAL">Personal Loan</option>
                    <option value="VEHICLE">Vehicle Loan</option>
                    <option value="HOUSING">Housing Loan</option>
                    <option value="EMERGENCY">Emergency Loan</option>
                    <option value="SALARY_ADVANCE">Salary Advance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Principal Amount *</label>
                  <input required type="number" value={formData.principal_amount} onChange={e => setFormData({...formData, principal_amount: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Interest Rate (%)</label>
                  <input type="number" step="0.01" value={formData.interest_rate} onChange={e => setFormData({...formData, interest_rate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">EMI Amount *</label>
                  <input required type="number" value={formData.emi_amount} onChange={e => setFormData({...formData, emi_amount: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Total EMIs</label>
                  <input type="number" value={formData.total_emis} onChange={e => setFormData({...formData, total_emis: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Sanction Date</label>
                  <input type="date" value={formData.sanction_date} onChange={e => setFormData({...formData, sanction_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Purpose</label>
                <textarea value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} rows={2}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {formLoading ? "Creating..." : "Create Loan"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading && !showForm ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : loans.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
            <CreditCard size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No loans found.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20">Create First Loan</button>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map(loan => (
              <div key={loan.id} className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white">{loan.employee_name}</h3>
                    <p className="text-xs text-white/40">{loan.employee_id_field} • {loan.loan_type?.replace(/_/g, " ")}</p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Principal</p>
                    <p className="text-sm font-bold text-white">₹{Number(loan.principal_amount).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">EMI</p>
                    <p className="text-sm font-bold text-blue-400">₹{Number(loan.emi_amount).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Outstanding</p>
                    <p className="text-sm font-bold text-orange-400">₹{Number(loan.outstanding_amount).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-white/40 mb-1">Progress</p>
                    <p className="text-sm font-bold text-white">{loan.paid_emis}/{loan.total_emis} EMIs</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  {loan.status === "PENDING" && (
                    <>
                      <button onClick={() => handleAction(loan.id, "approve")} className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Approve
                      </button>
                      <button onClick={() => handleAction(loan.id, "reject")} className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 flex items-center gap-1">
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                  {loan.status === "ACTIVE" && (
                    <button onClick={() => handleAction(loan.id, "close")} className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded-lg text-xs font-medium hover:bg-white/10">
                      Close Loan
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

export default LoanManagement;
