import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Loader2, ExternalLink, Edit3,
  Link as LinkIcon, Trash2, GitBranch, AlertCircle,
  Play, Pause, Star,
} from "lucide-react";
import { fetchWorkItem, updateWorkItem, deleteWorkItem, createLink, deleteLink } from "../services/workItemService";
import { submitCSAT, startItemSLA } from "../services/ticketService";
import StatusBadge from "../components/universal/StatusBadge";
import PriorityBadge from "../components/universal/PriorityBadge";
import CommentThread from "../components/shared/CommentThread";
import ActivityLog from "../components/shared/ActivityLog";
import TimeTracker from "../components/shared/TimeTracker";
import AttachmentUpload from "../components/shared/AttachmentUpload";

const WorkItemDetail = () => {
  const { workspaceId, projectId, itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [csatRating, setCsatRating] = useState(null);
  const [csatSubmitting, setCsatSubmitting] = useState(false);
  const [slaStarting, setSlaStarting] = useState(false);

  const loadItem = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const { data } = await fetchWorkItem(itemId);
      setItem(data);
      setTitle(data.title);
      setDescription(data.description || "");
    } catch (err) {
      console.error("Failed to load work item:", err);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => { loadItem(); }, [loadItem]);

  const handleSave = async () => {
    try {
      const { data } = await updateWorkItem(itemId, { title, description });
      setItem(data);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this work item?")) return;
    try {
      await deleteWorkItem(itemId);
      navigate(`/work/${workspaceId}/${projectId}/board`);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleTimeLog = async (logData) => {
    try {
      const axios = (await import("axios")).default;
      await axios.post("/api/work/items/" + itemId + "/log-time/", logData);
      loadItem();
    } catch (err) {
      if (err.response?.status === 405) {
        console.warn("Time log endpoint not yet implemented on backend");
      }
    }
  };

  const handleDeleteTime = async (logId) => {
    try {
      const axios = (await import("axios")).default;
      await axios.delete("/api/work/items/" + itemId + "/log-time/" + logId + "/");
    } catch (err) {
      console.warn("Time log delete not implemented on backend");
    }
  };

  const handleUpload = async (formData) => {
    try {
      const axios = (await import("axios")).default;
      await axios.post("/api/work/attachments/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadItem();
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const handleDeleteAttachment = async (attId) => {
    try {
      const axios = (await import("axios")).default;
      await axios.delete(`/api/work/attachments/${attId}/`);
      loadItem();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-white/40">Work item not found</p>
        <button
          onClick={() => navigate(`/work/${workspaceId}/${projectId}/board`)}
          className="px-4 py-2 rounded-lg bg-zinc-800 text-white/60 hover:text-white transition-colors text-sm"
        >
          Back to board
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-10 py-4 border-b border-zinc-800 bg-black/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs font-mono text-white/30 font-medium">{item.key}</span>
            <StatusBadge status={item.status_details} />
            <PriorityBadge priority={item.priority} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-blue-400 transition-colors"
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xl font-bold text-white focus:outline-none focus:border-blue-500/50"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
          ) : (
            <h1 className="text-xl font-bold text-white">{item.title}</h1>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
              <h3 className="text-sm font-semibold text-white/80 mb-2">Description</h3>
              {editing ? (
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditing(false); setTitle(item.title); setDescription(item.description || ""); }}
                      className="px-4 py-2 rounded-lg bg-zinc-800 text-white/50 hover:text-white transition-all text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/60 whitespace-pre-wrap min-h-[40px]">
                  {item.description || <span className="text-white/20 italic">No description</span>}
                </p>
              )}
            </div>

            {/* Subtasks */}
            {item.subtasks?.length > 0 && (
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                <h3 className="text-sm font-semibold text-white/80 mb-3">
                  Subtasks ({item.subtasks.length})
                </h3>
                <div className="space-y-1">
                  {item.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => navigate(`/work/${workspaceId}/${projectId}/item/${st.id}`)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <GitBranch size={12} className="text-white/30 shrink-0" />
                      <span className="text-xs font-mono text-white/30">{st.key}</span>
                      <span className="text-sm text-white/70 truncate">{st.title}</span>
                      <StatusBadge status={st.status_details} compact />
                      <PriorityBadge priority={st.priority} compact />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {((item.outgoing_links?.length > 0) || (item.incoming_links?.length > 0)) && (
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Linked Items</h3>
                <div className="space-y-1">
                  {item.outgoing_links?.map((link) => (
                    <div key={link.id} className="flex items-center gap-2 p-2 rounded-lg text-sm">
                      <LinkIcon size={12} className="text-blue-400 shrink-0" />
                      <span className="text-white/50">{link.relation_type.replace(/_/g, " ")}</span>
                      <span className="font-mono text-white/30 text-xs">{link.target_key}</span>
                    </div>
                  ))}
                  {item.incoming_links?.map((link) => (
                    <div key={link.id} className="flex items-center gap-2 p-2 rounded-lg text-sm">
                      <LinkIcon size={12} className="text-purple-400 shrink-0" />
                      <span className="text-white/50">{link.source_key}</span>
                      <span className="text-white/30">{link.relation_type.replace(/_/g, " ")}</span>
                      <span className="text-white/50">this</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
              <CommentThread
                workItemId={itemId}
                comments={item.comments}
                onRefresh={loadItem}
              />
            </div>

            {/* Activity Log */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
              <ActivityLog logs={item.activity_logs} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-3">
              <h3 className="text-sm font-semibold text-white/80">Details</h3>
              <DetailRow label="Issue Type" value={item.issue_type} />
              <DetailRow label="Status" value={item.status_details?.name} />
              <DetailRow label="Priority" value={item.priority} />
              <DetailRow label="Assignee" value={item.assignee_details ? `${item.assignee_details.first_name} ${item.assignee_details.last_name}`.trim() || item.assignee_details.email : "Unassigned"} />
              <DetailRow label="Reporter" value={item.reporter_details ? `${item.reporter_details.first_name} ${item.reporter_details.last_name}`.trim() || item.reporter_details.email : "Unknown"} />
              {item.story_points && <DetailRow label="Story Points" value={item.story_points} />}
              {item.sprint_details && <DetailRow label="Sprint" value={item.sprint_details.name} />}
              {item.epic_details && <DetailRow label="Epic" value={item.epic_details.key} />}
              {item.due_date && <DetailRow label="Due Date" value={new Date(item.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />}
              {item.created_at && <DetailRow label="Created" value={new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />}
              {item.issue_type === "TICKET" && (
                <>
                  <div className="border-t border-zinc-800 pt-2 mt-2">
                    <DetailRow label="SLA Status" value={item.sla_status?.replace(/_/g, " ") || "Not set"} />
                  </div>
                  {item.sla_status && item.sla_status !== "BREACHED" && (
                    <button
                      onClick={async () => {
                        setSlaStarting(true);
                        try {
                          await startItemSLA(itemId);
                          loadItem();
                        } catch (err) {
                          console.error("Failed to start SLA:", err);
                        } finally {
                          setSlaStarting(false);
                        }
                      }}
                      disabled={slaStarting}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-[10px] font-semibold transition-all mt-2 disabled:opacity-50"
                    >
                      {slaStarting ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                      {item.sla_status ? "Restart SLA Timer" : "Start SLA Timer"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Time Tracking */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
              <TimeTracker
                workItemId={itemId}
                onLogTime={handleTimeLog}
                onDeleteTime={handleDeleteTime}
              />
            </div>

            {/* Attachments */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
              <AttachmentUpload
                workItemId={itemId}
                attachments={item.attachments}
                onUpload={handleUpload}
                onDelete={handleDeleteAttachment}
              />
            </div>

            {/* CSAT Survey — for resolved tickets */}
            {item.issue_type === "TICKET" && item.status_details?.category === "done" && !csatRating && (
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Rate Resolution</h3>
                <p className="text-[10px] text-white/30 mb-2">How satisfied are you with how this ticket was handled?</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={async () => {
                        setCsatSubmitting(true);
                        try {
                          await submitCSAT(itemId, rating, "", "");
                          setCsatRating(rating);
                        } catch (err) {
                          console.error("CSAT failed:", err);
                        } finally {
                          setCsatSubmitting(false);
                        }
                      }}
                      disabled={csatSubmitting}
                      className="p-1 rounded hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      <Star size={16} className="text-white/20 hover:text-amber-400/50 transition-colors" />
                    </button>
                  ))}
                  {csatSubmitting && <Loader2 size={12} className="animate-spin text-white/30 ml-1" />}
                </div>
              </div>
            )}
            {csatRating && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span>Rated {csatRating}/5</span>
                </div>
              </div>
            )}

            {/* Watchers */}
            {item.watchers?.length > 0 && (
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                <h3 className="text-sm font-semibold text-white/80 mb-2">Watchers ({item.watchers.length})</h3>
                <div className="space-y-1">
                  {item.watchers.map((w) => (
                    <div key={w.id} className="flex items-center gap-2 text-xs text-white/50">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[7px] font-bold text-white">
                        {(w.first_name?.[0] || w.email?.[0] || "?").toUpperCase()}
                      </div>
                      {w.first_name} {w.last_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-white/40">{label}</span>
    <span className="text-xs text-white/70 font-medium truncate ml-2">{value || "-"}</span>
  </div>
);

export default WorkItemDetail;
