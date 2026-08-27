import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, DollarSign, RefreshCw, CheckCircle2, XCircle,
  Loader, AlertCircle, ArrowLeft, ChevronRight, User
} from "lucide-react";
import { useHR } from "../context/HRContext";
import {
  leaveAPI, salaryRevisionAPI, overtimeAPI,
  shiftSwapAPI, regularizationAPI
} from "../services/hrAPI";
import { formatDate, formatCurrency } from "../utils/helpers";

export default function MSSApprovals() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leaves");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    leaves: [],
    revisions: [],
    overtime: [],
    shiftSwaps: [],
    regularization: [],
  });

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const [leaveRes, revRes, otRes, swapRes, regRes] = await Promise.all([
        leaveAPI.getLeaveApplications({ approval_status: "PENDING" }).catch(() => ({ data: [] })),
        salaryRevisionAPI.getPendingApprovals().catch(() => ({ data: [] })),
        overtimeAPI.getPendingApprovals().catch(() => ({ data: [] })),
        shiftSwapAPI.getRequests({ status: "PENDING_MANAGER" }).catch(() => ({ data: [] })),
        regularizationAPI.getPendingApprovals().catch(() => ({ data: [] })),
      ]);
      setData({
        leaves: leaveRes.data?.results || leaveRes.data || [],
        revisions: revRes.data?.results || revRes.data || [],
        overtime: otRes.data?.results || otRes.data || [],
        shiftSwaps: swapRes.data?.results || swapRes.data || [],
        regularization: regRes.data?.results || regRes.data || [],
      });
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "leaves", label: "Leave", count: data.leaves.length, icon: Calendar, color: "green" },
    { id: "revisions", label: "Salary Revision", count: data.revisions.length, icon: DollarSign, color: "blue" },
    { id: "overtime", label: "Overtime", count: data.overtime.length, icon: Clock, color: "orange" },
    { id: "shifts", label: "Shift Swap", count: data.shiftSwaps.length, icon: RefreshCw, color: "cyan" },
    { id: "reg", label: "Regularization", count: data.regularization.length, icon: CheckCircle2, color: "yellow" },
  ];

  const ApproveRejectButtons = ({ onApprove, onReject, loading }) => (
    <div className="flex gap-2">
      <button onClick={onApprove} disabled={loading}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
        <CheckCircle2 size={12} /> Approve
      </button>
      <button onClick={onReject} disabled={loading}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
        <XCircle size={12} /> Reject
      </button>
    </div>
  );

  const TAB_COLORS = {
    green: "bg-green-600 text-white",
    blue: "bg-blue-600 text-white",
    orange: "bg-orange-600 text-white",
    cyan: "bg-cyan-600 text-white",
    yellow: "bg-yellow-600 text-white",
  };

  const TabButton = ({ tab, isActive, onClick }) => (
    <button onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
        isActive ? TAB_COLORS[tab.color] : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
      }`}>
      <tab.icon size={14} />
      {tab.label}
      {tab.count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
          isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
        }`}>{tab.count}</span>
      )}
    </button>
  );

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="p-12 rounded-xl border border-dashed border-white/10 text-center">
      <Icon size={40} className="text-white/20 mx-auto mb-3" />
      <p className="text-white/60 text-sm">{message}</p>
      <p className="text-white/30 text-xs mt-1">All caught up!</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-xl z-10 sticky top-0">
        <button onClick={() => navigate('/hr/mss')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Manager Dashboard
        </button>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
          <User size={10} className="text-green-400" /> Manager Self-Service
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <CheckCircle2 size={32} className="text-green-500" /> Approvals Hub
        </h1>
        <p className="text-sm text-white/40 font-medium">Review and manage all pending team approvals in one place.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map((tab) => (
            <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : (
          <>
            {/* === LEAVE APPROVALS === */}
            {activeTab === "leaves" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Pending Leave Approvals</h2>
                {data.leaves.length === 0 ? <EmptyState icon={Calendar} message="No pending leave requests" /> : (
                  data.leaves.map((l) => (
                    <div key={l.id} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-green-500/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-white">{l.employee_name || "Employee"}</p>
                          <p className="text-xs text-white/50 mt-0.5">{l.leave_type_name}</p>
                        </div>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">{l.number_of_days} day(s)</span>
                      </div>
                      <p className="text-sm text-white/60 mb-3">{formatDate(l.date_from)} → {formatDate(l.date_to)}</p>
                      <p className="text-xs text-white/40 mb-4 italic">"{l.reason?.slice(0, 100)}"</p>
                      <ApproveRejectButtons
                        onApprove={async () => { await leaveAPI.approveLeave(l.id); loadApprovals(); }}
                        onReject={async () => { await leaveAPI.rejectLeave(l.id, "Declined"); loadApprovals(); }}
                        loading={false} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === SALARY REVISIONS === */}
            {activeTab === "revisions" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Pending Salary Revisions</h2>
                {data.revisions.length === 0 ? <EmptyState icon={DollarSign} message="No pending salary revisions" /> : (
                  data.revisions.map((r) => (
                    <div key={r.id} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-500/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-white">{r.employee_name || "Employee"}</p>
                          <p className="text-xs text-white/50 mt-0.5">{r.revision_type} | <span className="text-green-400">{(r.percentage_increase || 0).toFixed(1)}% increase</span></p>
                        </div>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{r.status?.replace(/_/g, " ")}</span>
                      </div>
                      <p className="text-sm text-white/60 mb-4">
                        {formatCurrency(r.previous_ctc)} → <span className="text-green-400 font-semibold">{formatCurrency(r.revised_ctc)}</span>
                      </p>
                      <ApproveRejectButtons
                        onApprove={async () => { await salaryRevisionAPI.approveManager(r.id); loadApprovals(); }}
                        onReject={async () => { await salaryRevisionAPI.rejectRevision(r.id, "Declined"); loadApprovals(); }}
                        loading={false} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === OVERTIME APPROVALS === */}
            {activeTab === "overtime" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Pending Overtime Approvals</h2>
                {data.overtime.length === 0 ? <EmptyState icon={Clock} message="No pending overtime requests" /> : (
                  data.overtime.map((ot) => (
                    <div key={ot.id} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-orange-500/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-white">{ot.employee_name || "Employee"}</p>
                          <p className="text-xs text-white/50 mt-0.5">{formatDate(ot.date)}</p>
                        </div>
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">{ot.ot_hours || "?"}h OT</span>
                      </div>
                      <p className="text-xs text-white/40 mb-4 italic">"{ot.reason?.slice(0, 100)}"</p>
                      <ApproveRejectButtons
                        onApprove={async () => { await overtimeAPI.approveRequest(ot.id); loadApprovals(); }}
                        onReject={async () => { await overtimeAPI.rejectRequest(ot.id, "Declined"); loadApprovals(); }}
                        loading={false} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === SHIFT SWAP APPROVALS === */}
            {activeTab === "shifts" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Pending Shift Swap Approvals</h2>
                {data.shiftSwaps.length === 0 ? <EmptyState icon={RefreshCw} message="No pending shift swaps to approve" /> : (
                  data.shiftSwaps.map((swap) => (
                    <div key={swap.id} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-white">{swap.requesting_employee_name} ↔ {swap.target_employee_name}</p>
                          <p className="text-xs text-white/50 mt-0.5">From: {formatDate(swap.requesting_shift_date)} → To: {formatDate(swap.target_shift_date)}</p>
                        </div>
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">Awaiting Manager</span>
                      </div>
                      <p className="text-xs text-white/40 mb-4 italic">"{swap.reason?.slice(0, 100)}"</p>
                      <ApproveRejectButtons
                        onApprove={async () => { await shiftSwapAPI.approveRequest(swap.id); loadApprovals(); }}
                        onReject={async () => { await shiftSwapAPI.rejectRequest(swap.id, "Declined"); loadApprovals(); }}
                        loading={false} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* === REGULARIZATION APPROVALS === */}
            {activeTab === "reg" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Pending Regularization Approvals</h2>
                {data.regularization.length === 0 ? <EmptyState icon={CheckCircle2} message="No pending regularization requests" /> : (
                  data.regularization.map((reg) => (
                    <div key={reg.id} className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-yellow-500/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-white">{reg.employee_name || "Employee"}</p>
                          <p className="text-xs text-white/50 mt-0.5">Attendance: {formatDate(reg.attendance_date)}</p>
                        </div>
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">{reg.requested_status || "Change"}</span>
                      </div>
                      <p className="text-xs text-white/40 mb-4 italic">"{reg.reason?.slice(0, 100)}"</p>
                      <ApproveRejectButtons
                        onApprove={async () => { await regularizationAPI.approveRequest(reg.id); loadApprovals(); }}
                        onReject={async () => { await regularizationAPI.rejectRequest(reg.id, "Declined"); loadApprovals(); }}
                        loading={false} />
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
