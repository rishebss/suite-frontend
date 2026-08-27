import React, { useState, useEffect } from "react";
import { helpdeskAPI } from "../services/hrAPI";

const TICKET_TYPES = [
  { value: "PAYROLL_QUERY", label: "Payroll Query" },
  { value: "CERTIFICATE_REQUEST", label: "Certificate Request" },
  { value: "IT_ACCESS", label: "IT Access Request" },
  { value: "POLICY_CLARIFICATION", label: "Policy Clarification" },
  { value: "BENEFITS", label: "Benefits Query" },
  { value: "LEAVE_ISSUE", label: "Leave Issue" },
  { value: "ATTENDANCE_ISSUE", label: "Attendance Issue" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low", color: "bg-gray-100 text-gray-700" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-700" },
];

const STATUS_BADGES = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

export default function ESSTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [form, setForm] = useState({ ticket_type: "OTHER", subject: "", description: "", priority: "MEDIUM" });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await helpdeskAPI.getMyTickets();
      setTickets(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await helpdeskAPI.createTicket(form);
      setShowForm(false);
      setForm({ ticket_type: "OTHER", subject: "", description: "", priority: "MEDIUM" });
      loadTickets();
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  const viewTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await helpdeskAPI.getTicketConversations(ticket.id);
      setConversations(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setConversations([]);
    }
  };

  const getPriorityBadge = (priority) => {
    const p = PRIORITIES.find((x) => x.value === priority);
    return p ? p.color : "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Helpdesk Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Submit and track HR requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Ticket</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.ticket_type}
                  onChange={(e) => setForm({ ...form, ticket_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TICKET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Submit Ticket
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className={selectedTicket ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No tickets yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => viewTicket(ticket)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[ticket.status] || STATUS_BADGES.OPEN}`}>
                            {ticket.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Ticket Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 text-gray-900">{TICKET_TYPES.find(t => t.value === selectedTicket.ticket_type)?.label || selectedTicket.ticket_type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[selectedTicket.status]}`}>{selectedTicket.status}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                {selectedTicket.resolved_date && (
                  <div>
                    <span className="text-gray-500">Resolved:</span>
                    <span className="ml-2 text-gray-900">{new Date(selectedTicket.resolved_date).toLocaleString()}</span>
                  </div>
                )}
                {selectedTicket.resolution_notes && (
                  <div>
                    <span className="text-gray-500">Resolution:</span>
                    <p className="mt-1 text-gray-700 bg-gray-50 rounded p-2">{selectedTicket.resolution_notes}</p>
                  </div>
                )}
                {conversations.length > 0 && (
                  <div>
                    <span className="text-gray-500">Conversations:</span>
                    <div className="mt-2 space-y-2">
                      {conversations.map((c) => (
                        <div key={c.id} className="bg-gray-50 rounded p-2">
                          <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                          <p className="text-sm text-gray-700 mt-1">{c.message}</p>
                          {c.is_internal && <span className="text-xs text-red-500">Internal Note</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
