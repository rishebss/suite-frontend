import React, { useState, useEffect } from "react";
import { helpdeskAPI } from "../services/hrAPI";

const TICKET_TYPES = {
  PAYROLL_QUERY: "💳 Payroll Query",
  CERTIFICATE_REQUEST: "📜 Certificate Request",
  IT_ACCESS: "🔑 IT Access Request",
  POLICY_CLARIFICATION: "📋 Policy Clarification",
  BENEFITS: "🎁 Benefits Query",
  LEAVE_ISSUE: "🏖️ Leave Issue",
  ATTENDANCE_ISSUE: "⏰ Attendance Issue",
  OTHER: "📝 Other",
};

export default function HelpdeskAdmin() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("OPEN");

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await helpdeskAPI.getTickets({ status: filter });
      setTickets(res.data.results || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resolveTicket = async (id) => {
    try {
      await helpdeskAPI.resolveTicket(id, "Issue resolved");
      loadTickets();
    } catch (err) { console.error(err); }
  };

  const stats = {
    OPEN: tickets.filter(t => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter(t => t.status === "IN_PROGRESS").length,
    RESOLVED: tickets.filter(t => t.status === "RESOLVED").length,
    CLOSED: tickets.filter(t => t.status === "CLOSED").length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Helpdesk Management</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([key, count]) => (
          <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{count}</p>
            <p className="text-xs text-gray-500">{key.replace(/_/g, " ")}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", ""].map((s) => (
          <button key={s} onClick={() => { setFilter(s); }} 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tickets found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{Object.entries(TICKET_TYPES).find(([k]) => k === t.ticket_type)?.[1]?.split(" ")[0] || "📝"}</span>
                      <span className="font-medium text-gray-900">{t.subject}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">{TICKET_TYPES[t.ticket_type] || t.ticket_type} | {t.employee_name || t.employee?.employee_id || "Employee"}</p>
                    <p className="text-xs text-gray-400 ml-8 mt-1 line-clamp-2">{t.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.priority === "URGENT" ? "bg-red-100 text-red-700" :
                        t.priority === "HIGH" ? "bg-orange-100 text-orange-700" :
                        t.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{t.priority}</span>
                      <button onClick={() => resolveTicket(t.id)} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors">
                        Resolve
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
