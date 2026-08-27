import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Loader2 } from "lucide-react";
import { createWorkItem, updateWorkItem } from "../../services/workItemService";
import EmployeeSelect from "../shared/EmployeeSelect";

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21];

const DEV_TYPES = ["EPIC", "STORY", "TASK", "BUG"];

const ISSUE_TYPES = [
  { value: "TASK", label: "Task", color: "blue" },
  { value: "STORY", label: "Story", color: "green" },
  { value: "BUG", label: "Bug", color: "red" },
  { value: "EPIC", label: "Epic", color: "purple" },
  { value: "SUBTASK", label: "Sub-task", color: "zinc" },
  { value: "TICKET", label: "Ticket", color: "cyan" },
  { value: "DEAL", label: "Deal", color: "amber" },
  { value: "REQUEST", label: "Request", color: "pink" },
  { value: "APPROVAL", label: "Approval", color: "emerald" },
];

const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const WorkItemDialog = ({ isOpen, onClose, projectId, initialData, statusId, onSaved }) => {
  const [form, setForm] = useState({
    project: projectId || "",
    title: "",
    description: "",
    issue_type: "TASK",
    priority: "MEDIUM",
    story_points: null,
    status: statusId || "",
    assignee: null,
    due_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          project: initialData.project || projectId || "",
          title: initialData.title || "",
          description: initialData.description || "",
          issue_type: initialData.issue_type || "TASK",
          priority: initialData.priority || "MEDIUM",
          story_points: initialData.story_points ?? null,
          status: initialData.status || statusId || "",
          assignee: initialData.assignee || null,
          due_date: initialData.due_date?.split("T")[0] || "",
        });
      } else {
        setForm({
          project: projectId || "",
          title: "",
          description: "",
          issue_type: "TASK",
          priority: "MEDIUM",
          story_points: null,
          status: statusId || "",
          assignee: null,
          due_date: "",
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, projectId, statusId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.project && !isEditing) {
      setError("Project is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      };

      let response;
      if (isEditing) {
        response = await updateWorkItem(initialData.id, data);
      } else {
        response = await createWorkItem(data);
      }

      onSaved?.(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? "Edit Item" : "Create New Item"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Issue Type */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {ISSUE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, issue_type: type.value })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    form.issue_type === type.value
                      ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                      : "bg-zinc-800 border-zinc-700 text-white/40 hover:border-zinc-600"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter a clear title..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add a description..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Story Points — only for Dev types */}
          {DEV_TYPES.includes(form.issue_type) && (
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Story Points
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FIBONACCI.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, story_points: form.story_points === n ? null : n })}
                    className={cn(
                      "w-9 h-9 rounded-lg text-xs font-bold transition-all border",
                      form.story_points === n
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                        : "bg-zinc-800 border-zinc-700 text-white/40 hover:border-zinc-600 hover:text-white/60"
                    )}
                  >
                    {n}
                  </button>
                ))}
                <input
                  type="number"
                  value={form.story_points ?? ""}
                  onChange={(e) => setForm({ ...form, story_points: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="?"
                  className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-center text-white outline-none focus:border-blue-500/50 [appearance:textfield]"
                  min={0}
                  max={999}
                />
              </div>
            </div>
          )}

          {/* Assignee */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Assignee</label>
            <EmployeeSelect
              value={form.assignee}
              onChange={(userId) => setForm({ ...form, assignee: userId })}
              placeholder="Assign to employee..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-white/60 hover:text-white hover:border-zinc-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkItemDialog;
