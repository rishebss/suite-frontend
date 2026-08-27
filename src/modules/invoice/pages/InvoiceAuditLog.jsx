import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ACTION_LABELS = {
  invoice_create:   { label: 'Created',    color: 'bg-emerald-500/20 text-emerald-400' },
  invoice_update:   { label: 'Updated',    color: 'bg-blue-500/20 text-blue-400' },
  invoice_delete:   { label: 'Deleted',    color: 'bg-red-500/20 text-red-400' },
  invoice_submit:   { label: 'Submitted',  color: 'bg-yellow-500/20 text-yellow-400' },
  invoice_approve:  { label: 'Approved',   color: 'bg-emerald-500/20 text-emerald-400' },
  invoice_reject:   { label: 'Rejected',   color: 'bg-red-500/20 text-red-400' },
  invoice_download: { label: 'Downloaded', color: 'bg-purple-500/20 text-purple-400' },
};

const InvoiceAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (actionFilter) params.append('action', actionFilter);
        if (search) params.append('invoice_number', search);
        const res = await axios.get(`/api/invoices/audit-logs/?${params}`);
        setLogs(res.data.data || []);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search, actionFilter]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Invoice Audit Log</h1>
        <p className="text-white/40 text-sm mt-1">Track every action performed on invoices</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search invoice number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 w-56"
        />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30"
        >
          <option value="">All Actions</option>
          {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
            <option key={key} value={key} className="bg-gray-900">{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Timestamp</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Performed By</th>
                <th className="text-left px-4 py-3">Invoice No.</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-right px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/30">Loading…</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/30">No audit logs found</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const meta = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-white/10 text-white/50' };
                  return (
                    <tr key={log.id} className="text-white/70 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-white/40 text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white/80 text-xs">{log.performed_by?.name}</div>
                        <div className="text-white/30 text-xs">{log.performed_by?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white/70">
                        {log.invoice_number || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white/80 text-xs">{log.client_name || '—'}</div>
                        <div className="text-white/30 text-xs">{log.client_email || ''}</div>
                      </td>
                      <td className="px-5 py-3 text-right text-xs">
                        {log.grand_total ? `₹ ${Number(log.grand_total).toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAuditLog;
