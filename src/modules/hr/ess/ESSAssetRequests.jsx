import React, { useState, useEffect } from "react";
import { helpdeskAPI } from "../services/hrAPI";

const ASSET_TYPES = [
  { value: "LAPTOP", label: "💻 Laptop" },
  { value: "MOBILE", label: "📱 Mobile Phone" },
  { value: "SIM_CARD", label: "📶 SIM Card" },
  { value: "MONITOR", label: "🖥️ Monitor" },
  { value: "KEYBOARD", label: "⌨️ Keyboard/Mouse" },
  { value: "ACCESS_CARD", label: "🪪 Access Card" },
  { value: "OTHER", label: "Other" },
];

export default function ESSAssetRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ asset_type: "LAPTOP", reason: "", urgency: "MEDIUM" });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await helpdeskAPI.getMyAssetRequests();
      setRequests(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load asset requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await helpdeskAPI.createAssetRequest(form);
      setShowForm(false);
      setForm({ asset_type: "LAPTOP", reason: "", urgency: "MEDIUM" });
      loadRequests();
    } catch (err) {
      console.error("Failed to create request:", err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      ALLOCATED: "bg-blue-100 text-blue-700",
      RETURNED: "bg-gray-100 text-gray-500",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Request IT equipment and track allocations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ New Request"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Asset Request</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                <select
                  value={form.asset_type}
                  onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {ASSET_TYPES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No asset requests yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ASSET_TYPES.find(a => a.value === req.asset_type)?.label.split(" ")[0] || "📦"}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{ASSET_TYPES.find(a => a.value === req.asset_type)?.label || req.asset_type}</h3>
                      <p className="text-sm text-gray-500">{req.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                    {req.asset_serial && (
                      <p className="text-xs text-gray-500 mt-1">S/N: {req.asset_serial}</p>
                    )}
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
