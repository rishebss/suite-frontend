import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Loader, AlertCircle, CheckCircle2, XCircle, Plus, Calendar } from "lucide-react";
import { useHR } from "../context/HRContext";
import { overtimeAPI } from "../services/hrAPI";
import { formatDate } from "../utils/helpers";

export const ESSOvertime = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    reason: "",
    ot_rate_multiplier: "1.5",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoadingState(true);
    try {
      const res = await overtimeAPI.getMyOvertime().catch(() => ({ data: [] }));
      setRequests(res.data?.results || res.data || []);
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
      await overtimeAPI.createRequest(formData);
      setShowForm(false);
      setFormData({ date: "", start_time: "", end_time: "", reason: "", ot_rate_multiplier: "1.5" });
      fetchRequests();
    } catch (err) {
      setErrorState(err.response?.data?.detail || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "PROCESSED": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default: return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED": return <CheckCircle2 size={14} className="text-green-400" />;
      case "REJECTED": return <XCircle size={14} className="text-red-400" />;
      case "PROCESSED": return <Clock size={14} className="text-blue-400" />;
      default: return <AlertCircle size={14} className="text-yellow-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <button onClick={() => navigate('/hr/ess')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
          <Clock size={10} className="text-orange-400" /> Employee Self-Service
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <Clock size={32} className="text-orange-500" /> Overtime Requests
        </h1>
        <p className="text-sm text-white/40 font-medium">Submit and track your overtime requests.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">My Overtime Requests</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm">
            <Plus size={16} /> New OT Request
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-orange-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Submit Overtime Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Date</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Start Time</label>
                <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">End Time</label>
                <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-white/40 mb-1">Reason</label>
              <textarea required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-h-[80px]" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                {submitting ? <Loader size={16} className="animate-spin" /> : <Clock size={16} />}
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full bg-[#0a0a0a]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Start</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">End</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Reason</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{formatDate(req.date)}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{req.start_time?.slice(0, 5)}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{req.end_time?.slice(0, 5)}</td>
                    <td className="px-6 py-4 text-center text-sm text-white/70">{req.ot_hours || "—"}h</td>
                    <td className="px-6 py-4 text-sm text-white/50 max-w-[200px] truncate">{req.reason}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(req.status)}`}>
                        {getStatusIcon(req.status)} {req.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
            <Clock size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No overtime requests found.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors">
              Submit Your First OT Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESSOvertime;
