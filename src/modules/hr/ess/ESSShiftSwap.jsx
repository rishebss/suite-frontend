import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Loader, AlertCircle, CheckCircle2, XCircle, Plus, RefreshCw, Users } from "lucide-react";
import { useHR } from "../context/HRContext";
import { shiftSwapAPI, employeeAPI } from "../services/hrAPI";
import { formatDate } from "../utils/helpers";

export const ESSShiftSwap = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pendingConsent, setPendingConsent] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    target_employee: "",
    requesting_shift_date: "",
    target_shift_date: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("my");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingState(true);
    try {
      const [reqRes, empRes, consentRes] = await Promise.all([
        shiftSwapAPI.getRequests().catch(() => ({ data: [] })),
        employeeAPI.getEmployees().catch(() => ({ data: { results: [] } })),
        shiftSwapAPI.getPendingConsent().catch(() => ({ data: [] })),
      ]);
      setRequests(reqRes.data?.results || reqRes.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);
      setPendingConsent(consentRes.data?.results || consentRes.data || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await shiftSwapAPI.createRequest(formData);
      setShowForm(false);
      setFormData({ target_employee: "", requesting_shift_date: "", target_shift_date: "", reason: "" });
      fetchData();
    } catch (err) {
      setErrorState(err.response?.data?.detail || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConsent = async (id, accepted) => {
    try {
      await shiftSwapAPI.giveConsent(id, accepted);
      fetchData();
    } catch (err) {
      setErrorState(err.message);
    }
  };

  const handleWithdraw = async (id) => {
    try {
      await shiftSwapAPI.withdrawRequest(id);
      fetchData();
    } catch (err) {
      setErrorState(err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "REJECTED":
      case "WITHDRAWN": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "PENDING_MANAGER": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
  };

  const tabs = [
    { id: "my", label: "My Requests", count: requests.filter(r => r.status !== "WITHDRAWN").length },
    { id: "consent", label: "Pending My Consent", count: pendingConsent.length },
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <button onClick={() => navigate('/hr/ess')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
          <RefreshCw size={10} className="text-cyan-400" /> Employee Self-Service
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <RefreshCw size={32} className="text-cyan-500" /> Shift Swap Requests
        </h1>
        <p className="text-sm text-white/40 font-medium">Request or respond to shift swaps with colleagues.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-cyan-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}>
              {tab.label} {tab.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{tab.count}</span>}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm">
            <Plus size={16} /> New Swap Request
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-cyan-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Request Shift Swap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Swap With (Colleague)</label>
                <select required value={formData.target_employee} onChange={(e) => setFormData({...formData, target_employee: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                  <option value="" className="bg-[#0a0a0a] text-white">Select colleague...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-[#0a0a0a] text-white">{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Swap From (Your Shift Date)</label>
                <input type="date" required value={formData.requesting_shift_date} onChange={(e) => setFormData({...formData, requesting_shift_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Swap To (Colleague's Shift Date)</label>
                <input type="date" required value={formData.target_shift_date} onChange={(e) => setFormData({...formData, target_shift_date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Reason</label>
                <input type="text" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} placeholder="Why do you need to swap?"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                {submitting ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {submitting ? "Submitting..." : "Send Swap Request"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-cyan-500" /></div>
        ) : activeTab === "consent" && pendingConsent.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users size={18} className="text-cyan-400" /> Requests Awaiting Your Consent</h2>
            {pendingConsent.map((swap) => (
              <div key={swap.id} className="p-6 rounded-xl bg-white/[0.03] border border-yellow-500/20">
                <p className="text-sm text-white/70 mb-2"><strong className="text-white">{swap.requesting_employee_name}</strong> wants to swap shifts with you</p>
                <p className="text-xs text-white/50 mb-3">From: {formatDate(swap.requesting_shift_date)} → To: {formatDate(swap.target_shift_date)}</p>
                <p className="text-xs text-white/40 mb-4 italic">"{swap.reason}"</p>
                <div className="flex gap-2">
                  <button onClick={() => handleConsent(swap.id, true)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">Accept</button>
                  <button onClick={() => handleConsent(swap.id, false)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">Decline</button>
                </div>
              </div>
            ))}
          </div>
        ) : requests.filter(r => activeTab === "my" || r.status !== "WITHDRAWN").length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full bg-[#0a0a0a]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Swap With</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">From Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">To Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Reason</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.filter(r => activeTab === "my" || r.status !== "WITHDRAWN").map((swap) => (
                  <tr key={swap.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{swap.target_employee_name || "Colleague"}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{formatDate(swap.requesting_shift_date)}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{formatDate(swap.target_shift_date)}</td>
                    <td className="px-6 py-4 text-sm text-white/50 max-w-[200px] truncate">{swap.reason}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(swap.status)}`}>
                        {swap.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {swap.status === "PENDING_CONSENT" && (
                        <button onClick={() => handleWithdraw(swap.id)} className="text-xs text-red-400 hover:text-red-300">Withdraw</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
            <RefreshCw size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No shift swap requests found.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">
              Request a Shift Swap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESSShiftSwap;
