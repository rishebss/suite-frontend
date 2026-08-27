export const MEETING_STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'ended', label: 'Ended' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const MEETING_STATUS_STYLES = {
  upcoming: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  live: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  ended: 'text-white/40 bg-white/5 border-white/10',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function getMeetingStatusTextColor(status) {
  switch (status) {
    case 'live': return 'text-emerald-400';
    case 'cancelled': return 'text-red-400';
    case 'ended': return 'text-white/40';
    default: return 'text-blue-400';
  }
}

export function getMeetingStatusDropdownItemStyle(status, isSelected) {
  if (isSelected) {
    switch (status) {
      case 'live': return 'bg-emerald-500/10 text-emerald-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      case 'ended': return 'bg-white/5 text-white/40';
      default: return 'bg-blue-500/10 text-blue-400';
    }
  }
  switch (status) {
    case 'live': return 'text-emerald-400/60 hover:bg-emerald-500/10';
    case 'cancelled': return 'text-red-400/60 hover:bg-red-500/10';
    case 'ended': return 'text-white/20 hover:bg-white/5';
    default: return 'text-blue-400/60 hover:bg-blue-500/10';
  }
}

export function getMeetingStatusDotColor(status) {
  switch (status) {
    case 'live': return 'bg-emerald-400';
    case 'cancelled': return 'bg-red-400';
    case 'ended': return 'bg-white/20';
    default: return 'bg-blue-400';
  }
}

export const EVENT_STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'ended', label: 'Ended' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const EVENT_STATUS_STYLES = {
  upcoming: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  live: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  ended: 'text-white/40 bg-white/5 border-white/10',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function getEventStatusTextColor(status) {
  switch (status) {
    case 'live': return 'text-emerald-400';
    case 'cancelled': return 'text-red-400';
    case 'ended': return 'text-white/40';
    default: return 'text-blue-400';
  }
}

export function getEventStatusDropdownItemStyle(status, isSelected) {
  if (isSelected) {
    switch (status) {
      case 'live': return 'bg-emerald-500/10 text-emerald-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      case 'ended': return 'bg-white/5 text-white/40';
      default: return 'bg-blue-500/10 text-blue-400';
    }
  }
  switch (status) {
    case 'live': return 'text-emerald-400/60 hover:bg-emerald-500/10';
    case 'cancelled': return 'text-red-400/60 hover:bg-red-500/10';
    case 'ended': return 'text-white/20 hover:bg-white/5';
    default: return 'text-blue-400/60 hover:bg-blue-500/10';
  }
}

export function getEventStatusDotColor(status) {
  switch (status) {
    case 'live': return 'bg-emerald-400';
    case 'cancelled': return 'bg-red-400';
    case 'ended': return 'bg-white/20';
    default: return 'bg-blue-400';
  }
}

export const FOLLOWUP_STATUS_OPTIONS = [
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'complete', label: 'Complete' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const FOLLOWUP_STATUS_STYLES = {
  follow_up: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  complete: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  failed: 'text-red-400 bg-red-500/10 border-red-500/20',
  cancelled: 'text-white/40 bg-white/5 border-white/10',
};

export function getFollowUpStatusTextColor(status) {
  switch (status) {
    case 'failed': return 'text-red-400';
    case 'complete': return 'text-emerald-400';
    case 'cancelled': return 'text-white/40';
    default: return 'text-blue-400';
  }
}

export function getFollowUpStatusDropdownItemStyle(status, isSelected) {
  if (isSelected) {
    switch (status) {
      case 'failed': return 'bg-red-500/10 text-red-400';
      case 'complete': return 'bg-emerald-500/10 text-emerald-400';
      case 'cancelled': return 'bg-white/5 text-white/40';
      default: return 'bg-blue-500/10 text-blue-400';
    }
  }
  switch (status) {
    case 'failed': return 'text-red-400/60 hover:bg-red-500/10';
    case 'complete': return 'text-emerald-400/60 hover:bg-emerald-500/10';
    case 'cancelled': return 'text-white/20 hover:bg-white/5';
    default: return 'text-blue-400/60 hover:bg-blue-500/10';
  }
}

export function getFollowUpStatusDotColor(status) {
  switch (status) {
    case 'failed': return 'bg-red-400';
    case 'complete': return 'bg-emerald-400';
    case 'cancelled': return 'bg-white/20';
    default: return 'bg-blue-400';
  }
}

export const TASK_STATUS_OPTIONS = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'progress', label: 'Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'approved', label: 'Approved' },
];

export const TASK_STATUS_STYLES = {
  completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  on_hold: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  overdue: 'text-red-400 bg-red-500/10 border-red-500/20',
  canceled: 'text-red-400 bg-red-500/10 border-red-500/20',
  approved: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

export function getTaskStatusTextColor(status) {
  switch (status) {
    case 'completed': return 'text-emerald-400';
    case 'progress': return 'text-blue-400';
    case 'canceled': return 'text-red-400';
    case 'on_hold': return 'text-amber-400';
    case 'overdue': return 'text-red-400';
    default: return 'text-white/60';
  }
}
