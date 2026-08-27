import React, { useState, useEffect } from "react";
import { helpdeskAPI } from "../services/hrAPI";

const ASSET_TYPES = {
  LAPTOP: "💻 Laptop",
  MOBILE: "📱 Mobile",
  SIM_CARD: "📶 SIM Card",
  MONITOR: "🖥️ Monitor",
  KEYBOARD: "⌨️ Keyboard/Mouse",
  ACCESS_CARD: "🪪 Access Card",
  OTHER: "📦 Other",
};

export default function AssetManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const filters = filter ? { status: filter } : {};
      const res = await helpdeskAPI.getAssetRequests(filters);
      setRequests(res.data.results || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const approveRequest = async (id) => {
    try { await helpdeskAPI.approveAssetRequest(id); loadRequests(); }
    catch (err) { console.error(err); }
  };

  const allocateAsset = async (id) => {
    const serial = prompt("Enter asset serial number:");
    if (serial) {
      try { await helpdeskAPI.allocateAsset(id, serial); loadRequests(); }
      catch (err) { console.error(err); }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Asset Management</h1>

      <div className="flex gap-2 mb-4">
        {["PENDING", "APPROVED", "ALLOCATED", "RETURNED", ""].map((s) => (
          <button key={s} onClick={() => { setFilter(s); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No asset requests</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((r) => (
              <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{Object.entries(ASSET_TYPES).find(([k]) => k === r.asset_type)?.[1]?.split(" ")[0] || "📦"}</span>
                      <span className="font-medium text-gray-900">{ASSET_TYPES[r.asset_type] || r.asset_type}</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-8">{r.employee_name || r.employee?.first_name} {r.employee?.last_name}</p>
                    <p className="text-xs text-gray-400 ml-8 mt-1">{r.reason}</p>
                    {r.asset_serial && <p className="text-xs text-gray-500 ml-8 mt-1">S/N: {r.asset_serial}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        r.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        r.status === "ALLOCATED" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>{r.status}</span>
                      <div className="flex gap-1">
                        {r.status === "PENDING" && (
                          <button onClick={() => approveRequest(r.id)}
                            className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                            Approve
                          </button>
                        )}
                        {r.status === "APPROVED" && (
                          <button onClick={() => allocateAsset(r.id)}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                            Allocate
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{r.urgency} Priority | {new Date(r.created_at).toLocaleDateString()}</p>
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
