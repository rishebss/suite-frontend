import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle, XCircle, Plus, Edit2, Trash2, Loader2, ThumbsUp, ThumbsDown
} from "lucide-react";
import {
  fetchApprovalWorkflows, createApprovalWorkflow, updateApprovalWorkflow,
  deleteApprovalWorkflow, fetchApprovalRequests, approveRequest, rejectRequest
} from "../services/approvalService";

const ApprovalWorkflowsView = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("workflows");
  const [workflows, setWorkflows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ project: projectId || "", name: "", approval_type: "SEQUENTIAL", issue_type_filter: "" });
  const [stepsForm, setStepsForm] = useState([{ name: "", assignee_role: "", required_approvals: 1 }]);

  const fetchWorkflows = useCallback(() => {
    setLoading(true);
    const params = {};
    if (projectId) params.project = projectId;
    fetchApprovalWorkflows(params)
      .then(({ data }) => setWorkflows(data.results || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const fetchRequests = useCallback(() => {
    fetchApprovalRequests({})
      .then(({ data }) => setRequests(data.results || data || []))
      .catch(console.error);
  }, []);

  useEffect(() => { if (tab === "workflows") fetchWorkflows(); else fetchRequests(); }, [tab, fetchWorkflows, fetchRequests]);

  const openCreate = () => {
    setEditing(null);
    setForm({ project: projectId || "", name: "", approval_type: "SEQUENTIAL", issue_type_filter: "" });
    setStepsForm([{ name: "", assignee_role: "", required_approvals: 1 }]);
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (editing) {
        await updateApprovalWorkflow(editing.id, payload);
      } else {
        await createApprovalWorkflow(payload);
      }
      setShowDialog(false);
      fetchWorkflows();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this approval workflow?")) return;
    try { await deleteApprovalWorkflow(id); fetchWorkflows(); } catch (err) { console.error(err); }
  };

  const handleApprove = async (id, comment = "") => {
    try { await approveRequest(id, comment); fetchRequests(); } catch (err) { console.error(err); }
  };

  const handleReject = async (id, comment = "") => {
    try { await rejectRequest(id, comment); fetchRequests(); } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"><ArrowLeft size={16} /></button>
          <h1 className="text-lg font-bold text-white">Approval Workflows</h1>
        </div>
        <div className="flex items-center gap-2">
          {["workflows", "requests"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                tab === t ? "bg-blue-600 text-white" : "bg-zinc-800 text-white/50 hover:text-white"
              )}>{t === "workflows" ? "Workflows" : "Pending Approvals"}</button>
          ))}
          {tab === "workflows" && (
            <button onClick={openCreate} className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">
              <Plus size={14} /> New Workflow
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-white/20" /></div>
        ) : tab === "workflows" ? (
          workflows.length === 0 ? (
            <div className="text-center py-20 text-white/30 text-sm">No approval workflows.</div>
          ) : (
            <div className="space-y-2">
              {workflows.map((w) => (
                <div key={w.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-white">{w.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">{w.approval_type}</span>
                        {w.issue_type_filter && <span className="text-[10px] text-white/30">{w.issue_type_filter}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(w)} className="p-1.5 rounded hover:bg-zinc-800 text-white/30 hover:text-white"><Edit2 size={12} /></button>
                      <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded hover:bg-red-900/30 text-white/30 hover:text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  {w.steps?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {w.steps.map((s, i) => (
                        <React.Fragment key={s.id}>
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-white/40">{s.name}</span>
                          {i < w.steps.length - 1 && <span className="text-white/20 text-[10px]">→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          requests.length === 0 ? (
            <div className="text-center py-20 text-white/30 text-sm">No pending approvals.</div>
          ) : (
            <div className="space-y-2">
              {requests.filter((r) => r.status === "PENDING").map((r) => (
                <div key={r.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-white">{r.work_item_title || r.work_item}</h3>
                      <p className="text-xs text-white/40 mt-0.5">{r.workflow_name || r.workflow}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleApprove(r.id)} className="flex items-center gap-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-[10px]"><ThumbsUp size={10} /> Approve</button>
                      <button onClick={() => handleReject(r.id)} className="flex items-center gap-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-[10px]"><ThumbsDown size={10} /> Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-base font-semibold text-white mb-4">{editing ? "Edit Workflow" : "New Approval Workflow"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Approval Type</label>
                <select value={form.approval_type} onChange={(e) => setForm({ ...form, approval_type: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="SINGLE">Single Step</option>
                  <option value="SEQUENTIAL">Sequential</option>
                  <option value="PARALLEL">Parallel</option>
                  <option value="ANY">Any Approver</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Issue Type Filter (optional)</label>
                <input value={form.issue_type_filter} onChange={(e) => setForm({ ...form, issue_type_filter: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium">
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflowsView;
