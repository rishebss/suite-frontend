import React, { useState, useEffect } from "react";
import { employeeAPI, performanceAPI } from "../services/hrAPI";

export default function MSSTeamPerformance() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await employeeAPI.getEmployees({ is_active: true });
      setTeamMembers(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (employee) => {
    setSelectedEmployee(employee);
    try {
      const [goalsRes, reviewsRes] = await Promise.all([
        performanceAPI.getGoals({ employee: employee.id }).catch(() => ({ data: [] })),
        performanceAPI.getReviews({ employee: employee.id }).catch(() => ({ data: [] })),
      ]);
      setGoals(goalsRes.data.results || goalsRes.data || []);
      setReviews(reviewsRes.data.results || reviewsRes.data || []);
    } catch (err) {
      console.error("Failed to load details:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Performance</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Team Members</h2>
            </div>
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {teamMembers.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => loadEmployeeDetails(emp)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEmployee?.id === emp.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <p className="font-medium text-gray-900 text-sm">{emp.first_name} {emp.last_name}</p>
                    <p className="text-xs text-gray-500">{emp.employee_id} | {emp.designation?.name || emp.designation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedEmployee ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              Select a team member to view their performance details
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-3">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{goals.length}</p>
                    <p className="text-xs text-blue-600">Goals</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">{reviews.length}</p>
                    <p className="text-xs text-green-600">Reviews</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-700">{goals.filter(g => g.status === "Completed").length}</p>
                    <p className="text-xs text-purple-600">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Performance Goals</h3>
                {goals.length === 0 ? (
                  <p className="text-sm text-gray-500">No goals set</p>
                ) : (
                  <div className="space-y-3">
                    {goals.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{g.description}</p>
                          <p className="text-xs text-gray-500">Weightage: {g.weightage}%</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          g.status === "Completed" ? "bg-green-100 text-green-700" :
                          g.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>{g.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Performance Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-500">No reviews yet</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">{r.cycle?.name || "Appraisal"}</p>
                          <p className="text-sm text-gray-700">Self: {r.self_rating} | Manager: {r.manager_rating}</p>
                        </div>
                        {r.manager_comments && (
                          <p className="text-xs text-gray-500 mt-1">{r.manager_comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
