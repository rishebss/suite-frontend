import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Ticket, Plus, Loader2, Send, CheckCircle2,
  Clock, AlertTriangle, Search, MessageSquare, Star,
} from "lucide-react";
import { fetchWorkItems, createWorkItem } from "../services/workItemService";
import { submitCSAT } from "../services/ticketService";
import StatusBadge from "../components/universal/StatusBadge";
import PriorityBadge from "../components/universal/PriorityBadge";

const ISSUE_TYPE_COLORS = {
  TICKET: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
  REQUEST: "from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-400",
};

const CustomerPortal = () => {
  const { projectId } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", requester_name: "", requester_email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [csatRatings, setCsatRatings] = useState({});
  const [csatSubmitting, setCsatSubmitting] = useState({});

  const loadTickets = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { data } = await fetchWorkItems({
        project: projectId,
        issue_type: "TICKET",
      });
      setTickets(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.requester_email.trim()) return;
    setSubmitting(true);
    try {
      await createWorkItem({
        project: projectId,
        title: form.title,
        description: form.description,
        issue_type: "TICKET",
        requester_name: form.requester_name,
        requester_email: form.requester_email,
      });
      setSubmitted(true);
      setForm({ title: "", description: "", requester_name: "", requester_email: "" });
      setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
    } catch (err) {
      console.error("Failed to submit ticket:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsatSubmit = async (ticketId, rating) => {
    setCsatSubmitting((prev) => ({ ...prev, [ticketId]: true }));
    try {
      await submitCSAT(ticketId, rating, "", "");
      setCsatRatings((prev) => ({ ...prev, [ticketId]: rating }));
    } catch (err) {
      console.error("CSAT submission failed:", err);
    } finally {
      setCsatSubmitting((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.key?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
          <Ticket size={28} className="text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Support Portal</h1>
        <p className="text-sm text-white/40 mt-1">Submit and track your support tickets</p>
      </div>

      {/* Submit Ticket Button / Form */}
      {!showForm ? (
        <div className="text-center mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-semibold"
          >
            <Plus size={16} />
            Submit a Ticket
          </button>
        </div>
      ) : submitted ? (
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center mb-8">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
          <p className="text-emerald-400 font-semibold">Ticket Submitted!</p>
          <p className="text-sm text-emerald-400/60 mt-1">We will get back to you shortly</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-zinc-900/40 border border-white/5 mb-8 space-y-4">
          <h3 className="text-sm font-semibold text-white/80">New Support Ticket</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Your Name</label>
              <input
                value={form.requester_name}
                onChange={(e) => setForm({ ...form, requester_name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Email *</label>
              <input
                type="email"
                value={form.requester_email}
                onChange={(e) => setForm({ ...form, requester_email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Subject *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief description of your issue"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Provide details about your issue..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-y"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 transition-all text-xs font-semibold"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg bg-zinc-800 text-white/50 hover:text-white transition-all text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/80">Your Tickets</h2>
          <span className="text-xs text-white/30">{filteredTickets.length} tickets</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-white/30" />
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/30 font-medium">{ticket.key}</span>
                  <StatusBadge status={ticket.status_details} compact />
                  <PriorityBadge priority={ticket.priority} compact />
                </div>
                {ticket.sla_status && (
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    ticket.sla_status === "BREACHED" ? "bg-red-500/10 text-red-400" :
                    ticket.sla_status === "WARNING" ? "bg-amber-500/10 text-amber-400" :
                    "bg-emerald-500/10 text-emerald-400",
                  )}>
                    {ticket.sla_status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {ticket.title}
              </h3>
              {ticket.description && (
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{ticket.description}</p>
              )}
              {/* CSAT Survey — only on resolved tickets */}
              {ticket.status_details?.category === "done" && !csatRatings[ticket.id] && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] text-white/30 mb-1.5">How satisfied are you with the resolution?</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleCsatSubmit(ticket.id, rating)}
                        disabled={csatSubmitting[ticket.id]}
                        className="p-0.5 rounded hover:bg-white/5 transition-colors disabled:opacity-50"
                      >
                        <Star
                          size={14}
                          className={cn(
                            "transition-colors",
                            csatRatings[ticket.id] >= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/20 hover:text-amber-400/50"
                          )}
                        />
                      </button>
                    ))}
                    {csatSubmitting[ticket.id] && <Loader2 size={10} className="animate-spin text-white/20 ml-1" />}
                  </div>
                </div>
              )}
              {csatRatings[ticket.id] && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
                  <CheckCircle2 size={10} />
                  Rated {csatRatings[ticket.id]}/5
                </div>
              )}

              <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                {ticket.comment_count > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare size={10} />
                    {ticket.comment_count}
                  </span>
                )}
                {ticket.assignee_details && (
                  <span>
                    Assigned to: {ticket.assignee_details.first_name}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <Ticket size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-sm text-white/40">No tickets found</p>
            <p className="text-xs text-white/20 mt-1">Submit a ticket above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;
