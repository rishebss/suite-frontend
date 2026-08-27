import React, { useState, useEffect } from "react";
import { performanceAPI } from "../services/hrAPI";

export default function PerformanceEnhanced() {
  const [activeTab, setActiveTab] = useState("okr");
  const [okrs, setOkrs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [pips, setPips] = useState([]);
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [okrRes, fbRes, pipRes, calRes] = await Promise.all([
        performanceAPI.getOKRs().catch(() => ({ data: [] })),
        performanceAPI.getFeedback360().catch(() => ({ data: [] })),
        performanceAPI.getPIPlans().catch(() => ({ data: [] })),
        performanceAPI.getCalibrationSessions().catch(() => ({ data: [] })),
      ]);
      setOkrs(okrRes.data.results || okrRes.data || []);
      setFeedbacks(fbRes.data.results || fbRes.data || []);
      setPips(pipRes.data.results || pipRes.data || []);
      setCalibrations(calRes.data.results || calRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "okr", label: `OKRs (${okrs.length})` },
    { id: "feedback", label: `360° Feedback (${feedbacks.length})` },
    { id: "pip", label: `PIPs (${pips.length})` },
    { id: "calibration", label: `Calibration (${calibrations.length})` },
  ];

  const StatusBadge = ({ status, colors }) => {
    const c = colors?.[status] || { bg: "bg-gray-100", text: "text-gray-700" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{status?.replace(/_/g, " ")}</span>;
  };

  const okrColors = {
    ON_TRACK: { bg: "bg-green-100", text: "text-green-700" },
    AT_RISK: { bg: "bg-yellow-100", text: "text-yellow-700" },
    BEHIND: { bg: "bg-red-100", text: "text-red-700" },
    COMPLETED: { bg: "bg-blue-100", text: "text-blue-700" },
    CANCELLED: { bg: "bg-gray-100", text: "text-gray-500" },
  };

  const pipColors = {
    ACTIVE: { bg: "bg-red-100", text: "text-red-700" },
    IMPROVED: { bg: "bg-green-100", text: "text-green-700" },
    EXTENDED: { bg: "bg-yellow-100", text: "text-yellow-700" },
    TERMINATED: { bg: "bg-gray-100", text: "text-gray-500" },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Management</h1>
      <p className="text-sm text-gray-500 mb-6">OKRs, 360° feedback, performance improvement plans, and calibration</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-green-700">{okrs.filter(o => o.status === "ON_TRACK" || o.status === "COMPLETED").length}</p>
                <p className="text-xs text-gray-500">OKRs On Track</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-blue-700">{feedbacks.filter(f => !f.is_submitted).length}</p>
                <p className="text-xs text-gray-500">Pending Feedback</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-red-700">{pips.filter(p => p.status === "ACTIVE").length}</p>
                <p className="text-xs text-gray-500">Active PIPs</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-2xl font-bold text-purple-700">{calibrations.length}</p>
                <p className="text-xs text-gray-500">Calibrations</p>
              </div>
            </div>
          )}

          {activeTab === "okr" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {okrs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No OKRs found</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {okrs.map((o) => (
                    <div key={o.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{o.objective}</p>
                          <p className="text-sm text-gray-500 mt-1">Key Result: {o.key_result}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(o.progress_pct || 0, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{o.progress_pct || 0}%</span>
                            <span className="text-xs text-gray-400">Weight: {o.weightage}%</span>
                          </div>
                        </div>
                        <StatusBadge status={o.status} colors={okrColors} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {feedbacks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No 360° feedback requests</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {feedbacks.map((f) => (
                    <div key={f.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{f.reviewer_name || f.reviewer?.first_name} → {f.employee_name || f.employee?.first_name}</p>
                          <p className="text-sm text-gray-500">{f.relationship} | {f.is_anonymous ? "Anonymous" : "Open"}</p>
                          {f.overall_rating && <p className="text-xs text-gray-400">Rating: {f.overall_rating}/5</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.is_submitted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {f.is_submitted ? "Submitted" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "pip" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {pips.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No PIPs</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pips.map((p) => (
                    <div key={p.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{p.employee_name || p.employee?.first_name} {p.employee?.last_name}</p>
                          <p className="text-sm text-gray-500">Started: {p.start_date} | Reason: {p.reason?.substring(0, 100)}</p>
                          {p.goals?.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">{p.goals.length} goal(s) defined</p>
                          )}
                        </div>
                        <StatusBadge status={p.status} colors={pipColors} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "calibration" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {calibrations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No calibration sessions</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {calibrations.map((c) => (
                    <div key={c.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-sm text-gray-500">{new Date(c.session_date).toLocaleString()} | {c.department_name || c.department?.name || "All"}</p>
                          {c.notes && <p className="text-xs text-gray-400 mt-1">{c.notes}</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                          c.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
