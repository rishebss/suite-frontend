const BUSINESS_HOURS_DEFAULTS = {
  timezone: "Asia/Kolkata",
  days: {
    mon: { start: "09:00", end: "18:00" },
    tue: { start: "09:00", end: "18:00" },
    wed: { start: "09:00", end: "18:00" },
    thu: { start: "09:00", end: "18:00" },
    fri: { start: "09:00", end: "18:00" },
    sat: { start: "10:00", end: "14:00" },
    sun: null,
  },
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const calculateBusinessMinutesBetween = (start, end, businessHours = BUSINESS_HOURS_DEFAULTS) => {
  let totalMinutes = 0;
  const current = new Date(start);

  while (current < end) {
    const dayKey = DAY_KEYS[current.getDay()];
    const dayConfig = businessHours.days[dayKey];
    if (!dayConfig) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const [startH, startM] = dayConfig.start.split(":").map(Number);
    const [endH, endM] = dayConfig.end.split(":").map(Number);
    const dayStart = new Date(current);
    dayStart.setHours(startH, startM, 0, 0);
    const dayEnd = new Date(current);
    dayEnd.setHours(endH, endM, 0, 0);

    const effectiveStart = new Date(Math.max(current.getTime(), dayStart.getTime()));
    const effectiveEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));

    if (effectiveStart < effectiveEnd) {
      totalMinutes += (effectiveEnd - effectiveStart) / (1000 * 60);
    }

    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return totalMinutes;
};

export const isSlaBreached = (dueAt) => {
  if (!dueAt) return false;
  return new Date(dueAt) < new Date();
};

export const getSlaStatus = (responseDueAt, resolutionDueAt, firstRespondedAt, statusCategory) => {
  if (statusCategory === "done") return "RESOLVED";

  if (responseDueAt && !firstRespondedAt) {
    if (new Date(responseDueAt) < new Date()) return "BREACHED";
  }

  if (resolutionDueAt && statusCategory !== "done") {
    if (new Date(resolutionDueAt) < new Date()) return "BREACHED";
  }

  const warningThreshold = 0.2;
  if (responseDueAt && !firstRespondedAt) {
    const remaining = (new Date(responseDueAt) - new Date()) / (1000 * 60);
    const total = (new Date(responseDueAt) - new Date(responseDueAt)) / (1000 * 60);
    const policyMinutes = responseDueAt ? 60 : 1440;
    if (remaining > 0 && remaining <= policyMinutes * warningThreshold) return "WARNING";
  }

  if (resolutionDueAt && statusCategory !== "done") {
    const remaining = (new Date(resolutionDueAt) - new Date()) / (1000 * 60);
    const policyMinutes = resolutionDueAt ? 1440 : 1440;
    if (remaining > 0 && remaining <= policyMinutes * warningThreshold) return "WARNING";
  }

  return "WITHIN_SLA";
};

export const formatSlaTimer = (dueAt) => {
  if (!dueAt) return null;
  const remaining = (new Date(dueAt) - new Date()) / 1000;
  if (remaining <= 0) return "Overdue";

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const getSlaColor = (status) => {
  switch (status) {
    case "BREACHED": return "text-red-400";
    case "WARNING": return "text-amber-400";
    case "WITHIN_SLA": return "text-emerald-400";
    case "PAUSED": return "text-zinc-400";
    case "RESOLVED": return "text-blue-400";
    default: return "text-white/30";
  }
};

export const getSlaBgColor = (status) => {
  switch (status) {
    case "BREACHED": return "bg-red-500/10 border-red-500/30";
    case "WARNING": return "bg-amber-500/10 border-amber-500/30";
    case "WITHIN_SLA": return "bg-emerald-500/10 border-emerald-500/30";
    case "PAUSED": return "bg-zinc-800 border-zinc-700";
    case "RESOLVED": return "bg-blue-500/10 border-blue-500/30";
    default: return "bg-zinc-900/40 border-zinc-800";
  }
};
