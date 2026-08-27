import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Loader, AlertCircle, CheckCircle2, XCircle, Plus, Calendar } from "lucide-react";
import { useHR } from "../context/HRContext";
import { regularizationAPI, attendanceAPI } from "../services/hrAPI";
import { formatDate } from "../utils/helpers";

export const ESSAttendanceRegularization = () => {
  const navigate = useNavigate();
  const { loading, setLoadingState, error, setErrorState } = useHR();
  const [requests, setRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    attendance: "",
    requested_status: "PRESENT",
    requested_check_in: "",
    requested_check_out: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchAttendanceRecords();
  }, []);

  const fetchRequests = async () => {
    setLoadingState(true);
    try {
      const res = await regularizationAPI.getMyRequests().catch(() => ({ data: [] }));
      setRequests(res.data?.results || res.data || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const res = await attendanceAPI.getAttendance().catch(() => ({ data: [] }));
      setAttendanceRecords(res.data?.results || res.data || []);
    } catch (err) {
      setErrorState(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.requested_check_in) delete payload.requested_check_in;
      if (!payload.requested_check_out) delete payload.requested_check_out;
      await regularizationAPI.createRequest(payload);
      setShowForm(false);
      setFormData({ attendance: "", requested_status: "PRESENT", requested_check_in: "", requested_check_out: "", reason: "" });
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
      default: return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <button onClick={() => navigate('/hr/ess')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
          <Calendar size={10} className="text-yellow-400" /> Employee Self-Service
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <Calendar size={32} className="text-yellow-500" /> Attendance Regularization
        </h1>
        <p className="text-sm text-white/40 font-medium">Request corrections to your attendance records.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">My Regularization Requests</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm">
            <Plus size={16} /> New Request
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-yellow-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Submit Regularization Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Attendance Record</label>
                <select required value={formData.attendance} onChange={(e) => setFormData({...formData, attendance: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50">
                  <option value="" className="bg-[#0a0a0a] text-white">Select attendance record...</option>
                  {attendanceRecords.map((att) => (
                    <option key={att.id} value={att.id} className="bg-[#0a0a0a] text-white">
                      {formatDate(att.date)} — {att.status?.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Requested Status</label>
                <select value={formData.requested_status} onChange={(e) => setFormData({...formData, requested_status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50">
                  <option value="PRESENT" className="bg-[#0a0a0a] text-white">Present</option>
                  <option value="HALF_DAY" className="bg-[#0a0a0a] text-white">Half Day</option>
                  <option value="WFH" className="bg-[#0a0a0a] text-white">Work From Home</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Corrected Check-in Time</label>
                <input type="time" value={formData.requested_check_in} onChange={(e) => setFormData({...formData, requested_check_in: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1">Corrected Check-out Time</label>
                <input type="time" value={formData.requested_check_out} onChange={(e) => setFormData({...formData, requested_check_out: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-white/40 mb-1">Reason for Regularization</label>
              <textarea required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 min-h-[80px]" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                {submitting ? <Loader size={16} className="animate-spin" /> : <Calendar size={16} />}
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-yellow-500" /></div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full bg-[#0a0a0a]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Attendance Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Requested Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Check-in</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Check-out</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white/40">Reason</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{formatDate(req.attendance_date)}</td>
                    <td className="px-6 py-4 text-center text-sm text-white/70">{req.requested_status?.replace(/_/g, " ")}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{req.requested_check_in || "—"}</td>
                    <td className="px-6 py-4 text-sm text-white/60">{req.requested_check_out || "—"}</td>
                    <td className="px-6 py-4 text-sm text-white/50 max-w-[200px] truncate">{req.reason}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
            <Calendar size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No regularization requests found.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors">
              Submit a Regularization Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ESSAttendanceRegularization;
