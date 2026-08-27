import React, { useState, useEffect } from "react";
import { reportsAPI } from "../services/hrAPI";

// ============================================================================
// Reusable Components
// ============================================================================
const StatCard = ({ label, value, color = "text-gray-900", subtitle, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value ?? "-"}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    {trend !== undefined && (
      <p className={`text-xs mt-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
        {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
      </p>
    )}
  </div>
);

const ProgressBar = ({ value, max, label, color = "bg-blue-600", showValue = true }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-32 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {showValue && <span className="text-sm font-semibold text-gray-900 w-10 text-right">{value}</span>}
    </div>
  );
};

const Badge = ({ status, colors }) => {
  const c = colors?.[status] || { bg: "bg-gray-100", text: "text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
};

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);

// ============================================================================
// Tab Config
// ============================================================================
const TABS = [
  { id: "ceo", label: "CEO Dashboard", icon: "📊" },
  { id: "attrition", label: "Attrition", icon: "📉" },
  { id: "headcount", label: "Headcount", icon: "👥" },
  { id: "recruitment", label: "Recruitment", icon: "🎯" },
  { id: "attendance", label: "Attendance", icon: "⏰" },
  { id: "payroll", label: "Payroll", icon: "💰" },
  { id: "compliance", label: "Compliance", icon: "✅" },
];

// ============================================================================
// Main Dashboard Component
// ============================================================================
export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("ceo");
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Data states
  const [ceoData, setCeoData] = useState(null);
  const [attrition, setAttrition] = useState(null);
  const [headcount, setHeadcount] = useState(null);
  const [recruitment, setRecruitment] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [compliance, setCompliance] = useState(null);

  useEffect(() => { loadAll(); }, [year, month]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ceoRes, atrRes, hcRes, recRes, atdRes, payRes, cmpRes] = await Promise.all([
        reportsAPI.getCEODashboard(year).catch(() => ({ data: null })),
        reportsAPI.getAttritionReport(year).catch(() => ({ data: null })),
        reportsAPI.getHeadcountReport().catch(() => ({ data: null })),
        reportsAPI.getRecruitmentAnalytics(year).catch(() => ({ data: null })),
        reportsAPI.getAttendanceReport(month, year).catch(() => ({ data: null })),
        reportsAPI.getPayrollReport(month, year).catch(() => ({ data: null })),
        reportsAPI.getComplianceReport(year).catch(() => ({ data: null })),
      ]);
      setCeoData(ceoRes.data);
      setAttrition(atrRes.data);
      setHeadcount(hcRes.data);
      setRecruitment(recRes.data);
      setAttendance(atdRes.data);
      setPayroll(payRes.data);
      setCompliance(cmpRes.data);
    } catch (err) { console.error("Reports error:", err); }
    finally { setLoading(false); }
  };

  const exportCSV = async (type) => {
    try {
      const res = await reportsAPI.exportReport(type, { year, month });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${year}${type === "payroll" || type === "attendance" ? `_${month}` : ""}.csv`;
      a.click();
    } catch (err) { console.error("Export failed:", err); }
  };

  // ============================================================================
  // CEO Dashboard Tab
  // ============================================================================
  const CEOTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={ceoData?.total_employees?.toLocaleString()} color="text-gray-900" subtitle="All active employees" />
        <StatCard label="Active" value={ceoData?.active_employees} color="text-green-700" subtitle="Working employees" />
        <StatCard label="New Hires (YTD)" value={ceoData?.new_hires_ytd} color="text-blue-700" subtitle={`${ceoData?.new_hires_month || 0} this month`} />
        <StatCard label="Attrition Rate" value={ceoData?.attrition_rate ? `${ceoData.attrition_rate.toFixed(1)}%` : "-"}
          color={(ceoData?.attrition_rate || 0) > 15 ? "text-red-700" : (ceoData?.attrition_rate || 0) > 10 ? "text-orange-700" : "text-green-700"}
          subtitle={`${ceoData?.separated_ytd || 0} separated YTD`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Monthly Payroll Cost" value={`₹${(ceoData?.monthly_payroll_cost || 0).toLocaleString()}`} color="text-purple-700" />
        <StatCard label="Avg Cost/Employee" value={`₹${(ceoData?.avg_cost_per_employee || 0).toLocaleString()}`} color="text-indigo-700" />
        <StatCard label="Open Positions" value={ceoData?.open_positions} color="text-amber-700" subtitle="In pipeline" />
        <StatCard label="Overdue Compliance" value={ceoData?.overdue_compliance}
          color={(ceoData?.overdue_compliance || 0) > 0 ? "text-red-700" : "text-green-700"}
          subtitle={`${ceoData?.upcoming_compliance || 0} upcoming`} />
      </div>

      {/* Department Headcount */}
      {ceoData?.department_headcount?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Headcount by Department" subtitle="Employee distribution across departments" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ceoData.department_headcount.map((d) => (
              <ProgressBar key={d.department__name || "Unassigned"}
                label={d.department__name || "Unassigned"}
                value={d.count}
                max={Math.max(...ceoData.department_headcount.map(x => x.count))}
                color="bg-blue-500" />
            ))}
          </div>
        </div>
      )}

      {/* Gender & Employment Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ceoData?.gender_distribution?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <SectionTitle title="Gender Diversity" />
            <div className="space-y-2">
              {ceoData.gender_distribution.map((g) => (
                <div key={g.gender} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{g.gender?.toLowerCase() || "Other"}</span>
                  <span className="font-semibold">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {ceoData?.grade_distribution?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <SectionTitle title="Grade Distribution" />
            <div className="space-y-2">
              {ceoData.grade_distribution.map((g) => (
                <div key={g.grade || "N/A"} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{g.grade || "N/A"}</span>
                  <span className="font-semibold">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {ceoData?.employment_type_distribution?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <SectionTitle title="Employment Type" />
            <div className="space-y-2">
              {ceoData.employment_type_distribution.map((e) => (
                <div key={e.employment_type} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{e.employment_type?.replace(/_/g, " ").toLowerCase()}</span>
                  <span className="font-semibold">{e.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // Attrition Tab
  // ============================================================================
  const AttritionTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Separations" value={attrition?.total_separations} color="text-red-700" subtitle={attrition?.year && `FY ${attrition.year}`} />
        <StatCard label="Voluntary" value={attrition?.voluntary} color="text-orange-700" subtitle="Resigned" />
        <StatCard label="Involuntary" value={attrition?.involuntary} color="text-red-700" subtitle="Terminated/Absconded" />
        <StatCard label="Attrition Rate" value={attrition?.rate ? `${attrition.rate}%` : "-"}
          color={(attrition?.rate || 0) > 15 ? "text-red-700" : "text-green-700"} />
      </div>

      {attrition?.by_department?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Attrition by Department" />
          <div className="space-y-2">
            {attrition.by_department.map((d) => (
              <ProgressBar key={d.department__name || "N/A"}
                label={d.department__name || "N/A"} value={d.count}
                max={Math.max(...attrition.by_department.map(x => x.count))}
                color="bg-red-500" />
            ))}
          </div>
        </div>
      )}

      {attrition?.by_tenure && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Attrition by Tenure" subtitle="Years of service at time of exit" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
            {Object.entries(attrition.by_tenure).map(([tenure, count]) => (
              <div key={tenure} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{tenure}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => exportCSV("attrition")} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">
          ⬇ Export Attrition
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // Headcount Tab
  // ============================================================================
  const HeadcountTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Headcount" value={headcount?.total} color="text-blue-700" />
        <StatCard label="Departments" value={headcount?.by_department?.length} color="text-indigo-700" />
        <StatCard label="Locations" value={headcount?.by_location?.length} color="text-purple-700" subtitle="Work locations" />
      </div>

      {headcount?.by_department?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="By Department" />
          <div className="space-y-2">
            {headcount.by_department.map((d) => (
              <ProgressBar key={d.department__name || "N/A"} label={d.department__name || "N/A"} value={d.count}
                max={Math.max(...headcount.by_department.map(x => x.count))} color="bg-blue-600" />
            ))}
          </div>
        </div>
      )}

      {headcount?.by_location?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="By Location" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {headcount.by_location.map((l) => (
              <ProgressBar key={l.work_location__name || l.work_location__city || "N/A"}
                label={`${l.work_location__name || l.work_location__city || "N/A"}`} value={l.count}
                max={Math.max(...headcount.by_location.map(x => x.count))} color="bg-teal-500" />
            ))}
          </div>
        </div>
      )}

      {headcount?.by_grade?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="By Grade" />
          <div className="flex flex-wrap gap-2">
            {headcount.by_grade.map((g) => (
              <div key={g.grade || "N/A"} className="px-4 py-2 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">{g.count}</p>
                <p className="text-xs text-gray-500">{g.grade || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => exportCSV("headcount")} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
        ⬇ Export Headcount
      </button>
    </div>
  );

  // ============================================================================
  // Recruitment Analytics Tab
  // ============================================================================
  const RecruitmentTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={recruitment?.total_applications} color="text-blue-700" />
        <StatCard label="Total Offers" value={recruitment?.total_offers} color="text-green-700" />
        <StatCard label="Offer Acceptance" value={recruitment?.offer_acceptance_rate ? `${recruitment.offer_acceptance_rate}%` : "-"} color="text-emerald-700" />
        <StatCard label="Avg Days to Fill" value={recruitment?.avg_days_to_fill ? `${recruitment.avg_days_to_fill}d` : "-"} color="text-orange-700" />
      </div>

      {/* Pipeline */}
      {recruitment?.pipeline?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Candidate Pipeline" subtitle="Applications by stage" />
          <div className="flex flex-wrap gap-2 mb-4">
            {recruitment.pipeline.map((p) => (
              <div key={p.stage} className="flex-1 min-w-[120px] p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-lg font-bold text-gray-900">{p.count}</p>
                <p className="text-xs text-gray-500 mt-1">{p.stage?.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source of hire */}
      {recruitment?.candidates_by_source?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Candidates by Source" subtitle="Where candidates are coming from" />
          <div className="space-y-2">
            {recruitment.candidates_by_source.map((s) => (
              <ProgressBar key={s.source || "Unknown"} label={s.source || "Unknown"} value={s.count}
                max={Math.max(...recruitment.candidates_by_source.map(x => x.count))} color="bg-purple-500" />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => exportCSV("recruitment")} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">
          ⬇ Export Recruitment
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // Attendance Report Tab
  // ============================================================================
  const AttendanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Attendance Rate" value={attendance?.attendance_rate ? `${attendance.attendance_rate}%` : "-"}
          color={(attendance?.attendance_rate || 0) > 90 ? "text-green-700" : "text-red-700"} />
        <StatCard label="Present" value={attendance?.present} color="text-green-700" />
        <StatCard label="Absent" value={attendance?.absent} color="text-red-700" subtitle={`${attendance?.absenteeism_rate || 0}% absenteeism`} />
        <StatCard label="Late Marks" value={attendance?.late_marks} color="text-orange-700" subtitle={`${month}/${year}`} />
      </div>

      {attendance?.department_attendance?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Attendance by Department" subtitle="Present vs Absent" />
          <div className="space-y-3">
            {attendance.department_attendance.map((d) => (
              <div key={d.employee__department__name || "N/A"}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{d.employee__department__name || "N/A"}</span>
                  <span className="text-gray-500">{d.present_count}/{d.total}</span>
                </div>
                <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${(d.present_count / d.total) * 100}%` }} />
                  <div className="bg-red-300 h-full" style={{ width: `${(d.absent_count / d.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => exportCSV("attendance")} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100">
        ⬇ Export Attendance
      </button>
    </div>
  );

  // ============================================================================
  // Payroll Report Tab
  // ============================================================================
  const PayrollTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Gross" value={`₹${(payroll?.total_gross || 0).toLocaleString()}`} color="text-gray-900" />
        <StatCard label="Total Net" value={`₹${(payroll?.total_net || 0).toLocaleString()}`} color="text-green-700" />
        <StatCard label="Total Deductions" value={`₹${(payroll?.total_deductions || 0).toLocaleString()}`} color="text-red-700" subtitle={`${payroll?.deduction_pct || 0}% of gross`} />
        <StatCard label="Employees" value={payroll?.employee_count} color="text-blue-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Avg Gross/Employee" value={`₹${(payroll?.avg_gross_per_employee || 0).toLocaleString()}`} color="text-indigo-700" />
        <StatCard label="Avg Net/Employee" value={`₹${(payroll?.avg_net_per_employee || 0).toLocaleString()}`} color="text-emerald-700" />
        <StatCard label="Arrears This Month" value={`₹${(payroll?.total_arrears || 0).toLocaleString()}`} color="text-orange-700" />
      </div>

      {/* Department Cost Breakdown */}
      {payroll?.department_cost?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Payroll Cost by Department" subtitle={`${month}/${year}`} />
          <div className="space-y-2">
            {payroll.department_cost.map((d) => (
              <ProgressBar key={d.employee__department__name || "N/A"}
                label={d.employee__department__name || "N/A"}
                value={`₹${(d.gross / 100000).toFixed(1)}L`} max={Math.max(...payroll.department_cost.map(x => x.gross)) / 100000}
                color="bg-purple-500"
                showValue={true} />
            ))}
          </div>
        </div>
      )}

      {/* Salary Revisions & Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Salary Revisions YTD" subtitle={`${payroll?.total_salary_revisions || 0} revisions`} />
          <p className="text-2xl font-bold text-gray-900">{payroll?.avg_increment_pct ? `${payroll.avg_increment_pct}%` : "-"}</p>
          <p className="text-xs text-gray-500">Average increment</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Outstanding Loans" subtitle={`${payroll?.outstanding_loan_count || 0} active loans`} />
          <p className="text-2xl font-bold text-orange-700">₹{(payroll?.outstanding_loans || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">₹{(payroll?.pending_reimbursements || 0).toLocaleString()} in pending reimbursements</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => exportCSV("payroll")} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">
          ⬇ Export Payroll
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // Compliance Tab
  // ============================================================================
  const ComplianceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Entries" value={compliance?.total_entries} color="text-gray-900" subtitle={compliance?.year && `FY ${compliance.year}`} />
        <StatCard label="Completed" value={compliance?.completed} color="text-green-700" />
        <StatCard label="Pending" value={compliance?.pending} color="text-yellow-700" />
        <StatCard label="Overdue" value={compliance?.overdue}
          color={(compliance?.overdue || 0) > 0 ? "text-red-700" : "text-green-700"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Compliance Rate" value={compliance?.compliance_rate ? `${compliance.compliance_rate}%` : "-"}
          color={(compliance?.compliance_rate || 0) > 90 ? "text-green-700" : "text-red-700"} />
        <StatCard label="Penalty Risk Items" value={compliance?.penalty_risk_items}
          color={(compliance?.penalty_risk_items || 0) > 0 ? "text-red-700" : "text-green-700"}
          subtitle="Overdue by 7+ days" />
        <StatCard label="Upcoming (30 days)" value={compliance?.upcoming_30_days?.length || 0} color="text-blue-700" />
      </div>

      {/* Upcoming Compliance Items */}
      {compliance?.upcoming_30_days?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="Due in Next 30 Days" subtitle="Action required" />
          <div className="divide-y divide-gray-100">
            {compliance.upcoming_30_days.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.compliance_type} | Ref: {item.reference_number || "N/A"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  new Date(item.due_date) < new Date() ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {new Date(item.due_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Compliance Type */}
      {compliance?.by_compliance_type?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <SectionTitle title="By Compliance Type" subtitle="Filed vs Pending" />
          <div className="space-y-3">
            {compliance.by_compliance_type.map((c) => (
              <div key={c.compliance_type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{c.compliance_type}</span>
                  <span className="text-gray-500">{c.completed}/{c.total} completed</span>
                </div>
                <div className="flex h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${(c.completed / c.total) * 100}%` }} />
                  <div className="bg-yellow-400 h-full" style={{ width: `${(c.pending / c.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-gray-500">Loading reports...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "ceo": return <CEOTab />;
      case "attrition": return <AttritionTab />;
      case "headcount": return <HeadcountTab />;
      case "recruitment": return <RecruitmentTab />;
      case "attendance": return <AttendanceTab />;
      case "payroll": return <PayrollTab />;
      case "compliance": return <ComplianceTab />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">CEO dashboard, attrition, headcount, recruitment, attendance, payroll, and compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {["attendance", "payroll"].includes(activeTab) && (
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2020, m - 1).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
}
