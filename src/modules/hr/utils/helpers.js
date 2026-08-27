import { format, parse, differenceInDays, addDays } from "date-fns";

// ============================================================================
// DATE UTILITIES
// ============================================================================

export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy");
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  try {
    const date = new Date(dateTimeString);
    return format(date, "dd MMM yyyy HH:mm");
  } catch {
    return dateTimeString;
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return "";
  return timeString; // HH:MM format from backend
};

export const calculateDays = (fromDate, toDate) => {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = differenceInDays(to, from) + 1; // +1 to include both days
    return days > 0 ? days : 0;
  } catch {
    return 0;
  }
};

// ============================================================================
// CURRENCY UTILITIES
// ============================================================================

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCurrencyShort = (amount) => {
  if (!amount && amount !== 0) return "₹0";
  if (amount >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(1)}Cr`;
  }
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const regex = /^[6-9]\d{9}$/; // Indian phone number
  return regex.test(phone.replace(/\D/g, ""));
};

export const validatePAN = (pan) => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan.toUpperCase());
};

export const validateAadhaar = (aadhaar) => {
  const regex = /^\d{12}$/;
  return regex.test(aadhaar);
};

export const validateIFSC = (ifsc) => {
  const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return regex.test(ifsc);
};

// ============================================================================
// STATUS UTILITIES
// ============================================================================

export const getStatusColor = (status) => {
  const statusMap = {
    ACTIVE: "text-green-600",
    PENDING: "text-yellow-600",
    APPROVED: "text-blue-600",
    REJECTED: "text-red-600",
    CANCELLED: "text-gray-600",
    ONBOARDING: "text-purple-600",
    NOTICE_PERIOD: "text-orange-600",
    SEPARATED: "text-red-600",
    PRESENT: "text-green-600",
    ABSENT: "text-red-600",
    HALF_DAY: "text-yellow-600",
    WFH: "text-blue-600",
  };
  return statusMap[status?.toUpperCase()] || "text-gray-600";
};

export const getStatusBgColor = (status) => {
  const statusMap = {
    ACTIVE: "bg-green-100",
    PENDING: "bg-yellow-100",
    APPROVED: "bg-blue-100",
    REJECTED: "bg-red-100",
    CANCELLED: "bg-gray-100",
    ONBOARDING: "bg-purple-100",
    NOTICE_PERIOD: "bg-orange-100",
    SEPARATED: "bg-red-100",
    PRESENT: "bg-green-100",
    ABSENT: "bg-red-100",
    HALF_DAY: "bg-yellow-100",
    WFH: "bg-blue-100",
  };
  return statusMap[status?.toUpperCase()] || "bg-gray-100";
};

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1;
  }
  return age;
};

export const calculateServiceYears = (dateOfJoining) => {
  const today = new Date();
  const joinDate = new Date(dateOfJoining);
  const years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < joinDate.getDate())
  ) {
    return years - 1;
  }
  return years;
};

export const calculateWorkingHours = (
  checkInTime,
  checkOutTime,
  breakDuration = 60,
) => {
  if (!checkInTime || !checkOutTime) return 0;

  const [inHours, inMinutes] = checkInTime.split(":").map(Number);
  const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

  const inTotal = inHours * 60 + inMinutes;
  const outTotal = outHours * 60 + outMinutes;

  const diff = outTotal - inTotal - breakDuration;
  return diff / 60; // Return hours
};

// ============================================================================
// REPORT GENERATION
// ============================================================================

export const downloadCSV = (data, filename = "report.csv") => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
};

export const downloadPDF = (filename = "report.pdf") => {
  // This would require a PDF library like jsPDF
  console.log("PDF download not yet implemented");
};

// ============================================================================
// NOTIFICATION UTILITIES
// ============================================================================

export const getNearbyDates = (daysBeforeEvent = 7) => {
  const today = new Date();
  const futureDate = addDays(today, daysBeforeEvent);
  return { today, futureDate };
};

export const getUpcomingBirthdays = (employees, days = 30) => {
  const { today, futureDate } = getNearbyDates(days);

  return employees.filter((emp) => {
    if (!emp.date_of_birth) return false;
    const dob = new Date(emp.date_of_birth);
    const birthdayThisYear = new Date(
      today.getFullYear(),
      dob.getMonth(),
      dob.getDate(),
    );

    // If birthday has passed this year, check next year
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    return birthdayThisYear >= today && birthdayThisYear <= futureDate;
  });
};

export const getUpcomingAnniversaries = (employees, days = 30) => {
  const { today, futureDate } = getNearbyDates(days);

  return employees.filter((emp) => {
    if (!emp.date_of_joining) return false;
    const doj = new Date(emp.date_of_joining);
    const anniversaryThisYear = new Date(
      today.getFullYear(),
      doj.getMonth(),
      doj.getDate(),
    );

    // If anniversary has passed this year, check next year
    if (anniversaryThisYear < today) {
      anniversaryThisYear.setFullYear(today.getFullYear() + 1);
    }

    return anniversaryThisYear >= today && anniversaryThisYear <= futureDate;
  });
};

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};
