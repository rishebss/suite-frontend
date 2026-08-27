import React from 'react';

const STATUS_CONFIG = {
  draft:     { label: 'Draft',            className: 'bg-white/10 text-white/60 border-white/10' },
  pending:   { label: 'Pending Approval', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  approved:  { label: 'Approved',         className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected:  { label: 'Rejected',         className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  completed: { label: 'Completed',        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

/**
 * Pill badge that maps an invoice status string to a styled label.
 * @param {string} status
 */
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-white/10 text-white/60' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
