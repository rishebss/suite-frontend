import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const HR_API_URL = `${API_BASE_URL}/hr`;

// Create axios instance
const hrClient = axios.create({
  baseURL: HR_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getCSRFToken() {
  const name = "csrftoken";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

// Add token and CSRF to requests
hrClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.method !== "get") {
    const csrf = getCSRFToken();
    if (csrf) config.headers["X-CSRFToken"] = csrf;
  }
  return config;
});

// ============================================================================
// EMPLOYEE ENDPOINTS
// ============================================================================

export const employeeAPI = {
  // Get all employees
  getEmployees: (filters = {}) =>
    hrClient.get("/employees/", { params: filters }),

  // Get employee by ID
  getEmployeeDetail: (id) => hrClient.get(`/employees/${id}/`),

  // Create new employee
  createEmployee: (data) =>
    hrClient.post("/employees/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update employee
  updateEmployee: (id, data) =>
    hrClient.patch(`/employees/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Get employees by department
  getByDepartment: (departmentId) =>
    hrClient.get("/employees/by_department/", {
      params: { department_id: departmentId },
    }),

  // Get employees by location
  getByLocation: (locationId) =>
    hrClient.get("/employees/by_location/", {
      params: { location_id: locationId },
    }),

  // Get active employee count
  getActiveCount: () => hrClient.get("/employees/active_count/"),

  // Confirm probation
  confirmProbation: (id) =>
    hrClient.post(`/employees/${id}/confirm_probation/`),

  // Initiate separation
  initiateSeparation: (id, data) =>
    hrClient.post(`/employees/${id}/initiate_separation/`, data),
};

// ============================================================================
// ATTENDANCE ENDPOINTS
// ============================================================================

export const attendanceAPI = {
  // Get attendance records
  getAttendance: (filters = {}) =>
    hrClient.get("/attendance/", { params: filters }),

  // Get specific attendance record
  getAttendanceDetail: (id) => hrClient.get(`/attendance/${id}/`),

  // Create attendance record (check-in)
  checkIn: (data) => hrClient.post("/attendance/", data),

  // Update attendance record (check-out)
  checkOut: (id, data) => hrClient.patch(`/attendance/${id}/`, data),

  // Get today's attendance
  getTodayAttendance: () => hrClient.get("/attendance/today/"),

  // Get monthly report
  getMonthlyReport: (month, year) =>
    hrClient.get("/attendance/monthly_report/", { params: { month, year } }),

  // Regularize attendance
  regularizeAttendance: (id, data) =>
    hrClient.post(`/attendance/${id}/regularize/`, data),
};

// ============================================================================
// LEAVE ENDPOINTS
// ============================================================================

export const leaveAPI = {
  // Get leave types
  getLeaveTypes: () => hrClient.get("/leave-types/"),

  // Get leave balance
  getLeaveBalance: (filters = {}) =>
    hrClient.get("/leave-balances/", { params: filters }),

  // Get current year leave balance
  getCurrentYearBalance: () => hrClient.get("/leave-balances/current_year/"),

  // Get leave applications
  getLeaveApplications: (filters = {}) =>
    hrClient.get("/leave-applications/", { params: filters }),

  // Get specific leave application
  getLeaveApplicationDetail: (id) => hrClient.get(`/leave-applications/${id}/`),

  // Apply for leave
  applyLeave: (data) => hrClient.post("/leave-applications/", data),

  // Approve leave
  approveLeave: (id, comment = "") =>
    hrClient.post(`/leave-applications/${id}/approve/`, { comment }),

  // Reject leave
  rejectLeave: (id, comment = "") =>
    hrClient.post(`/leave-applications/${id}/reject/`, { comment }),

  // Cancel leave
  cancelLeave: (id, reason = "") =>
    hrClient.post(`/leave-applications/${id}/cancel/`, { reason }),
};

// ============================================================================
// PAYROLL ENDPOINTS
// ============================================================================

export const payrollAPI = {
  // Get employee salary
  getEmployeeSalary: (filters = {}) =>
    hrClient.get("/employee-salary/", { params: filters }),

  // Get payroll records
  getPayroll: (filters = {}) => hrClient.get("/payroll/", { params: filters }),

  // Get payroll detail
  getPayrollDetail: (id) => hrClient.get(`/payroll/${id}/`),

  // Process payroll
  processPayroll: (month, year) =>
    hrClient.post("/payroll/process_payroll/", { month, year }),

  // Approve payroll
  approvePayroll: (id) => hrClient.post(`/payroll/${id}/approve/`),
};

// ============================================================================
// MASTER DATA ENDPOINTS
// ============================================================================

export const masterDataAPI = {
  // Designations
  getDesignations: () => hrClient.get("/designations/"),
  createDesignation: (data) => hrClient.post("/designations/", data),
  updateDesignation: (id, data) => hrClient.patch(`/designations/${id}/`, data),
  deleteDesignation: (id) => hrClient.delete(`/designations/${id}/`),

  // Work Locations
  getWorkLocations: () => hrClient.get("/work-locations/"),

  // Cost Centers
  getCostCenters: () => hrClient.get("/cost-centers/"),

  // Shifts
  getShifts: () => hrClient.get("/shifts/"),

  // Holidays
  getHolidays: (filters = {}) =>
    hrClient.get("/holidays/", { params: filters }),

  // Current year holidays
  getCurrentYearHolidays: () => hrClient.get("/holidays/current_year/"),
};

// ============================================================================
// DOCUMENT ENDPOINTS
// ============================================================================

export const documentAPI = {
  // Get employee documents
  getDocuments: (employeeId) =>
    hrClient.get("/employee-documents/", { params: { employee: employeeId } }),

  // Upload document
  uploadDocument: (data) =>
    hrClient.post("/employee-documents/", data, {
      headers: { "Content-Type": undefined },
    }),

  // Verify document
  verifyDocument: (id) => hrClient.post(`/employee-documents/${id}/verify/`),

  // Download document
  downloadDocument: async (id) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${API_BASE_URL}/hr/employee-documents/${id}/download/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition");
    const match = disposition && disposition.match(/filename="?(.+?)"?$/);
    const filename = match ? match[1] : `document-${id}.${blob.type.split("/")[1] || "bin"}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// ============================================================================
// COMPENSATORY OFF ENDPOINTS
// ============================================================================

export const compOffAPI = {
  // Get comp-offs
  getCompOffs: (filters = {}) =>
    hrClient.get("/comp-offs/", { params: filters }),

  // Create comp-off
  createCompOff: (data) => hrClient.post("/comp-offs/", data),
};

// ============================================================================
// PAYROLL ENHANCED ENDPOINTS
// ============================================================================

export const payrollEnhancedAPI = {
  // Process payroll with engine
  processPayroll: (month, year, testMode = false, department = null, location = null) =>
    hrClient.post("/payroll/process_payroll/", {
      month, year, test_mode: testMode, department, location
    }),
  
  // Process single employee
  processSingle: (employeeId, month, year, testMode = false) =>
    hrClient.post("/payroll/process_single/", {
      employee_id: employeeId, month, year, test_mode: testMode
    }),
  
  // Process all employees
  processAll: (month, year, testMode = false) =>
    hrClient.post("/payroll/process_all/", {
      month, year, test_mode: testMode
    }),
  
  // Bulk approve
  bulkApprove: (ids = [], allEmployees = false) =>
    hrClient.post("/payroll/bulk_approve/", { ids, all_employees: allEmployees }),
  
  // Mark as paid
  markPaid: (id, transferDate, transactionId = "") =>
    hrClient.post(`/payroll/${id}/mark_paid/`, {
      transfer_date: transferDate, transaction_id: transactionId
    }),
  
  // Get payslip
  getPayslip: (id) => hrClient.get(`/payroll/${id}/payslip/`),
  
  // My payslips (ESS)
  getMyPayslips: (year) => hrClient.get("/payroll/my_payslips/", { params: { year } }),
  
  // Salary register report
  getSalaryRegister: (month, year) =>
    hrClient.get("/payroll/salary_register/", { params: { month, year, report_type: "salary_register" } }),
  
  // Department summary
  getDepartmentSummary: (month, year) =>
    hrClient.get("/payroll/department_summary/", { params: { month, year } }),
  
  // Variance report
  getVarianceReport: (month, year, prevMonth = null, prevYear = null) =>
    hrClient.get("/payroll/variance_report/", {
      params: { month, year, previous_month: prevMonth, previous_year: prevYear }
    }),
  
  // Generate bank file
  getBankFile: (month, year, format = "NEFT") =>
    hrClient.get("/payroll/bank_file/", {
      params: { month, year, transfer_mode: format },
      responseType: "blob",
    }),
  
  // Dashboard stats
  getDashboardStats: (month, year) =>
    hrClient.get("/payroll/dashboard_stats/", { params: { month, year } }),
};

// ============================================================================
// SALARY REVISION ENDPOINTS
// ============================================================================

export const salaryRevisionAPI = {
  // List revisions
  getRevisions: (filters = {}) =>
    hrClient.get("/salary-revisions/", { params: filters }),
  
  // Create revision
  createRevision: (data) => hrClient.post("/salary-revisions/", data),
  
  // Update revision
  updateRevision: (id, data) => hrClient.patch(`/salary-revisions/${id}/`, data),
  
  // Approval workflow
  approveManager: (id) => hrClient.post(`/salary-revisions/${id}/approve_manager/`),
  approveHR: (id) => hrClient.post(`/salary-revisions/${id}/approve_hr/`),
  approveFinance: (id) => hrClient.post(`/salary-revisions/${id}/approve_finance/`),
  rejectRevision: (id, reason = "") =>
    hrClient.post(`/salary-revisions/${id}/reject/`, { reason }),
  
  // Pending approvals
  getPendingApprovals: () => hrClient.get("/salary-revisions/pending_approvals/"),
};

// ============================================================================
// EMPLOYEE LOAN ENDPOINTS
// ============================================================================

export const loanAPI = {
  // List loans
  getLoans: (filters = {}) =>
    hrClient.get("/employee-loans/", { params: filters }),
  
  // Get single loan
  getLoanDetail: (id) => hrClient.get(`/employee-loans/${id}/`),
  
  // Create loan
  createLoan: (data) => hrClient.post("/employee-loans/", data),
  
  // Update loan
  updateLoan: (id, data) => hrClient.patch(`/employee-loans/${id}/`, data),
  
  // Approve/Reject/Close
  approveLoan: (id) => hrClient.post(`/employee-loans/${id}/approve/`),
  rejectLoan: (id, reason = "") => hrClient.post(`/employee-loans/${id}/reject/`, { reason }),
  closeLoan: (id) => hrClient.post(`/employee-loans/${id}/close/`),
  
  // My loans
  getMyLoans: () => hrClient.get("/employee-loans/my_loans/"),
  
  // Loan repayments
  getRepayments: (filters = {}) =>
    hrClient.get("/loan-repayments/", { params: filters }),
};

// ============================================================================
// REIMBURSEMENT ENDPOINTS
// ============================================================================

export const reimbursementAPI = {
  // List reimbursements
  getReimbursements: (filters = {}) =>
    hrClient.get("/reimbursements/", { params: filters }),
  
  // Get single
  getReimbursementDetail: (id) => hrClient.get(`/reimbursements/${id}/`),
  
  // Create
  createReimbursement: (data) =>
    hrClient.post("/reimbursements/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  
  // Update
  updateReimbursement: (id, data) =>
    hrClient.patch(`/reimbursements/${id}/`, data),
  
  // Approve/Reject/Pay
  approveReimbursement: (id) => hrClient.post(`/reimbursements/${id}/approve/`),
  rejectReimbursement: (id, reason = "") =>
    hrClient.post(`/reimbursements/${id}/reject/`, { reason }),
  markReimbursementPaid: (id) => hrClient.post(`/reimbursements/${id}/mark_paid/`),
  
  // My reimbursements
  getMyReimbursements: () => hrClient.get("/reimbursements/my_reimbursements/"),
};

// ============================================================================
// RECRUITMENT ENHANCED ENDPOINTS
// ============================================================================

export const recruitmentAPI = {
  // Job Requisitions
  getRequisitions: (filters = {}) =>
    hrClient.get("/job-requisitions/", { params: filters }),
  createRequisition: (data) => hrClient.post("/job-requisitions/", data),
  updateRequisition: (id, data) => hrClient.patch(`/job-requisitions/${id}/`, data),
  approveRequisition: (id) => hrClient.post(`/job-requisitions/${id}/approve/`),
  rejectRequisition: (id, reason) => hrClient.post(`/job-requisitions/${id}/reject/`, { reason }),
  closeRequisition: (id) => hrClient.post(`/job-requisitions/${id}/close/`),

  // Candidates
  getCandidates: (filters = {}) =>
    hrClient.get("/candidates/", { params: filters }),
  createCandidate: (data) =>
    hrClient.post("/candidates/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Job Applications (ATS Pipeline)
  getJobApplications: (filters = {}) =>
    hrClient.get("/job-applications/", { params: filters }),
  createJobApplication: (data) => hrClient.post("/job-applications/", data),
  updateApplicationStage: (id, stage) =>
    hrClient.patch(`/job-applications/${id}/`, { stage }),

  // Interview Schedules
  getInterviewSchedules: (filters = {}) =>
    hrClient.get("/interview-schedules/", { params: filters }),
  getInterviewScheduleDetail: (id) => hrClient.get(`/interview-schedules/${id}/`),
  createInterviewSchedule: (data) => hrClient.post("/interview-schedules/", data),
  updateInterviewSchedule: (id, data) => hrClient.patch(`/interview-schedules/${id}/`, data),
  cancelInterview: (id, reason) => hrClient.post(`/interview-schedules/${id}/cancel/`, { reason }),
  rescheduleInterview: (id, data) => hrClient.post(`/interview-schedules/${id}/reschedule/`, data),
  submitInterviewFeedback: (id, data) => hrClient.post(`/interview-schedules/${id}/submit_feedback/`, data),
  upcomingInterviews: (days = 7) => hrClient.get("/interview-schedules/upcoming/", { params: { days } }),

  // Offer Letters
  getOfferLetters: (filters = {}) =>
    hrClient.get("/offer-letters/", { params: filters }),
  getOfferLetterDetail: (id) => hrClient.get(`/offer-letters/${id}/`),
  createOfferLetter: (data) => hrClient.post("/offer-letters/", data),
  updateOfferLetter: (id, data) => hrClient.patch(`/offer-letters/${id}/`, data),
  sendOfferLetter: (id) => hrClient.post(`/offer-letters/${id}/send/`),
  acceptOffer: (id) => hrClient.post(`/offer-letters/${id}/accept/`),
  rejectOffer: (id, reason) => hrClient.post(`/offer-letters/${id}/reject/`, { reason }),
  generateOfferDoc: (id) => hrClient.get(`/offer-letters/${id}/generate_document/`, { responseType: "blob" }),

  // BGV Checks
  getBGVChecks: (filters = {}) =>
    hrClient.get("/bgv-checks/", { params: filters }),
  createBGvCheck: (data) => hrClient.post("/bgv-checks/", data),
  updateBGvCheck: (id, data) => hrClient.patch(`/bgv-checks/${id}/`, data),
  initiateBGV: (id, vendor) => hrClient.post(`/bgv-checks/${id}/initiate/`, { vendor_name: vendor }),
  updateBGVStatus: (id, data) => hrClient.patch(`/bgv-checks/${id}/`, data),

  // Onboarding Tasks
  getOnboardingTasks: (filters = {}) =>
    hrClient.get("/onboarding-tasks/", { params: filters }),
  createOnboardingTask: (data) => hrClient.post("/onboarding-tasks/", data),
  completeOnboardingTask: (id) => hrClient.post(`/onboarding-tasks/${id}/complete/`),
  updateOnboardingTask: (id, data) => hrClient.patch(`/onboarding-tasks/${id}/`, data),
  getOnboardingProgress: (employeeId) =>
    hrClient.get("/onboarding-tasks/progress/", { params: { employee_id: employeeId } }),
};

// ============================================================================
// EMPLOYEE PROFILE ENHANCED ENDPOINTS
// ============================================================================

export const employeeProfileAPI = {
  // Family Members
  getFamilyMembers: (employeeId) =>
    hrClient.get("/employee-family/", { params: { employee: employeeId } }),
  createFamilyMember: (data) => hrClient.post("/employee-family/", data),
  updateFamilyMember: (id, data) => hrClient.patch(`/employee-family/${id}/`, data),
  deleteFamilyMember: (id) => hrClient.delete(`/employee-family/${id}/`),

  // Emergency Contacts
  getEmergencyContacts: (employeeId) =>
    hrClient.get("/emergency-contacts/", { params: { employee: employeeId } }),
  createEmergencyContact: (data) => hrClient.post("/emergency-contacts/", data),
  updateEmergencyContact: (id, data) => hrClient.patch(`/emergency-contacts/${id}/`, data),
  deleteEmergencyContact: (id) => hrClient.delete(`/emergency-contacts/${id}/`),

  // Bank Accounts
  getBankAccounts: (employeeId) =>
    hrClient.get("/employee-bank-accounts/", { params: { employee: employeeId } }),
  createBankAccount: (data) => hrClient.post("/employee-bank-accounts/", data),
  updateBankAccount: (id, data) => hrClient.patch(`/employee-bank-accounts/${id}/`, data),
  verifyBankAccount: (id) => hrClient.post(`/employee-bank-accounts/${id}/verify/`),
  deleteBankAccount: (id) => hrClient.delete(`/employee-bank-accounts/${id}/`),

  // Document Versions
  getDocumentVersions: (documentId) =>
    hrClient.get("/document-versions/", { params: { document: documentId } }),
  createDocumentVersion: (data) =>
    hrClient.post("/document-versions/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ============================================================================
// PERFORMANCE ENHANCED ENDPOINTS
// ============================================================================

export const performanceAPI = {
  // Appraisal Cycles
  getAppraisalCycles: () => hrClient.get("/appraisal-cycles/"),
  createAppraisalCycle: (data) => hrClient.post("/appraisal-cycles/", data),
  updateAppraisalCycle: (id, data) => hrClient.patch(`/appraisal-cycles/${id}/`, data),
  closeAppraisalCycle: (id) => hrClient.post(`/appraisal-cycles/${id}/close/`),

  // Performance Goals
  getGoals: (filters = {}) =>
    hrClient.get("/performance-goals/", { params: filters }),
  createGoal: (data) => hrClient.post("/performance-goals/", data),
  updateGoal: (id, data) => hrClient.patch(`/performance-goals/${id}/`, data),
  deleteGoal: (id) => hrClient.delete(`/performance-goals/${id}/`),

  // Performance Reviews
  getReviews: (filters = {}) =>
    hrClient.get("/performance-reviews/", { params: filters }),
  createReview: (data) => hrClient.post("/performance-reviews/", data),
  updateReview: (id, data) => hrClient.patch(`/performance-reviews/${id}/`, data),
  submitSelfReview: (id, data) => hrClient.post(`/performance-reviews/${id}/submit_self/`, data),
  submitManagerReview: (id, data) => hrClient.post(`/performance-reviews/${id}/submit_manager/`, data),

  // OKRs
  getOKRs: (filters = {}) =>
    hrClient.get("/okrs/", { params: filters }),
  getOKRDetail: (id) => hrClient.get(`/okrs/${id}/`),
  createOKR: (data) => hrClient.post("/okrs/", data),
  updateOKR: (id, data) => hrClient.patch(`/okrs/${id}/`, data),
  deleteOKR: (id) => hrClient.delete(`/okrs/${id}/`),
  updateOKRProgress: (id, progress, status) =>
    hrClient.patch(`/okrs/${id}/`, { progress_pct: progress, status }),
  getMyOKRs: (cycleId) => hrClient.get("/okrs/my_okrs/", { params: { cycle_id: cycleId } }),

  // 360 Feedback
  getFeedback360: (filters = {}) =>
    hrClient.get("/feedback-360/", { params: filters }),
  createFeedback360: (data) => hrClient.post("/feedback-360/", data),
  submitFeedback360: (id, data) => hrClient.post(`/feedback-360/${id}/submit_feedback/`, data),
  getMyFeedbackRequests: () => hrClient.get("/feedback-360/my_requests/"),
  getPendingFeedback: () => hrClient.get("/feedback-360/pending_feedback/"),

  // Performance Improvement Plans (PIP)
  getPIPlans: (filters = {}) =>
    hrClient.get("/pip-plans/", { params: filters }),
  getPIPlanDetail: (id) => hrClient.get(`/pip-plans/${id}/`),
  createPIPlan: (data) => hrClient.post("/pip-plans/", data),
  updatePIPlan: (id, data) => hrClient.patch(`/pip-plans/${id}/`, data),
  extendPIPlan: (id, data) => hrClient.post(`/pip-plans/${id}/extend/`, data),
  completePIPlan: (id, outcome) => hrClient.post(`/pip-plans/${id}/complete/`, { outcome_notes: outcome }),
  terminatePIPlan: (id, reason) => hrClient.post(`/pip-plans/${id}/terminate/`, { reason }),

  // Calibration Sessions
  getCalibrationSessions: (filters = {}) =>
    hrClient.get("/calibration-sessions/", { params: filters }),
  createCalibrationSession: (data) => hrClient.post("/calibration-sessions/", data),
  updateCalibrationSession: (id, data) => hrClient.patch(`/calibration-sessions/${id}/`, data),
  startCalibrationSession: (id) => hrClient.post(`/calibration-sessions/${id}/start/`),
  completeCalibrationSession: (id) => hrClient.post(`/calibration-sessions/${id}/complete/`),
};

// ============================================================================
// TRAINING ENHANCED ENDPOINTS
// ============================================================================

export const trainingAPI = {
  // Training Programs
  getPrograms: (filters = {}) =>
    hrClient.get("/training-programs/", { params: filters }),
  createProgram: (data) => hrClient.post("/training-programs/", data),
  updateProgram: (id, data) => hrClient.patch(`/training-programs/${id}/`, data),

  // Training Nominations
  getNominations: (filters = {}) =>
    hrClient.get("/training-nominations/", { params: filters }),
  createNomination: (data) => hrClient.post("/training-nominations/", data),
  approveNomination: (id) => hrClient.post(`/training-nominations/${id}/approve/`),
  completeNomination: (id, score) => hrClient.post(`/training-nominations/${id}/complete/`, { completion_score: score }),

  // Skills
  getSkills: (filters = {}) =>
    hrClient.get("/skills/", { params: filters }),
  createSkill: (data) => hrClient.post("/skills/", data),
  updateSkill: (id, data) => hrClient.patch(`/skills/${id}/`, data),
  deleteSkill: (id) => hrClient.delete(`/skills/${id}/`),

  // Employee Skills
  getEmployeeSkills: (filters = {}) =>
    hrClient.get("/employee-skills/", { params: filters }),
  createEmployeeSkill: (data) => hrClient.post("/employee-skills/", data),
  updateEmployeeSkill: (id, data) => hrClient.patch(`/employee-skills/${id}/`, data),
  verifyEmployeeSkill: (id) => hrClient.post(`/employee-skills/${id}/verify/`),

  // Training Needs (TNI)
  getTrainingNeeds: (filters = {}) =>
    hrClient.get("/training-needs/", { params: filters }),
  createTrainingNeed: (data) => hrClient.post("/training-needs/", data),
  updateTrainingNeed: (id, data) => hrClient.patch(`/training-needs/${id}/`, data),

  // Training Assessments
  getTrainingAssessments: (filters = {}) =>
    hrClient.get("/training-assessments/", { params: filters }),
  createTrainingAssessment: (data) => hrClient.post("/training-assessments/", data),

  // Training Costs
  getTrainingCosts: (programId) =>
    hrClient.get("/training-costs/", { params: { program: programId } }),
  createTrainingCost: (data) => hrClient.post("/training-costs/", data),
};

// ============================================================================
// ESS / HELPDESK ENDPOINTS
// ============================================================================

export const helpdeskAPI = {
  // HR Tickets
  getTickets: (filters = {}) =>
    hrClient.get("/hr-tickets/", { params: filters }),
  getTicketDetail: (id) => hrClient.get(`/hr-tickets/${id}/`),
  createTicket: (data) => hrClient.post("/hr-tickets/", data),
  updateTicket: (id, data) => hrClient.patch(`/hr-tickets/${id}/`, data),
  assignTicket: (id, userId) => hrClient.post(`/hr-tickets/${id}/assign/`, { assigned_to: userId }),
  resolveTicket: (id, notes) => hrClient.post(`/hr-tickets/${id}/resolve/`, { resolution_notes: notes }),
  closeTicket: (id) => hrClient.post(`/hr-tickets/${id}/close/`),
  getMyTickets: () => hrClient.get("/hr-tickets/my_tickets/"),
  getTicketConversations: (ticketId) =>
    hrClient.get("/hr-ticket-conversations/", { params: { ticket: ticketId } }),
  addTicketConversation: (data) => hrClient.post("/hr-ticket-conversations/", data),

  // Asset Requests
  getAssetRequests: (filters = {}) =>
    hrClient.get("/asset-requests/", { params: filters }),
  getAssetRequestDetail: (id) => hrClient.get(`/asset-requests/${id}/`),
  createAssetRequest: (data) => hrClient.post("/asset-requests/", data),
  approveAssetRequest: (id) => hrClient.post(`/asset-requests/${id}/approve/`),
  allocateAsset: (id, serial) => hrClient.post(`/asset-requests/${id}/allocate/`, { asset_serial: serial }),
  returnAsset: (id) => hrClient.post(`/asset-requests/${id}/return/`),
  rejectAssetRequest: (id, reason) => hrClient.post(`/asset-requests/${id}/reject/`, { reason }),
  getMyAssetRequests: () => hrClient.get("/asset-requests/my_requests/"),

  // Investment Declarations
  getMyInvestments: () => hrClient.get("/investment-declarations/my_declarations/"),
  submitInvestmentDeclaration: (data) => hrClient.post("/investment-declarations/", data),
  approveInvestmentDeclaration: (id) => hrClient.post(`/investment-declarations/${id}/approve/`),


};

// ============================================================================
// REPORTS ENDPOINTS
// ============================================================================

export const reportsAPI = {
  // CEO Dashboard
  getCEODashboard: (year) =>
    hrClient.get("/reports/ceo-dashboard/", { params: { year } }),

  // Attrition Reports
  getAttritionReport: (year) =>
    hrClient.get("/reports/attrition/", { params: { year } }),

  // Headcount Reports
  getHeadcountReport: () => hrClient.get("/reports/headcount/"),
  getHeadcountByDepartment: () => hrClient.get("/reports/headcount/"),

  // Recruitment Analytics
  getRecruitmentAnalytics: (year) =>
    hrClient.get("/reports/recruitment-analytics/", { params: { year } }),

  // Attendance Reports
  getAttendanceReport: (month, year) =>
    hrClient.get("/reports/attendance-report/", { params: { month, year } }),

  // Leave Reports
  getLeaveReport: (month, year) =>
    hrClient.get("/reports/leave-report/", { params: { month, year } }),

  // Payroll Reports
  getPayrollReport: (month, year) =>
    hrClient.get("/reports/payroll-report/", { params: { month, year } }),
  getPayrollVariance: (month, year, prevMonth, prevYear) =>
    hrClient.get("/reports/payroll-variance/", { params: { month, year, prev_month: prevMonth, prev_year: prevYear } }),

  // Compliance Reports
  getComplianceReport: (year) =>
    hrClient.get("/reports/compliance-report/", { params: { year } }),

  // Training Reports
  getTrainingReport: (year) =>
    hrClient.get("/reports/training-report/", { params: { year } }),

  // Export
  exportReport: (reportType, filters = {}) =>
    hrClient.get("/reports/export/", { params: { type: reportType, ...filters }, responseType: "blob" }),
};

// ============================================================================
// EXIT MANAGEMENT ENDPOINTS
// ============================================================================

export const exitAPI = {
  // Resignations
  getResignations: (filters = {}) =>
    hrClient.get("/resignations/", { params: filters }),
  createResignation: (data) => hrClient.post("/resignations/", data),
  updateResignation: (id, data) => hrClient.patch(`/resignations/${id}/`, data),
  approveResignation: (id, lastWorkingDay) =>
    hrClient.post(`/resignations/${id}/approve/`, { approved_last_working_day: lastWorkingDay }),
  rejectResignation: (id, reason = "") =>
    hrClient.post(`/resignations/${id}/reject/`, { reason }),
  withdrawResignation: (id) =>
    hrClient.post(`/resignations/${id}/withdraw/`),
  myResignations: () => hrClient.get("/resignations/my_resignations/"),

  // Exit Clearances
  getExitClearances: (filters = {}) =>
    hrClient.get("/exit-clearances/", { params: filters }),
  updateClearance: (id, data) => hrClient.patch(`/exit-clearances/${id}/`, data),
  clearDepartment: (id) => hrClient.post(`/exit-clearances/${id}/clear/`),

  // Exit Interviews
  getExitInterviews: (filters = {}) =>
    hrClient.get("/exit-interviews/", { params: filters }),
  getExitInterviewDetail: (id) => hrClient.get(`/exit-interviews/${id}/`),
  createExitInterview: (data) => hrClient.post("/exit-interviews/", data),
  completeExitInterview: (id, data) => hrClient.post(`/exit-interviews/${id}/complete/`, data),
  submitExitFeedback: (id, data) => hrClient.post(`/exit-interviews/${id}/submit_feedback/`, data),

  // F&F Settlements
  getFnFSettlements: (filters = {}) =>
    hrClient.get("/fnf-settlements/", { params: filters }),
  getFnFSettlementDetail: (id) => hrClient.get(`/fnf-settlements/${id}/`),
  createFnFSettlement: (data) => hrClient.post("/fnf-settlements/", data),
  calculateFnF: (id) => hrClient.post(`/fnf-settlements/${id}/calculate/`),
  approveHrFnF: (id) => hrClient.post(`/fnf-settlements/${id}/approve_hr/`),
  approveFinanceFnF: (id) => hrClient.post(`/fnf-settlements/${id}/approve_finance/`),
  markFnFPaid: (id, paymentRef, paymentDate) =>
    hrClient.post(`/fnf-settlements/${id}/mark_paid/`, {
      payment_reference: paymentRef, payment_date: paymentDate
    }),

  // Alumni Records
  getAlumniRecords: (filters = {}) =>
    hrClient.get("/alumni-records/", { params: filters }),
  createAlumniRecord: (data) => hrClient.post("/alumni-records/", data),
  updateAlumniAccess: (id, data) => hrClient.patch(`/alumni-records/${id}/`, data),
  getAlumniDashboard: () => hrClient.get("/alumni-records/dashboard/"),
};

// ============================================================================
// STATUTORY COMPLIANCE ENDPOINTS
// ============================================================================

export const complianceAPI = {
  // PF Configuration
  getPFConfigs: () => hrClient.get("/pf-configurations/"),
  createPFConfig: (data) => hrClient.post("/pf-configurations/", data),
  updatePFConfig: (id, data) => hrClient.patch(`/pf-configurations/${id}/`, data),

  // PF Contributions
  getPFContributions: (filters = {}) =>
    hrClient.get("/pf-contributions/", { params: filters }),

  // ESI Configuration
  getESIConfigs: () => hrClient.get("/esi-configurations/"),
  createESIConfig: (data) => hrClient.post("/esi-configurations/", data),
  updateESIConfig: (id, data) => hrClient.patch(`/esi-configurations/${id}/`, data),

  // ESI Contributions
  getESIContributions: (filters = {}) =>
    hrClient.get("/esi-contributions/", { params: filters }),

  // Professional Tax Slabs
  getPTSlabs: (filters = {}) =>
    hrClient.get("/professional-tax-slabs/", { params: filters }),
  createPTSlab: (data) => hrClient.post("/professional-tax-slabs/", data),
  updatePTSlab: (id, data) => hrClient.patch(`/professional-tax-slabs/${id}/`, data),

  // PT Deductions
  getPTDeductions: (filters = {}) =>
    hrClient.get("/pt-deductions/", { params: filters }),

  // TDS Configuration
  getTDSConfigs: () => hrClient.get("/tds-configurations/"),
  createTDSConfig: (data) => hrClient.post("/tds-configurations/", data),
  updateTDSConfig: (id, data) => hrClient.patch(`/tds-configurations/${id}/`, data),

  // Investment Declarations
  getInvestmentDeclarations: (filters = {}) =>
    hrClient.get("/investment-declarations/", { params: filters }),
  createInvestmentDeclaration: (data) => hrClient.post("/investment-declarations/", data),
  approveInvestmentDeclaration: (id) =>
    hrClient.post(`/investment-declarations/${id}/approve/`),

  // TDS Calculations
  getTDSCalculations: (filters = {}) =>
    hrClient.get("/tds-calculations/", { params: filters }),

  // Gratuity Configuration
  getGratuityConfigs: () => hrClient.get("/gratuity-configurations/"),

  // Gratuity Calculations
  getGratuityCalculations: (filters = {}) =>
    hrClient.get("/gratuity-calculations/", { params: filters }),

  // Bonus Configuration
  getBonusConfigs: () => hrClient.get("/bonus-configurations/"),

  // Bonus Calculations
  getBonusCalculations: (filters = {}) =>
    hrClient.get("/bonus-calculations/", { params: filters }),

  // Compliance Calendar
  getComplianceCalendar: (filters = {}) =>
    hrClient.get("/compliance-calendar/", { params: filters }),
  getUpcomingCompliance: (days = 30) =>
    hrClient.get("/compliance-calendar/upcoming/", { params: { days } }),
  getOverdueCompliance: () =>
    hrClient.get("/compliance-calendar/overdue/"),
  markComplianceCompleted: (id, reference = "") =>
    hrClient.post(`/compliance-calendar/${id}/mark_completed/`, { reference_number: reference }),
  createComplianceEntry: (data) => hrClient.post("/compliance-calendar/", data),
};

// ============================================================================
// LWF COMPLIANCE ENDPOINTS
// ============================================================================

export const lwfAPI = {
  getConfigs: () => hrClient.get("/lwf-configurations/"),
  createConfig: (data) => hrClient.post("/lwf-configurations/", data),
  updateConfig: (id, data) => hrClient.patch(`/lwf-configurations/${id}/`, data),

  getContributions: (filters = {}) =>
    hrClient.get("/lwf-contributions/", { params: filters }),
  generateChallan: (id, reference = "") =>
    hrClient.post(`/lwf-contributions/${id}/generate_challan/`, { challan_reference: reference }),
  markPaid: (id) => hrClient.post(`/lwf-contributions/${id}/mark_paid/`),
  getPendingChallans: () => hrClient.get("/lwf-contributions/pending_challans/"),
  getSummaryByState: (year) => hrClient.get("/lwf-contributions/summary_by_state/", { params: { year } }),
};

// ============================================================================
// OVERTIME MANAGEMENT ENDPOINTS
// ============================================================================

export const overtimeAPI = {
  getRequests: (filters = {}) => hrClient.get("/overtime-requests/", { params: filters }),
  createRequest: (data) => hrClient.post("/overtime-requests/", data),
  updateRequest: (id, data) => hrClient.patch(`/overtime-requests/${id}/`, data),
  deleteRequest: (id) => hrClient.delete(`/overtime-requests/${id}/`),
  approveRequest: (id, comment = "") => hrClient.post(`/overtime-requests/${id}/approve/`, { comment }),
  rejectRequest: (id, reason = "") => hrClient.post(`/overtime-requests/${id}/reject/`, { reason }),
  getPendingApprovals: () => hrClient.get("/overtime-requests/pending_approvals/"),
  getMyOvertime: () => hrClient.get("/overtime-requests/my_overtime/"),
};

// ============================================================================
// SHIFT SWAP ENDPOINTS
// ============================================================================

export const shiftSwapAPI = {
  getRequests: (filters = {}) => hrClient.get("/shift-swap-requests/", { params: filters }),
  createRequest: (data) => hrClient.post("/shift-swap-requests/", data),
  updateRequest: (id, data) => hrClient.patch(`/shift-swap-requests/${id}/`, data),
  giveConsent: (id, accepted, reason = "") =>
    hrClient.post(`/shift-swap-requests/${id}/give_consent/`, { accepted, reason }),
  approveRequest: (id) => hrClient.post(`/shift-swap-requests/${id}/approve/`),
  rejectRequest: (id, reason = "") => hrClient.post(`/shift-swap-requests/${id}/reject/`, { reason }),
  withdrawRequest: (id) => hrClient.post(`/shift-swap-requests/${id}/withdraw/`),
  getPendingConsent: () => hrClient.get("/shift-swap-requests/pending_consent/"),
};

// ============================================================================
// ATTENDANCE REGULARIZATION ENDPOINTS
// ============================================================================

export const regularizationAPI = {
  getRequests: (filters = {}) => hrClient.get("/attendance-regularization/", { params: filters }),
  createRequest: (data) => hrClient.post("/attendance-regularization/", data),
  updateRequest: (id, data) => hrClient.patch(`/attendance-regularization/${id}/`, data),
  approveRequest: (id, comment = "") =>
    hrClient.post(`/attendance-regularization/${id}/approve/`, { comment }),
  rejectRequest: (id, reason = "") =>
    hrClient.post(`/attendance-regularization/${id}/reject/`, { reason }),
  getPendingApprovals: () => hrClient.get("/attendance-regularization/pending_approvals/"),
  getMyRequests: () => hrClient.get("/attendance-regularization/my_requests/"),
};

// ============================================================================
// POSH (SEXUAL HARASSMENT) COMPLAINTS ENDPOINTS
// ============================================================================

export const poshAPI = {
  getComplaints: (filters = {}) =>
    hrClient.get("/posh-complaints/", { params: filters }),
  getComplaintDetail: (id) => hrClient.get(`/posh-complaints/${id}/`),
  createComplaint: (data) => 
    hrClient.post("/posh-complaints/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateComplaint: (id, data) => hrClient.patch(`/posh-complaints/${id}/`, data),
  submitComplaint: (id) => hrClient.post(`/posh-complaints/${id}/submit/`),
  startInquiry: (id, data) => hrClient.post(`/posh-complaints/${id}/start_inquiry/`, data),
  completeInquiry: (id, data) => hrClient.post(`/posh-complaints/${id}/complete_inquiry/`, data),
  resolveComplaint: (id, data) => hrClient.post(`/posh-complaints/${id}/resolve/`, data),
  addInquiryNote: (id, data) => 
    hrClient.post(`/posh-complaints/${id}/add_inquiry_note/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getDashboard: () => hrClient.get("/posh-complaints/dashboard/"),

  // Inquiry Notes
  getInquiryNotes: (filters = {}) =>
    hrClient.get("/posh-inquiry-notes/", { params: filters }),
  createInquiryNote: (data) => hrClient.post("/posh-inquiry-notes/", data),
};

// ============================================================================
// DATA PRIVACY CONSENT (DPDP ACT) ENDPOINTS
// ============================================================================

export const consentAPI = {
  getRecords: (filters = {}) =>
    hrClient.get("/data-consents/", { params: filters }),
  getRecordDetail: (id) => hrClient.get(`/data-consents/${id}/`),
  createRecord: (data) => hrClient.post("/data-consents/", data),
  updateRecord: (id, data) => hrClient.patch(`/data-consents/${id}/`, data),
  grantConsent: (id) => hrClient.post(`/data-consents/${id}/grant/`),
  withdrawConsent: (id) => hrClient.post(`/data-consents/${id}/withdraw/`),
  getMyConsents: () => hrClient.get("/data-consents/my_consents/"),
  getComplianceReport: () => hrClient.get("/data-consents/compliance_report/"),
};

// ============================================================================
// STAY INTERVIEW ENDPOINTS
// ============================================================================

export const stayInterviewAPI = {
  getInterviews: (filters = {}) =>
    hrClient.get("/stay-interviews/", { params: filters }),
  getInterviewDetail: (id) => hrClient.get(`/stay-interviews/${id}/`),
  createInterview: (data) => hrClient.post("/stay-interviews/", data),
  updateInterview: (id, data) => hrClient.patch(`/stay-interviews/${id}/`, data),
  deleteInterview: (id) => hrClient.delete(`/stay-interviews/${id}/`),
  getHighRisk: () => hrClient.get("/stay-interviews/high_risk/"),
  getRetentionSummary: () => hrClient.get("/stay-interviews/retention_summary/"),
};

// ============================================================================
// SALARY FREEZE ENDPOINTS
// ============================================================================

export const salaryFreezeAPI = {
  getFreezes: (filters = {}) =>
    hrClient.get("/salary-freezes/", { params: filters }),
  getFreezeDetail: (id) => hrClient.get(`/salary-freezes/${id}/`),
  createFreeze: (data) => hrClient.post("/salary-freezes/", data),
  updateFreeze: (id, data) => hrClient.patch(`/salary-freezes/${id}/`, data),
  unfreeze: (id, reason) => hrClient.post(`/salary-freezes/${id}/unfreeze/`, { reason }),
  getActiveFreezes: () => hrClient.get("/salary-freezes/active_freezes/"),
};

// ============================================================================
// BULK SALARY REVISION UPLOAD ENDPOINTS
// ============================================================================

export const bulkSalaryRevisionAPI = {
  uploadExcel: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return hrClient.post("/bulk-salary-revisions/upload_excel/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default hrClient;

// ============================================================================
// DATA SECURITY & DEDUP ENDPOINTS
// ============================================================================

export const securityAPI = {
  // IP Access Restrictions
  getRestrictions: (filters = {}) =>
    hrClient.get("/ip-access-restrictions/", { params: filters }),
  getRestrictionDetail: (id) => hrClient.get(`/ip-access-restrictions/${id}/`),
  createRestriction: (data) => hrClient.post("/ip-access-restrictions/", data),
  updateRestriction: (id, data) => hrClient.patch(`/ip-access-restrictions/${id}/`, data),
  deleteRestriction: (id) => hrClient.delete(`/ip-access-restrictions/${id}/`),
  checkIP: (ipAddress, module) =>
    hrClient.get("/ip-access-restrictions/check_ip/", { params: { ip_address: ipAddress, module } }),
  validateRestrictions: () => hrClient.get("/ip-access-restrictions/validate_restrictions/"),

  // Data Retention
  getRetentionSummary: () => hrClient.get("/data-retention/summary/"),
  getPurgableRecords: (dataType) =>
    hrClient.get("/data-retention/purgable/", { params: { data_type: dataType } }),

  // Dedup
  checkDuplicates: (data) => hrClient.post("/employees/check_duplicates/", data),
  bulkDedupCheck: (employeeIds = []) =>
    hrClient.post("/employees/bulk_dedup_check/", { employee_ids: employeeIds }),
};

// ============================================================================
// STATUTORY FORMS & COMPLIANCE ENHANCED ENDPOINTS
// ============================================================================

export const statutoryFormsAPI = {
  // VPF Contributions
  getVPFContributions: (filters = {}) =>
    hrClient.get("/vpf-contributions/", { params: filters }),
  createVPFContribution: (data) => hrClient.post("/vpf-contributions/", data),
  updateVPFContribution: (id, data) => hrClient.patch(`/vpf-contributions/${id}/`, data),
  getMyVPF: () => hrClient.get("/vpf-contributions/my_vpf/"),

  // PF Statements (Form 2, 10C, 10D, 19, 31, 13, 11)
  getPFStatements: (filters = {}) =>
    hrClient.get("/pf-statements/", { params: filters }),
  getPFStatementDetail: (id) => hrClient.get(`/pf-statements/${id}/`),
  createPFStatement: (data) =>
    hrClient.post("/pf-statements/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePFStatement: (id, data) =>
    hrClient.patch(`/pf-statements/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePFStatementStatus: (id, data) =>
    hrClient.post(`/pf-statements/${id}/update_status/`, data),
  getPendingPFForms: () => hrClient.get("/pf-statements/pending_forms/"),
  getPFByFormType: (formType) =>
    hrClient.get("/pf-statements/by_form_type/", { params: { form_type: formType } }),

  // ESI Cards
  getESICards: (filters = {}) =>
    hrClient.get("/esi-cards/", { params: filters }),
  getESICardDetail: (id) => hrClient.get(`/esi-cards/${id}/`),
  createESICard: (data) =>
    hrClient.post("/esi-cards/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateESICard: (id, data) => hrClient.patch(`/esi-cards/${id}/`, data),
  verifyESICard: (id) => hrClient.post(`/esi-cards/${id}/verify/`),

  // Lower Deduction Certificates (Form 15G/15H)
  getCertificates: (filters = {}) =>
    hrClient.get("/lower-deduction-certificates/", { params: filters }),
  getCertificateDetail: (id) => hrClient.get(`/lower-deduction-certificates/${id}/`),
  createCertificate: (data) =>
    hrClient.post("/lower-deduction-certificates/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateCertificate: (id, data) =>
    hrClient.patch(`/lower-deduction-certificates/${id}/`, data),
  verifyCertificate: (id, remarks) =>
    hrClient.post(`/lower-deduction-certificates/${id}/verify/`, { remarks }),
  getMyCertificates: () => hrClient.get("/lower-deduction-certificates/my_certificates/"),

  // PT Enrollments
  getPTEnrollments: (filters = {}) =>
    hrClient.get("/pt-enrollments/", { params: filters }),
  createPTEnrollment: (data) =>
    hrClient.post("/pt-enrollments/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePTEnrollment: (id, data) => hrClient.patch(`/pt-enrollments/${id}/`, data),

  // International Workers
  getInternationalWorkers: (filters = {}) =>
    hrClient.get("/international-workers/", { params: filters }),
  createInternationalWorker: (data) => hrClient.post("/international-workers/", data),
  updateInternationalWorker: (id, data) => hrClient.patch(`/international-workers/${id}/`, data),

  // Form 12BA (Perquisites)
  getForm12BA: (filters = {}) =>
    hrClient.get("/form-12ba/", { params: filters }),
  createForm12BAEntry: (data) => hrClient.post("/form-12ba/", data),
  updateForm12BAEntry: (id, data) => hrClient.patch(`/form-12ba/${id}/`, data),
  deleteForm12BAEntry: (id) => hrClient.delete(`/form-12ba/${id}/`),
  getPerquisiteSummary: (employeeId, financialYear) =>
    hrClient.get("/form-12ba/perquisite_summary/", {
      params: { employee_id: employeeId, financial_year: financialYear },
    }),

  // Form 24Q (TDS Quarterly Returns)
  getForm24QReturns: (filters = {}) =>
    hrClient.get("/form-24q-returns/", { params: filters }),
  getForm24QReturnDetail: (id) => hrClient.get(`/form-24q-returns/${id}/`),
  createForm24QReturn: (data) => hrClient.post("/form-24q-returns/", data),
  updateForm24QReturn: (id, data) => hrClient.patch(`/form-24q-returns/${id}/`, data),
  markForm24QFiled: (id, data) => hrClient.post(`/form-24q-returns/${id}/mark_filed/`, data),
  getPending24QReturns: () => hrClient.get("/form-24q-returns/pending_returns/"),
  getCurrentYear24Q: () => hrClient.get("/form-24q-returns/current_year/"),
};

// ============================================================================
// RECRUITMENT ENHANCED ENDPOINTS (IJP, Referral, Pre-Joining, Buddy)
// ============================================================================

export const recruitmentEnhancedAPI = {
  // Internal Job Postings (IJP)
  getInternalJobPostings: (filters = {}) =>
    hrClient.get("/internal-job-postings/", { params: filters }),
  getInternalJobPostingDetail: (id) => hrClient.get(`/internal-job-postings/${id}/`),
  createInternalJobPosting: (data) => hrClient.post("/internal-job-postings/", data),
  updateInternalJobPosting: (id, data) => hrClient.patch(`/internal-job-postings/${id}/`, data),
  publishInternalJobPosting: (id) => hrClient.post(`/internal-job-postings/${id}/publish/`),
  closeInternalJobPosting: (id) => hrClient.post(`/internal-job-postings/${id}/close/`),
  getOpenPositions: () => hrClient.get("/internal-job-postings/open_positions/"),

  // Internal Job Applications
  getInternalJobApplications: (filters = {}) =>
    hrClient.get("/internal-job-applications/", { params: filters }),
  createInternalJobApplication: (data) => hrClient.post("/internal-job-applications/", data),
  shortlistInternalApplicant: (id) => hrClient.post(`/internal-job-applications/${id}/shortlist/`),
  rejectInternalApplicant: (id) => hrClient.post(`/internal-job-applications/${id}/reject/`),
  endorseInternalApplicant: (id, endorsed, comment) =>
    hrClient.post(`/internal-job-applications/${id}/manager_endorse/`, { endorsed, comment }),

  // Employee Referrals
  getReferrals: (filters = {}) => hrClient.get("/employee-referrals/", { params: filters }),
  getReferralDetail: (id) => hrClient.get(`/employee-referrals/${id}/`),
  createReferral: (data) => hrClient.post("/employee-referrals/", data),
  updateReferralStatus: (id, data) => hrClient.post(`/employee-referrals/${id}/update_status/`, data),
  getMyReferrals: () => hrClient.get("/employee-referrals/my_referrals/"),
  getReferralDashboardStats: () => hrClient.get("/employee-referrals/dashboard_stats/"),

  // Onboarding Buddies
  getBuddies: (filters = {}) => hrClient.get("/onboarding-buddies/", { params: filters }),
  createBuddy: (data) => hrClient.post("/onboarding-buddies/", data),
  updateBuddy: (id, data) => hrClient.patch(`/onboarding-buddies/${id}/`, data),
  completeBuddy: (id, data) => hrClient.post(`/onboarding-buddies/${id}/complete/`, data),
  getActiveBuddies: () => hrClient.get("/onboarding-buddies/active_buddies/"),

  // Pre-Joining Documents
  getPreJoiningDocs: (filters = {}) => hrClient.get("/pre-joining-documents/", { params: filters }),
  createPreJoiningDoc: (data) => hrClient.post("/pre-joining-documents/", data),
  sendWelcomeEmail: (id) => hrClient.post(`/pre-joining-documents/${id}/send_welcome/`),
  getPendingPortals: () => hrClient.get("/pre-joining-documents/pending_portals/"),
  getOnboardingCompletion: () => hrClient.get("/pre-joining-documents/onboarding_completion/"),

  // Onboarding Feedback
  getFeedbacks: (filters = {}) => hrClient.get("/onboarding-feedbacks/", { params: filters }),
  createFeedback: (data) => hrClient.post("/onboarding-feedbacks/", data),
  getFeedbackSummary: () => hrClient.get("/onboarding-feedbacks/summary/"),
};
