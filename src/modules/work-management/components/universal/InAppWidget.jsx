import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { submitWebForm } from "../../services/intakeService";

const InAppWidget = ({ projectId, position = "bottom-right" }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", email: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await submitWebForm({ project_id: projectId, ...form });
      setSuccess(true);
      setForm({ title: "", description: "", email: "", name: "" });
      setTimeout(() => { setSuccess(false); setOpen(false); }, 2000);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const posStyles = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <>
      {open && (
        <div className={cn("fixed z-50 w-80", posStyles[position] || posStyles["bottom-right"])} style={{ bottom: "5rem" }}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <span className="text-sm font-semibold text-white">Report an Issue</span>
              <button onClick={() => { setOpen(false); setSuccess(false); setError(""); }} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                <X size={14} className="text-white/40" />
              </button>
            </div>
            {success ? (
              <div className="p-6 text-center">
                <Send size={24} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400">Submitted successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div>
                  <input
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name (optional)"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <input
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Your email (optional)"
                    type="email"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <input
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief summary *"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <textarea
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the issue..."
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting || !form.title.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all",
          posStyles[position] || posStyles["bottom-right"],
          open ? "bg-zinc-700 rotate-45" : "bg-blue-600 hover:bg-blue-500"
        )}
      >
        {open ? <X size={20} className="text-white" /> : <MessageSquare size={20} className="text-white" />}
      </button>
    </>
  );
};

export default InAppWidget;
