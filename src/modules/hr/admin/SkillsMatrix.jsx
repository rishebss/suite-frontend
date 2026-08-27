import React, { useState, useEffect } from "react";
import { trainingAPI, employeeAPI } from "../services/hrAPI";

const CATEGORIES = [
  "TECHNICAL", "SOFT_SKILL", "MANAGEMENT", "DOMAIN", "LANGUAGE", "CERTIFICATION"
];

export default function SkillsMatrix() {
  const [skills, setSkills] = useState([]);
  const [empSkills, setEmpSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillForm, setSkillForm] = useState({ name: "", category: "TECHNICAL", description: "" });
  const [activeTab, setActiveTab] = useState("skills");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [skRes, esRes] = await Promise.all([
        trainingAPI.getSkills().catch(() => ({ data: [] })),
        trainingAPI.getEmployeeSkills().catch(() => ({ data: [] })),
      ]);
      setSkills(skRes.data.results || skRes.data || []);
      setEmpSkills(esRes.data.results || esRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createSkill = async (e) => {
    e.preventDefault();
    try {
      await trainingAPI.createSkill(skillForm);
      setShowSkillForm(false);
      setSkillForm({ name: "", category: "TECHNICAL", description: "" });
      loadAll();
    } catch (err) { console.error(err); }
  };

  const groupedSkills = {};
  CATEGORIES.forEach(c => {
    groupedSkills[c] = skills.filter(s => s.category === c);
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">Manage skills and employee proficiency levels</p>
        </div>
        <button onClick={() => setShowSkillForm(!showSkillForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          {showSkillForm ? "Cancel" : "+ New Skill"}
        </button>
      </div>

      {showSkillForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Skill</h2>
          <form onSubmit={createSkill} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <input type="text" value={skillForm.name} onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={skillForm.category} onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={skillForm.description} onChange={(e) => setSkillForm({...skillForm, description: e.target.value})}
                rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Skill</button>
          </form>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "skills" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}>
          Skills Master ({skills.length})
        </button>
        <button onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "matrix" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}>
          Employee Skills ({empSkills.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : activeTab === "skills" ? (
        <div className="space-y-6">
          {CATEGORIES.map(cat => (
            <div key={cat} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="font-semibold text-gray-900">{cat.replace(/_/g, " ")} ({groupedSkills[cat]?.length || 0})</h3>
              </div>
              {(groupedSkills[cat]?.length || 0) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                  {groupedSkills[cat].map(s => (
                    <div key={s.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                      {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">No skills in this category</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {empSkills.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No employee skills recorded</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {empSkills.map(es => (
                <div key={es.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{es.employee_name || es.employee?.first_name} - {es.skill_name || es.skill?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={`text-sm ${star <= (es.proficiency || 0) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Level {es.proficiency}/5</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${es.is_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {es.is_verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
