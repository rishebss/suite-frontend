import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HRProvider } from "./context/HRContext";

// Main Dashboard
import MainHRDashboard from "./pages/MainHRDashboard";

// ESS Pages
import ESSDashboard from "./ess/ESSDashboard";
import ESSLeaveManagement from "./ess/ESSLeaveManagement";
import ESSAttendance from "./ess/ESSAttendance";
import ESSPayroll from "./ess/ESSPayroll";
import ESSProfile from "./ess/ESSProfile";
import ESSTickets from "./ess/ESSTickets";
import ESSAssetRequests from "./ess/ESSAssetRequests";
import ESSInvestmentDeclaration from "./ess/ESSInvestmentDeclaration";
import ESSTraining from "./ess/ESSTraining";
import ESSOvertime from "./ess/ESSOvertime";
import ESSShiftSwap from "./ess/ESSShiftSwap";
import ESSAttendanceRegularization from "./ess/ESSAttendanceRegularization";
import ESSCompOff from "./ess/ESSCompOff";

// MSS Pages
import MSSDashboard from "./mss/MSSDashboard";
import MSSTeamPerformance from "./mss/MSSTeamPerformance";
import MSSApprovals from "./mss/MSSApprovals";

// Admin Pages
import EmployeeDirectory from './admin/EmployeeDirectory';
import EmployeeDetail from './admin/EmployeeDetail';
import EmployeeOnboarding from './admin/EmployeeOnboarding';
import RecruitmentDashboard from './admin/RecruitmentDashboard';
import RecruitmentEnhanced from './admin/RecruitmentEnhanced';
import PerformanceDashboard from './admin/PerformanceDashboard';
import PerformanceEnhanced from './admin/PerformanceEnhanced';
import ExitManagementDashboard from './admin/ExitManagementDashboard';
import ExitManagementEnhanced from './admin/ExitManagementEnhanced';
import TrainingDashboard from './admin/TrainingDashboard';
import ComplianceDashboard from './admin/ComplianceDashboard';
import ComplianceForms from './admin/ComplianceForms';
import SkillsMatrix from './admin/SkillsMatrix';
import HelpdeskAdmin from './admin/HelpdeskAdmin';
import AssetManagement from './admin/AssetManagement';
import ReportsDashboard from './admin/ReportsDashboard';
import PayrollAdminDashboard from './admin/PayrollAdminDashboard';
import SalaryRevisionManagement from './admin/SalaryRevisionManagement';
import LoanManagement from './admin/LoanManagement';
import ReimbursementManagement from './admin/ReimbursementManagement';
import AttendanceAdmin from './admin/AttendanceAdmin';
import LeaveAdminDashboard from './admin/LeaveAdminDashboard';
import HRSettings from './admin/HRSettings';

export const HRRoutes = () => {
  return (
    <HRProvider>
      <Routes>
        {/* Main Dashboard Landing */}
        <Route path="/" element={<MainHRDashboard />} />

        {/* ESS Portal Routes */}
        <Route path="/ess" element={<ESSDashboard />} />
        <Route path="/ess/leave" element={<ESSLeaveManagement />} />
        <Route path="/ess/attendance" element={<ESSAttendance />} />
        <Route path="/ess/payroll" element={<ESSPayroll />} />
        <Route path="/ess/profile" element={<ESSProfile />} />
        <Route path="/ess/tickets" element={<ESSTickets />} />
        <Route path="/ess/assets" element={<ESSAssetRequests />} />
        <Route path="/ess/investments" element={<ESSInvestmentDeclaration />} />
        <Route path="/ess/training" element={<ESSTraining />} />
        <Route path="/ess/overtime" element={<ESSOvertime />} />
        <Route path="/ess/shift-swap" element={<ESSShiftSwap />} />
        <Route path="/ess/regularization" element={<ESSAttendanceRegularization />} />
        <Route path="/ess/comp-off" element={<ESSCompOff />} />

        {/* MSS Portal Routes */}
        <Route path="/mss" element={<MSSDashboard />} />
        <Route path="/mss/team" element={<MSSTeamPerformance />} />
        <Route path="/mss/approvals" element={<MSSApprovals />} />

        {/* Admin Routes */}
        <Route path="/admin/employees" element={<EmployeeDirectory />} />
        <Route path="/admin/employees/new" element={<EmployeeOnboarding />} />
        <Route path="/admin/employees/:id" element={<EmployeeDetail />} />
        <Route path="/admin/employees/:id/edit" element={<EmployeeOnboarding />} />
        
        {/* Recruitment */}
        <Route path="/admin/recruitment" element={<RecruitmentDashboard />} />
        <Route path="/admin/recruitment/enhanced" element={<RecruitmentEnhanced />} />
        
        {/* Performance */}
        <Route path="/admin/performance" element={<PerformanceDashboard />} />
        <Route path="/admin/performance/enhanced" element={<PerformanceEnhanced />} />
        
        {/* Exit Management */}
        <Route path="/admin/exits" element={<ExitManagementDashboard />} />
        <Route path="/admin/exits/enhanced" element={<ExitManagementEnhanced />} />
        
        {/* Training & Skills */}
        <Route path="/admin/training" element={<TrainingDashboard />} />
        <Route path="/admin/training/skills" element={<SkillsMatrix />} />
        
        {/* Compliance */}
        <Route path="/admin/compliance" element={<ComplianceDashboard />} />
        
        {/* Helpdesk & Assets */}
        <Route path="/admin/helpdesk" element={<HelpdeskAdmin />} />
        <Route path="/admin/assets" element={<AssetManagement />} />
        
        {/* Compliance Forms */}
        <Route path="/admin/compliance/forms" element={<ComplianceForms />} />

        {/* Reports */}
        <Route path="/admin/reports" element={<ReportsDashboard />} />

        {/* Payroll Management */}
        <Route path="/admin/payroll" element={<PayrollAdminDashboard />} />
        <Route path="/admin/payroll/revisions" element={<SalaryRevisionManagement />} />
        <Route path="/admin/payroll/loans" element={<LoanManagement />} />
        <Route path="/admin/payroll/reimbursements" element={<ReimbursementManagement />} />
        
        {/* Admin Attendance, Leaves, Settings */}
        <Route path="/admin/attendance" element={<AttendanceAdmin />} />
        <Route path="/admin/leaves" element={<LeaveAdminDashboard />} />
        <Route path="/admin/settings" element={<HRSettings />} />
        
        <Route path="/admin/compliance/calendar" element={<Navigate to="/hr/admin/compliance" replace />} />
        <Route path="/admin" element={<Navigate to="/hr" replace />} />
      </Routes>
    </HRProvider>
  );
};

export default HRRoutes;
