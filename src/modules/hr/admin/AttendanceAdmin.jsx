import React, { useState, useEffect } from "react";
import { attendanceAPI, regularizationAPI, overtimeAPI, shiftSwapAPI, employeeAPI } from "../services/hrAPI";
import { Check, X, Calendar, Clock, AlertTriangle, UserCheck, RefreshCw, Eye } from "lucide-react";

export default function AttendanceAdmin() {
  const [attendance, setAttendance] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [overtimes, setOvertimes] = useState([]);
  const [shiftSwaps, setShiftSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("logs");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(""); // "regularization", "overtime", "shiftswap"
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadData();
  }, [filterDate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "logs") {
        const res = await attendanceAPI.getAttendance({ date: filterDate });
        setAttendance(res.data?.results || res.data || []);
      } else if (activeTab === "regularizations") {
        const res = await regularizationAPI.getRequests();
        setRegularizations(res.data?.results || res.data || []);
      } else if (activeTab === "overtime") {
        const res = await overtimeAPI.getRequests();
        setOvertimes(res.data?.results || res.data || []);
      } else if (activeTab === "shiftswap") {
        const res = await shiftSwapAPI.getRequests();
        setShiftSwaps(res.data?.results || res.data || []);
      }
    } catch (err) {
      console.error("Error loading attendance admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (request, type, action) => {
    setSelectedRequest(request);
    setActionType(type);
    setComment("");
    if (action === "approve") {
      if (confirm(`Are you sure you want to approve this request?`)) {
        try {
          if (type === "regularization") {
            await regularizationAPI.approveRequest(request.id, "Approved by admin");
          } else if (type === "overtime") {
            await overtimeAPI.approveRequest(request.id, "Approved by admin");
          } else if (type === "shiftswap") {
            await shiftSwapAPI.approveRequest(request.id);
          }
          loadData();
        } catch (err) {
          alert("Action failed: " + (err.response?.data?.error || err.message));
        }
      }
    } else {
      setSelectedRequest(request);
      setActionType(type);
      setModalOpen(true);
    }
  };

  const submitRejection = async () => {
    if (!comment.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      if (actionType === "regularization") {
        await regularizationAPI.rejectRequest(selectedRequest.id, comment);
      } else if (actionType === "overtime") {
        await overtimeAPI.rejectRequest(selectedRequest.id, comment);
      } else if (actionType === "shiftswap") {
        await shiftSwapAPI.rejectRequest(selectedRequest.id, comment);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Rejection failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Attendance & Roster Control</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage staff logs, shift swaps, overtime and regularization workflows.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "logs" && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button 
            onClick={loadData}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg px-4 py-2 text-sm transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: "logs", label: "Daily Attendance Logs" },
          { id: "regularizations", label: "Regularization Requests" },
          { id: "overtime", label: "Overtime Requests" },
          { id: "shiftswap", label: "Shift Swap Requests" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw size={32} className="text-blue-500 animate-spin" />
            <p className="text-zinc-500 text-sm">Fetching and processing records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === "logs" && (
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Shift</th>
                    <th className="px-6 py-4">Punch In</th>
                    <th className="px-6 py-4">Punch Out</th>
                    <th className="px-6 py-4">Hours worked</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-zinc-500">No attendance logs found for this date.</td>
                    </tr>
                  ) : (
                    attendance.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-900/40 transition">
                        <td className="px-6 py-4 font-semibold text-white">{log.employee_name}</td>
                        <td className="px-6 py-4 text-zinc-400">{log.shift || "GENERAL"}</td>
                        <td className="px-6 py-4 text-zinc-400">{log.check_in_time ? log.check_in_time.slice(0, 5) : "-"}</td>
                        <td className="px-6 py-4 text-zinc-400">{log.check_out_time ? log.check_out_time.slice(0, 5) : "-"}</td>
                        <td className="px-6 py-4 text-zinc-400">{log.working_hours ? `${log.working_hours} hrs` : "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            log.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400" :
                            log.status === "ABSENT" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => { setSelectedLog(log); setDetailModalOpen(true); }}
                            className="text-zinc-500 hover:text-white transition">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "regularizations" && (
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Requested Punch</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {regularizations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-500">No regularization requests.</td>
                    </tr>
                  ) : (
                    regularizations.map((req) => (
                      <tr key={req.id} className="hover:bg-zinc-900/40 transition">
                        <td className="px-6 py-4 font-semibold text-white">{req.employee_name}</td>
                        <td className="px-6 py-4 text-zinc-400">{req.attendance_date}</td>
                        <td className="px-6 py-4 text-zinc-400">
                          {req.requested_check_in?.slice(0, 5) || "-"} to {req.requested_check_out?.slice(0, 5) || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 max-w-xs truncate">{req.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
                            req.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          {req.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleAction(req, "regularization", "approve")}
                                className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleAction(req, "regularization", "reject")}
                                className="p-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30 transition"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "overtime" && (
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Hours Requested</th>
                    <th className="px-6 py-4">Multiplier</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {overtimes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-500">No overtime requests.</td>
                    </tr>
                  ) : (
                    overtimes.map((req) => (
                      <tr key={req.id} className="hover:bg-zinc-900/40 transition">
                        <td className="px-6 py-4 font-semibold text-white">{req.employee_name}</td>
                        <td className="px-6 py-4 text-zinc-400">{req.date}</td>
                        <td className="px-6 py-4 text-zinc-400">{req.ot_hours} hrs</td>
                        <td className="px-6 py-4 text-zinc-400">{req.ot_rate_multiplier}x</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
                            req.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          {req.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleAction(req, "overtime", "approve")}
                                className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleAction(req, "overtime", "reject")}
                                className="p-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30 transition"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "shiftswap" && (
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/60 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Requested By</th>
                    <th className="px-6 py-4">Target Employee</th>
                    <th className="px-6 py-4">Swap details</th>
                    <th className="px-6 py-4">Consent Status</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {shiftSwaps.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-500">No shift swap requests.</td>
                    </tr>
                  ) : (
                    shiftSwaps.map((req) => (
                      <tr key={req.id} className="hover:bg-zinc-900/40 transition">
                        <td className="px-6 py-4 font-semibold text-white">{req.requesting_employee_name}</td>
                        <td className="px-6 py-4 text-zinc-400">{req.target_employee_name}</td>
                        <td className="px-6 py-4 text-zinc-400">
                          {req.requesting_shift_date} ↔ {req.target_shift_date}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.target_employee_consented ? "bg-emerald-500/10 text-emerald-400" :
                            req.target_employee_consented === false ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {req.target_employee_consented ? "Consented" : req.target_employee_consented === false ? "Declined" : "Pending Target"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" :
                            req.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          {req.status === "PENDING_MANAGER" && (
                            <>
                              <button
                                onClick={() => handleAction(req, "shiftswap", "approve")}
                                className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleAction(req, "shiftswap", "reject")}
                                className="p-1 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30 transition"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Attendance Detail Modal */}
      {detailModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Attendance Detail</h2>
              <button onClick={() => setDetailModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Employee</p>
                <p className="text-white font-semibold">{selectedLog.employee_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Date</p>
                <p className="text-white font-semibold">{selectedLog.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Shift</p>
                <p className="text-white">{selectedLog.shift || "GENERAL"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Status</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                  selectedLog.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400" :
                  selectedLog.status === "ABSENT" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                }`}>{selectedLog.status}</span>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Check-in Time</p>
                <p className="text-white">{selectedLog.check_in_time ? selectedLog.check_in_time.slice(0, 5) : "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Check-out Time</p>
                <p className="text-white">{selectedLog.check_out_time ? selectedLog.check_out_time.slice(0, 5) : "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Check-in Location</p>
                <p className="text-white">{selectedLog.check_in_location || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Check-out Location</p>
                <p className="text-white">{selectedLog.check_out_location || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Working Hours</p>
                <p className="text-white">{selectedLog.working_hours ? `${selectedLog.working_hours} hrs` : "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Late By</p>
                <p className="text-white">{selectedLog.is_late ? `${selectedLog.late_by_minutes || 0} min` : "On Time"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Early Checkout</p>
                <p className="text-white">{selectedLog.is_early_checkout ? `${selectedLog.early_by_minutes || 0} min` : "No"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-wider">Regularized</p>
                <p className="text-white">{selectedLog.is_regularized ? "Yes" : "No"}</p>
              </div>
            </div>
            <div className="pt-2">
              <button onClick={() => setDetailModalOpen(false)}
                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold text-white">Reject Request</h2>
            <p className="text-zinc-400 text-sm">Please enter the reason for rejecting this request.</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="E.g., Missing documentation, incorrect hours..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
