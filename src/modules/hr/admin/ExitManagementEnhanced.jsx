import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader, Plus, X, CheckCircle2, XCircle, DollarSign, Users } from "lucide-react";
import { exitAPI, employeeAPI } from "../services/hrAPI";

export default function ExitManagementEnhanced() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [interviews, setInterviews] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resignations, setResignations] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [invRes, setRes, alRes, sigRes, empRes] = await Promise.all([
        exitAPI.getExitInterviews().catch(() => ({ data: [] })),
        exitAPI.getFnFSettlements().catch(() => ({ data: [] })),
        exitAPI.getAlumniRecords().catch(() => ({ data: [] })),
        exitAPI.getResignations().catch(() => ({ data: [] })),
        employeeAPI.getEmployees().catch(() => ({ data: [] })),
      ]);
      setInterviews(invRes.data.results || invRes.data || []);
      setSettlements(setRes.data.results || setRes.data || []);
      setAlumni(alRes.data.results || alRes.data || []);
      setResignations(sigRes.data.results || sigRes.data || []);
      setEmployees(empRes.data?.results || empRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "resignations", label: `Resignations (${resignations.length})` },
    { id: "interviews", label: `Exit Interviews (${interviews.length})` },
    { id: "settlements", label: `F&F Settlements (${settlements.length})` },
    { id: "alumni", label: `Alumni (${alumni.length})` },
  ];

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-10 py-8 border-b border-white/5 shrink-0">
        <button onClick={() => navigate('/hr/admin/exits')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm">
          <ChevronLeft size={16} /> Back to Exit Dashboard
        </button>
        <h1 className="text-3xl font-bold text-white">Exit Management</h1>
        <p className="text-sm text-white/40 font-medium mt-1">Manage resignations, exit interviews, F&F settlements, and alumni portal</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader size={20} className="text-blue-500 animate-spin mr-2" />
              <span className="text-white/40">Loading...</span>
            </div>
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab data={{ resignations, interviews, settlements, alumni }} onRefresh={loadAll} employees={employees} />}
              {activeTab === "resignations" && <ResignationsTab data={resignations} onRefresh={loadAll} />}
              {activeTab === "interviews" && <InterviewsTab data={interviews} onRefresh={loadAll} employees={employees} resignations={resignations} />}
              {activeTab === "settlements" && <SettlementsTab data={settlements} onRefresh={loadAll} employees={employees} resignations={resignations} />}
              {activeTab === "alumni" && <AlumniTab data={alumni} onRefresh={loadAll} employees={employees} resignations={resignations} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-500/10 text-yellow-400",
    COMPLETED: "bg-green-500/10 text-green-400",
    DRAFT: "bg-white/10 text-white/50",
    PENDING_HR: "bg-yellow-500/10 text-yellow-400",
    PENDING_FINANCE: "bg-orange-500/10 text-orange-400",
    APPROVED: "bg-green-500/10 text-green-400",
    PAID: "bg-blue-500/10 text-blue-400",
    CANCELLED: "bg-red-500/10 text-red-400",
    Pending: "bg-yellow-500/10 text-yellow-400",
    Approved: "bg-green-500/10 text-green-400",
    Rejected: "bg-red-500/10 text-red-400",
    Withdrawn: "bg-white/10 text-white/50",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-white/10 text-white/50"}`}>{status}</span>;
}

/* ---------- OVERVIEW ---------- */
function OverviewTab({ data }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card count={data.resignations.length} label="Total Resignations" color="text-blue-400" />
      <Card count={data.interviews.filter(i => i.status === "PENDING").length} label="Pending Interviews" color="text-yellow-400" />
      <Card count={data.settlements.filter(s => s.status !== "PAID").length} label="Pending Settlements" color="text-orange-400" />
      <Card count={data.alumni.length} label="Alumni Records" color="text-purple-400" />
    </div>
  );
}
function Card({ count, label, color }) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/10 p-4">
      <p className={`text-2xl font-bold ${color}`}>{count}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

