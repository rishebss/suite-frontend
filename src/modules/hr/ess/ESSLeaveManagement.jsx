import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Loader,
  CheckCircle2,
  Calendar,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHR } from "../context/HRContext";
import { leaveAPI } from "../services/hrAPI";

const extractError = (err) =>
  err.response?.data?.error || err.response?.data?.detail || err.message || "Something went wrong";

export const ESSLeaveManagement = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, showToast } = useHR();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [balances, setBalances] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [showForm, setShowForm] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: "",
    date_from: "",
    date_to: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingState(true);
    try {
      const [typesRes, appsRes, balancesRes] = await Promise.all([
        leaveAPI.getLeaveTypes().catch(() => ({ data: [] })),
        leaveAPI.getLeaveApplications().catch(() => ({ data: [] })),
        leaveAPI.getCurrentYearBalance().catch(() => ({ data: [] })),
      ]);

      setLeaveTypes(typesRes.data?.results || typesRes.data || []);
      setApplications(appsRes.data?.results || appsRes.data || []);
      setBalances(balancesRes.data?.results || balancesRes.data || []);
    } catch (err) {
      showToast(extractError(err));
    } finally {
      setLoadingState(false);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!formData.leave_type || !formData.date_from || !formData.date_to || !formData.reason) {
      showToast("All fields are required");
      return;
    }
    try {
      setLoadingState(true);
      await leaveAPI.applyLeave(formData);
      setShowForm(false);
      setFormData({ leave_type: "", date_from: "", date_to: "", reason: "" });
      fetchData();
    } catch (err) {
      showToast(extractError(err));
    } finally {
      setLoadingState(false);
    }
  };

  const handleCancelLeave = async (applicationId) => {
    try {
      setLoadingState(true);
      await leaveAPI.cancelLeave(applicationId, "Cancelled by employee");
      showToast("Leave request cancelled", "success");
      fetchData();
    } catch (err) {
      showToast(extractError(err));
    } finally {
      setLoadingState(false);
    }
  };

  const filteredApplications = applications.filter((app) =>
    filter === "ALL" ? true : app.approval_status === filter
  );

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "APPROVED": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "CANCELLED": return "bg-white/10 text-white/40 border border-white/10";
      default: return "bg-white/10 text-white/40";
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
            <Calendar size={10} className="text-green-400" />
            Employee Self-Service
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Calendar size={32} className="text-green-500" />
            Leave Management
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Apply and track your leave requests.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors font-medium text-sm"
          >
            <Plus size={18} /> Apply for Leave
          </button>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">

        {/* Leave Balances */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            Your Leave Balances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.length > 0 ? (
              balances.map((balance) => (
                <div key={balance.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="font-semibold text-white mb-4">{balance.leave_type_name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Available</span>
                      <span className="font-bold text-green-400">{balance.current_balance}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Used</span>
                      <span className="font-bold text-orange-400">{balance.used_days}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Pending</span>
                      <span className="font-bold text-blue-400">{balance.pending_days}</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min((balance.used_days / (balance.current_balance + balance.used_days || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 rounded-xl border border-dashed border-white/10 text-center">
                <p className="text-white/40 text-sm">No leave balances available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Apply Leave Form */}
        {showForm && (
          <div className="mb-8 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-sm">Cancel</button>
            </div>
            <form onSubmit={handleSubmitLeave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-white/60 mb-2">Leave Type *</label>
                  <div className="relative">
                    <button type="button" onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-green-500/50 flex items-center justify-between">
                      <span className={formData.leave_type ? 'text-white' : 'text-white/30'}>{formData.leave_type ? leaveTypes.find(t => t.id === formData.leave_type)?.name || 'Select Leave Type' : 'Select Leave Type'}</span>
                      <svg className={`w-4 h-4 text-white/40 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute z-20 top-full mt-1 w-full bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                        {leaveTypes.map(type => (
                          <button key={type.id} type="button" onClick={() => { setFormData({...formData, leave_type: type.id}); setShowTypeDropdown(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${formData.leave_type === type.id ? 'text-green-400 bg-green-500/5' : 'text-white'}`}>
                            {type.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">From Date *</label>
                  <input
                    type="date" required value={formData.date_from}
                    onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">To Date *</label>
                  <input
                    type="date" required value={formData.date_to}
                    onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Reason *</label>
                <textarea
                  required value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder:text-white/30"
                  placeholder="Enter reason for leave"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-white/50" />
              Your Applications
            </h2>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
              {filteredApplications.length} {filteredApplications.length === 1 ? "request" : "requests"}
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
            {["PENDING", "APPROVED", "REJECTED", "CANCELLED", "ALL"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="space-y-3">
              {filteredApplications.map((application) => (
                <div key={application.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-white">{application.leave_type_name}</p>
                      <p className="text-xs text-white/50 mt-0.5">{application.employee_name}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(application.approval_status)}`}>
                      {application.approval_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                    <Calendar size={14} />
                    <span>{application.date_from} → {application.date_to}</span>
                    <span className="text-white/30">({application.number_of_days} days)</span>
                  </div>
                  {application.reason && (
                    <p className="text-xs text-white/40 italic mb-3">"{application.reason.slice(0, 120)}"</p>
                  )}
                  {application.approval_status === "APPROVED" && !application.is_cancelled && (
                    <button
                      onClick={() => handleCancelLeave(application.id)}
                      className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
              <CheckCircle2 size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm mb-1">No {filter.toLowerCase()} leave applications</p>
              <p className="text-white/30 text-xs">Apply for leave to see your requests here.</p>
              {!showForm && (
                <button onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Apply Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESSLeaveManagement;
