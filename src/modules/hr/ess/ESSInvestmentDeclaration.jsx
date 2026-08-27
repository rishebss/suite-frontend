import React, { useState, useEffect } from "react";
import { helpdeskAPI, complianceAPI } from "../services/hrAPI";

export default function ESSInvestmentDeclaration() {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    financial_year: "2026-2027",
    tax_regime: "NEW",
    section_80c_total: 0,
    section_80d_self_family: 0,
    section_80d_parents: 0,
    section_80g_total: 0,
    hra_rent_paid: 0,
    lta_claimed: 0,
    home_loan_interest: 0,
    nps_employee: 0,
    other_deductions: 0,
  });

  const currentFY = new Date().getMonth() >= 3 
    ? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` 
    : `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`;

  useEffect(() => {
    loadDeclarations();
    setForm(f => ({ ...f, financial_year: currentFY }));
  }, []);

  const loadDeclarations = async () => {
    try {
      setLoading(true);
      const res = await helpdeskAPI.getMyInvestments();
      setDeclarations(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load declarations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await helpdeskAPI.submitInvestmentDeclaration(form);
      setShowForm(false);
      loadDeclarations();
    } catch (err) {
      console.error("Failed to submit:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Declaration</h1>
          <p className="text-sm text-gray-500 mt-1">Declare your tax-saving investments (Form 12BB)</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          {showForm ? "Cancel" : "+ New Declaration"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Declaration Form</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
                <select value={form.financial_year} onChange={(e) => setForm({...form, financial_year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {[1,0,-1].map(offset => {
                    const y = new Date().getFullYear() + offset;
                    return <option key={y} value={`${y}-${y+1}`}>{`${y}-${y+1}`}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Regime</label>
                <select value={form.tax_regime} onChange={(e) => setForm({...form, tax_regime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="NEW">New Regime</option>
                  <option value="OLD">Old Regime</option>
                </select>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Section 80C Investments (₹)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">80C Total (PPF, ELSS, LIC, etc.)</label>
                  <input type="number" value={form.section_80c_total} onChange={(e) => setForm({...form, section_80c_total: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">NPS (Section 80CCD(1B))</label>
                  <input type="number" value={form.nps_employee} onChange={(e) => setForm({...form, nps_employee: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Other Deductions (₹)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">MediClaim (Self & Family)</label>
                  <input type="number" value={form.section_80d_self_family} onChange={(e) => setForm({...form, section_80d_self_family: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">MediClaim (Parents)</label>
                  <input type="number" value={form.section_80d_parents} onChange={(e) => setForm({...form, section_80d_parents: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">HRA Rent Paid (Annual)</label>
                  <input type="number" value={form.hra_rent_paid} onChange={(e) => setForm({...form, hra_rent_paid: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Home Loan Interest</label>
                  <input type="number" value={form.home_loan_interest} onChange={(e) => setForm({...form, home_loan_interest: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Submit Declaration
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : declarations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No declarations submitted yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {declarations.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">FY {d.financial_year} - {d.tax_regime} Regime</p>
                  <p className="text-sm text-gray-500">80C: ₹{d.section_80c_total?.toLocaleString()} | Submitted: {new Date(d.submitted_date || d.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {d.is_approved ? "Approved" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