/* ---------- RESIGNATIONS ---------- */
function ResignationsTab({ data, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [lastWorkingDay, setLastWorkingDay] = useState("");
  const [approveError, setApproveError] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const handleApprove = async () => {
    if (!lastWorkingDay) return;
    const id = approveModal;
    setApproveLoading(true);
    setApproveError(null);
    try {
      await exitAPI.approveResignation(id, lastWorkingDay);
      setApproveModal(null);
      setLastWorkingDay("");
      onRefresh();
    } catch (e) {
      const d = e.response?.data;
      setApproveError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to approve");
    } finally { setApproveLoading(false); }
  };

  const handleReject = async (id) => {
    setRejectModal(null);
    setActionLoading(id);
    try { await exitAPI.rejectResignation(id, "Rejected by HR"); onRefresh(); } catch (e) { alert("Failed to reject"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/10">
      {data.length === 0 ? <Empty>No resignations</Empty> : (
        <div className="divide-y divide-white/5">
          {data.map((r) => (
            <div key={r.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{r.employee_name || r.employee?.first_name} {r.employee?.last_name}</p>
                  <p className="text-sm text-white/50">Submitted: {r.submitted_on} | Last day: {r.approved_last_working_day || r.requested_last_working_day}</p>
                  <p className="text-xs text-white/40 truncate max-w-md">{r.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={() => { setApproveModal(r.id); setApproveError(null); }} disabled={actionLoading === r.id}
                        className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors" title="Approve">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => setRejectModal(r.id)} disabled={actionLoading === r.id}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Reject">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {approveModal && (
        <Modal title="Approve Resignation" onClose={() => { setApproveModal(null); setLastWorkingDay(""); setApproveError(null); }}>
          <div className="space-y-4">
            {approveError && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{approveError}</p>}
            <Field label="Last Working Day *">
              <input required type="date" value={lastWorkingDay} onChange={e => setLastWorkingDay(e.target.value)} />
            </Field>
            <div className="flex gap-3">
              <button onClick={() => { setApproveModal(null); setLastWorkingDay(""); setApproveError(null); }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm">Cancel</button>
              <button onClick={handleApprove} disabled={!lastWorkingDay || approveLoading} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
                {approveLoading ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {rejectModal && (
        <ConfirmModal
          title="Reject Resignation"
          message="Are you sure you want to reject this resignation?"
          onConfirm={() => handleReject(rejectModal)}
          onCancel={() => setRejectModal(null)}
        />
      )}
    </div>
  );
}

/* ---------- EXIT INTERVIEWS ---------- */
function InterviewsTab({ data, onRefresh, employees, resignations }) {
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [completeModal, setCompleteModal] = useState(null);
  const [satisfaction, setSatisfaction] = useState("");
  const [completeError, setCompleteError] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

  const handleComplete = async () => {
    const id = completeModal;
    const score = satisfaction;
    if (!score) return;
    setCompleteLoading(true);
    setCompleteError(null);
    try {
      await exitAPI.completeExitInterview(id, { overall_satisfaction: parseInt(score) });
      setCompleteModal(null);
      setSatisfaction("");
      onRefresh();
    } catch (e) {
      const d = e.response?.data;
      setCompleteError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to complete");
    } finally { setCompleteLoading(false); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={14} /> New Interview
        </button>
      </div>
      <div className="bg-white/[0.03] rounded-xl border border-white/10">
        {data.length === 0 ? <Empty>No exit interviews</Empty> : (
          <div className="divide-y divide-white/5">
            {data.map((i) => (
              <div key={i.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{i.employee_name || i.employee?.first_name} {i.employee?.last_name}</p>
                    <p className="text-sm text-white/50">{i.interview_date} | Overall: {i.overall_satisfaction || "N/A"}/5</p>
                    {i.rehire_recommendation && <p className="text-xs text-white/40">Rehire: {i.rehire_recommendation}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={i.status} />
                    {i.status === 'PENDING' && (
                      <button onClick={() => setCompleteModal(i.id)} disabled={actionLoading === i.id}
                        className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors" title="Complete">
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completeModal && (
        <Modal title="Complete Exit Interview" onClose={() => { setCompleteModal(null); setSatisfaction(""); setCompleteError(null); }}>
          <div className="space-y-4">
            {completeError && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{completeError}</p>}
            <Field label="Overall Satisfaction (1-5) *">
              <input required type="number" min="1" max="5" value={satisfaction} onChange={e => setSatisfaction(e.target.value)} />
            </Field>
            <div className="flex gap-3">
              <button onClick={() => { setCompleteModal(null); setSatisfaction(""); setCompleteError(null); }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm">Cancel</button>
              <button onClick={handleComplete} disabled={!satisfaction || completeLoading} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
                {completeLoading ? "Completing..." : "Complete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <CreateInterviewModal
          employees={employees}
          resignations={resignations}
          onClose={() => setShowModal(false)}
          onCreated={onRefresh}
        />
      )}
    </>
  );
}

function CreateInterviewModal({ employees, resignations, onClose, onCreated }) {
  const [form, setForm] = useState({ employee: "", resignation: "", is_anonymous: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await exitAPI.createExitInterview({ ...form, status: "PENDING" });
      onCreated();
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to create");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="New Exit Interview" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <Field label="Employee">
          <select required value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}>
            <option value="">Select...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>)}
          </select>
        </Field>
        <Field label="Resignation">
          <select value={form.resignation} onChange={e => setForm({...form, resignation: e.target.value})}>
            <option value="">Select (optional)</option>
            {resignations.map(r => <option key={r.id} value={r.id}>{r.employee_name || r.employee?.first_name} - {r.submitted_on}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({...form, is_anonymous: e.target.checked})} />
          Anonymous interview
        </label>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
          {loading ? "Creating..." : "Create Interview"}
        </button>
      </form>
    </Modal>
  );
}

/* ---------- F&F SETTLEMENTS ---------- */
function SettlementsTab({ data, onRefresh, employees, resignations }) {
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [paidModal, setPaidModal] = useState(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidError, setPaidError] = useState(null);
  const [paidLoading, setPaidLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleAction = async (id, action) => {
    if (action === 'paid') {
      setPaidModal(id);
      setPaymentRef("");
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaidError(null);
      return;
    }
    setConfirmAction({ id, action });
  };

  const executeAction = async () => {
    const { id, action } = confirmAction;
    setConfirmAction(null);
    setConfirmLoading(true);
    try {
      if (action === 'approve_hr') await exitAPI.approveHrFnF(id);
      else if (action === 'approve_finance') await exitAPI.approveFinanceFnF(id);
      onRefresh();
    } catch (e) { alert("Action failed"); }
    finally { setConfirmLoading(false); }
  };

  const handleMarkPaid = async () => {
    if (!paymentRef) return;
    const id = paidModal;
    setPaidLoading(true);
    setPaidError(null);
    try {
      await exitAPI.markFnFPaid(id, paymentRef, paymentDate);
      setPaidModal(null);
      setPaymentRef("");
      onRefresh();
    } catch (e) {
      const d = e.response?.data;
      setPaidError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Action failed");
    } finally { setPaidLoading(false); }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={14} /> New Settlement
        </button>
      </div>
      <div className="bg-white/[0.03] rounded-xl border border-white/10">
        {data.length === 0 ? <Empty>No F&F settlements</Empty> : (
          <div className="divide-y divide-white/5">
            {data.map((s) => (
              <div key={s.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{s.employee_name || s.employee?.first_name} {s.employee?.last_name}</p>
                    <p className="text-sm text-white/60">Exit: {s.exit_date} | Net: ₹{(s.net_settlement || 0).toLocaleString()}</p>
                    <p className="text-xs text-white/40">Earnings: ₹{(s.total_earnings || 0).toLocaleString()} | Deductions: ₹{(s.total_deductions || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    {actionLoading === s.id && <Loader size={14} className="text-white/40 animate-spin" />}
                    {s.status === 'DRAFT' && (
                      <button onClick={() => handleAction(s.id, 'approve_hr')}
                        className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded text-xs transition-colors">Approve HR</button>
                    )}
                    {s.status === 'PENDING_HR' && (
                      <button onClick={() => handleAction(s.id, 'approve_hr')}
                        className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded text-xs transition-colors">Approve HR</button>
                    )}
                    {s.status === 'PENDING_FINANCE' && (
                      <button onClick={() => handleAction(s.id, 'approve_finance')}
                        className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded text-xs transition-colors">Approve Finance</button>
                    )}
                    {s.status === 'APPROVED' && (
                      <button onClick={() => handleAction(s.id, 'paid')}
                        className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded text-xs transition-colors">Mark Paid</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.action === 'approve_hr' ? "Approve (HR)" : "Approve (Finance)"}
          message={`Are you sure you want to ${confirmAction.action === 'approve_hr' ? 'HR-approve' : 'Finance-approve'} this settlement?`}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
          loading={confirmLoading}
        />
      )}

      {paidModal && (
        <Modal title="Mark as Paid" onClose={() => { setPaidModal(null); setPaymentRef(""); setPaidError(null); }}>
          <div className="space-y-4">
            {paidError && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{paidError}</p>}
            <Field label="Payment Reference *">
              <input required type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="e.g. NEFT-12345" />
            </Field>
            <Field label="Payment Date">
              <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </Field>
            <div className="flex gap-3">
              <button onClick={() => { setPaidModal(null); setPaymentRef(""); setPaidError(null); }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm">Cancel</button>
              <button onClick={handleMarkPaid} disabled={!paymentRef || paidLoading} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
                {paidLoading ? "Marking..." : "Mark Paid"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <CreateSettlementModal
          employees={employees}
          resignations={resignations}
          onClose={() => setShowModal(false)}
          onCreated={onRefresh}
        />
      )}
    </>
  );
}

function CreateSettlementModal({ employees, resignations, onClose, onCreated }) {
  const [form, setForm] = useState({ employee: "", resignation: "", exit_date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await exitAPI.createFnFSettlement({ ...form, resignation: form.resignation || null });
      onCreated();
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to create");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="New F&F Settlement" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <Field label="Employee *">
          <select required value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}>
            <option value="">Select...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>)}
          </select>
        </Field>
        <Field label="Exit Date *">
          <input required type="date" value={form.exit_date} onChange={e => setForm({...form, exit_date: e.target.value})} />
        </Field>
        <Field label="Resignation">
          <select value={form.resignation} onChange={e => setForm({...form, resignation: e.target.value})}>
            <option value="">Select (optional)</option>
            {resignations.map(r => <option key={r.id} value={r.id}>{r.employee_name || r.employee?.first_name} - {r.submitted_on}</option>)}
          </select>
        </Field>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
          {loading ? "Creating..." : "Create Settlement"}
        </button>
      </form>
    </Modal>
  );
}

/* ---------- ALUMNI ---------- */
function AlumniTab({ data, onRefresh, employees }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={14} /> Create Alumni
        </button>
      </div>
      <div className="bg-white/[0.03] rounded-xl border border-white/10">
        {data.length === 0 ? <Empty>No alumni records</Empty> : (
          <div className="divide-y divide-white/5">
            {data.map((a) => (
              <div key={a.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{a.employee_name || a.employee?.first_name} {a.employee?.last_name}</p>
                    <p className="text-sm text-white/50">Exit: {a.exit_date} | Email: {a.email}</p>
                    <p className="text-xs text-white/40">Access expires: {a.access_expiry_date} | {a.is_rehire_eligible ? "Rehire eligible" : "Not eligible"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {a.is_active ? "Active" : "Expired"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <CreateAlumniModal employees={employees} onClose={() => setShowModal(false)} onCreated={onRefresh} />}
    </>
  );
}

function CreateAlumniModal({ employees, onClose, onCreated }) {
  const [form, setForm] = useState({ employee: "", exit_date: "", email: "", access_expiry_date: "", is_rehire_eligible: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (form.exit_date && !form.access_expiry_date) {
      const d = new Date(form.exit_date);
      d.setFullYear(d.getFullYear() + 3);
      setForm(f => ({ ...f, access_expiry_date: d.toISOString().split('T')[0] }));
    }
  }, [form.exit_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await exitAPI.createAlumniRecord(form);
      onCreated();
      onClose();
    } catch (err) {
      const d = err.response?.data;
      setError(d && typeof d === 'object' ? Object.values(d).flat().join(' | ') : "Failed to create");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Create Alumni Record" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
        <Field label="Employee *">
          <select required value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}>
            <option value="">Select...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Exit Date *">
            <input required type="date" value={form.exit_date} onChange={e => setForm({...form, exit_date: e.target.value})} />
          </Field>
          <Field label="Access Expiry">
            <input type="date" value={form.access_expiry_date} onChange={e => setForm({...form, access_expiry_date: e.target.value})} />
          </Field>
        </div>
        <Field label="Personal Email *">
          <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="alumni@email.com" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input type="checkbox" checked={form.is_rehire_eligible} onChange={e => setForm({...form, is_rehire_eligible: e.target.checked})} />
          Rehire eligible
        </label>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm">
          {loading ? "Creating..." : "Create Alumni"}
        </button>
      </form>
    </Modal>
  );
}

/* ---------- SHARED ---------- */
function Empty({ children }) {
  return <div className="p-8 text-center text-white/40">{children}</div>;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <Modal title={title} onClose={loading ? undefined : onCancel}>
      <div className="space-y-4">
        <p className="text-white/70 text-sm">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all text-sm disabled:opacity-50">{loading ? "Processing..." : "Confirm"}</button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
      {React.cloneElement(children, { className: "w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm" })}
    </div>
  );
}
