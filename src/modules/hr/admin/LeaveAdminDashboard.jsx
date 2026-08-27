import React, { useState, useEffect } from "react";
import { leaveAPI, employeeAPI } from "../services/hrAPI";
import { useHR } from "../context/HRContext";
import { Check, X, Calendar, User, Eye, RefreshCw, Filter, Clock } from "lucide-react";

const extractError = (err) =>
  err.response?.data?.error || err.response?.data?.detail || err.message || "Something went wrong";

export default function LeaveAdminDashboard() {
  const { showToast } = useHR();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(""); // "approve", "reject"
  const [comment, setComment] = useState("");
  const [metrics, setMetrics] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.getLeaveApplications({ approval_status: statusFilter || undefined });
      const allRes = await leaveAPI.getLeaveApplications();
      
      const appList = res.data?.results || res.data || [];
      const allAppList = allRes.data?.results || allRes.data || [];
      
      setLeaves(appList);
      
      // Calculate basic metrics
      const pending = allAppList.filter(l => l.approval_status === "PENDING").length;
      const approved = allAppList.filter(l => l.approval_status === "APPROVED").length;
      const rejected = allAppList.filter(l => l.approval_status === "REJECTED").length;
      setMetrics({ pending, approved, rejected });
    } catch (err) {
      console.error("Error loading leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCommentModal = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setComment("");
    setCommentModalOpen(true);
  };

  const submitAction = async () => {
    try {
      if (actionType === "approve") {
        await leaveAPI.approveLeave(selectedLeave.id, comment);
      } else {
        await leaveAPI.rejectLeave(selectedLeave.id, comment);
      }
      setCommentModalOpen(false);
      showToast(`Leave ${actionType === "approve" ? "approved" : "rejected"} successfully`, "success");
      loadData();
    } catch (err) {
      showToast(extractError(err));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Leave Administration</h1>
          <p className="text-zinc-400 text-sm mt-1">Review and approve employee leave applications and track leave metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="">All Applications</option>
          </select>
          <button 
            onClick={loadData}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Pending Leaves</p>
            <h3 className="text-3xl font-bold text-blue-400 mt-1">{metrics.pending}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Approved Leaves</p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-1">{metrics.approved}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Calendar size={24} />
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider">Rejected Leaves</p>
            <h3 className="text-3xl font-bold text-rose-400 mt-1">{metrics.rejected}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
            <X size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw size={32} className="text-blue-500 animate-spin" />
            <p className="text-zinc-500 text-sm">Loading applications...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Total Days</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-zinc-500">No leave applications found.</td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-zinc-900/40 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-semibold uppercase">
                            {leave.employee_name ? leave.employee_name[0] : <User size={16} />}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{leave.employee_name}</p>
                            <p className="text-xs text-zinc-500">{leave.employee_id_field || "Emp ID"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{leave.leave_type_name || leave.leave_type}</td>
                      <td className="px-6 py-4 text-zinc-400">
                          {leave.date_from} to {leave.date_to}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{leave.number_of_days} days</td>
                      <td className="px-6 py-4 text-zinc-400 max-w-xs truncate">{leave.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          leave.approval_status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
                          leave.approval_status === "REJECTED" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {leave.approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {leave.approval_status === "PENDING" && (
                            <>
                              <button
                                onClick={() => openCommentModal(leave, "approve")}
                                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-xs font-semibold transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openCommentModal(leave, "reject")}
                                className="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded text-xs font-semibold transition"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Comment Modal */}
      {commentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-white capitalize">{actionType} Leave Request</h2>
            <p className="text-zinc-400 text-sm">Add comments or feedback for this leave decision.</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Enter remarks..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCommentModalOpen(false)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition ${
                  actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Confirm {actionType === "approve" ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
