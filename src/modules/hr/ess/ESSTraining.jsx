import React, { useState, useEffect } from "react";
import { trainingAPI } from "../services/hrAPI";

export default function ESSTraining() {
  const [programs, setPrograms] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("programs");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [progRes, nomRes] = await Promise.all([
        trainingAPI.getPrograms({ is_active: true }),
        trainingAPI.getNominations().catch(() => ({ data: [] })),
      ]);
      setPrograms(progRes.data.results || progRes.data || []);
      setNominations(nomRes.data.results || nomRes.data || []);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Training & Development</h1>
      <p className="text-sm text-gray-500 mb-6">Explore training programs and track your learning progress</p>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("programs")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "programs" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>
          Available Programs
        </button>
        <button onClick={() => setTab("nominations")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "nominations" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>
          My Nominations
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : tab === "programs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              No training programs available
            </div>
          ) : programs.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>{p.training_type}</span>
                <span>{new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {nominations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No nominations yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {nominations.map((n) => (
                <div key={n.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{n.program_name || n.program?.name || "Program"}</p>
                    <p className="text-sm text-gray-500">Status: {n.status}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    n.status === "Completed" ? "bg-green-100 text-green-700" :
                    n.status === "Approved" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{n.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
