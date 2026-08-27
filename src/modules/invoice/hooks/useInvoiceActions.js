import { useState } from 'react';
import { invoiceApi } from '../api/invoiceApi';

/**
 * Provides create / update / submit / approve / reject / download actions.
 * Each action returns { success, data, message } so the calling component
 * can handle navigation and toast feedback consistently.
 */
export function useInvoiceActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const _wrap = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      return { success: true, data: res.data.data, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong.';
      const errors = err.response?.data?.errors || null;
      setError(msg);
      return { success: false, message: msg, errors };
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = (data) => _wrap(() => invoiceApi.create(data));

  const updateInvoice = (id, data, partial = true) =>
    _wrap(() => invoiceApi.update(id, data, partial));

  const deleteInvoice = (id) => _wrap(() => invoiceApi.remove(id));

  const submitInvoice = (id, notes = '') =>
    _wrap(() => invoiceApi.submit(id, { notes }));

  const approveInvoice = (id, note = '') =>
    _wrap(() => invoiceApi.approve(id, { note }));

  const rejectInvoice = (id, admin_remarks, note = '') =>
    _wrap(() => invoiceApi.reject(id, { admin_remarks, note }));

  const downloadPDF = async (id, invoiceNumber) => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoiceApi.download(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber || id}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      let msg = 'Failed to download PDF.';
      try {
        const text = await err.response?.data?.text?.();
        if (text) msg = JSON.parse(text)?.message || msg;
      } catch (_) {}
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    submitInvoice,
    approveInvoice,
    rejectInvoice,
    downloadPDF,
  };
}
