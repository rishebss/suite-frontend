import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import Toast from "../components/Toast";

const HRContext = createContext();

export const HRProvider = ({ children }) => {
  // Employee data
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Attendance data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Leave data
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);

  // Payroll data
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employeeSalary, setEmployeeSalary] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Master data
  const [designations, setDesignations] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    department: null,
    location: null,
    status: null,
  });

  // Utility functions
  const updateEmployees = useCallback((data) => {
    setEmployees(data);
    setError(null);
  }, []);

  const updateAttendance = useCallback((data) => {
    setAttendanceRecords(data);
    setError(null);
  }, []);

  const updateLeaveApplications = useCallback((data) => {
    setLeaveApplications(data);
    setError(null);
  }, []);

  const updateLeaveBalance = useCallback((data) => {
    setLeaveBalance(data);
    setError(null);
  }, []);

  const updatePayroll = useCallback((data) => {
    setPayrollRecords(data);
    setError(null);
  }, []);

  const setLoadingState = useCallback((state) => {
    setLoading(state);
  }, []);

  const setErrorState = useCallback((err) => {
    setError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Toast state
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const showToast = useCallback((message, type = "error", duration = 4000) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateMasterData = useCallback((type, data) => {
    switch (type) {
      case "designations":
        setDesignations(data);
        break;
      case "workLocations":
        setWorkLocations(data);
        break;
      case "shifts":
        setShifts(data);
        break;
      case "holidays":
        setHolidays(data);
        break;
      default:
        break;
    }
  }, []);

  const value = {
    // Employee data
    employees,
    selectedEmployee,
    updateEmployees,
    setSelectedEmployee,

    // Attendance data
    attendanceRecords,
    todayAttendance,
    updateAttendance,
    setTodayAttendance,

    // Leave data
    leaveApplications,
    leaveBalance,
    leaveTypes,
    updateLeaveApplications,
    updateLeaveBalance,
    setLeaveTypes,

    // Payroll data
    payrollRecords,
    employeeSalary,
    updatePayroll,
    setEmployeeSalary,

    // Loading and error
    loading,
    error,
    setLoadingState,
    setErrorState,
    clearError,

    // Toast
    toasts,
    showToast,
    dismissToast,

    // Master data
    designations,
    workLocations,
    shifts,
    holidays,
    updateMasterData,

    // Filters
    filters,
    setFilters,
  };

  return (
    <HRContext.Provider value={value}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
          {toasts.map(t => (
            <Toast key={t.id} {...t} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error("useHR must be used within HRProvider");
  }
  return context;
};
